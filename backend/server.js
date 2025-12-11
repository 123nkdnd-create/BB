const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));
app.use(express.json());

const uri = process.env.ATLAS_URI;
if (!uri) {
  console.error("ATLAS_URI environment variable is not defined");
}

// Mongoose connection with error handling that doesn't crash the process
mongoose.connect(uri)
  .then(() => console.log("MongoDB database connection established successfully"))
  .catch(err => console.error("MongoDB connection error: ", err));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});


// Donor / domain models
const donorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, unique: true, sparse: true },
  aadhaar: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  bloodType: { type: String, required: true },
  address: { type: String, required: true },
  age: { type: Number, required: true },
  weight: { type: Number, required: true },
  lastDonation: { type: String, default: 'Never' },
  status: { type: String, default: 'Eligible' },
  donateConsent: { type: String, enum: ['Yes','No'], default: 'No' },
  nextEligibleDate: { type: Date, default: null },
  totalDonations: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  profilePhotoUrl: { type: String, default: '' }
});

const Donor = mongoose.model('Donor', donorSchema);

// Track individual donation records per donor
const donationSchema = new mongoose.Schema({
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'Donor', required: true },
  donorName: { type: String, required: true },
  amount: { type: Number, required: true }, // in units or ml as per your convention
  date: { type: Date, required: true, default: Date.now },
}, { timestamps: true });

const Donation = mongoose.model('Donation', donationSchema);

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  studentId: { type: String, required: true },
  bloodType: { type: String, required: true },
  units: { type: Number, required: true },
  urgency: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  requestDate: { type: Date, default: Date.now },
});

const Request = mongoose.model('Request', requestSchema);

const inventorySchema = new mongoose.Schema({
  bloodType: { type: String, required: true, unique: true },
  units: { type: Number, required: true, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const Inventory = mongoose.model('Inventory', inventorySchema);

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  organizer: { type: String },
  photos: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const Event = mongoose.model('Event', eventSchema);

// User model for authentication / authorization
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin','user'], default: 'user' },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

// Auth middleware
const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_me';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin privileges required' });
  }
  next();
}

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    let role = 'user';
    if (adminCode && adminCode === process.env.ADMIN_CODE) {
      role = 'admin';
    }
    const user = await User.create({ email, passwordHash, role });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot Password
app.post('/users/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In a real app, send email here. For now, we'll just return the token for testing.
    console.log(`Reset token for ${email}: ${token}`);
    res.json({ message: 'Password reset token generated', token }); 
  } catch (err) {
    console.error('Forgot password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/users/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset' });
  } catch (err) {
    console.error('Reset password error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Alias routes for frontend compatibility
app.post('/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

app.post('/users/register', async (req, res) => {
   try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    
    const user = await User.create({ email, passwordHash, role: role || 'user' });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, role: user.role });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

app.get('/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('email role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

app.get('/donors', async (req, res) => {
  try {
    const donors = await Donor.find();
    res.json(donors);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Ensure uploads directory exists and serve static files
const uploadsDir = path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (err) {
  console.log("Could not create uploads directory (expected in serverless environment):", err.message);
}
app.use('/uploads', express.static(uploadsDir));

// Multer config for profile photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, unique + ext);
  }
});
const fileFilter = (req, file, cb) => {
  if (!file || !file.mimetype) return cb(null, false);
  if (file.mimetype.startsWith('image/')) return cb(null, true);
  cb(new Error('Only image uploads are allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Upload profile photo and attach to user's donor profile
app.post('/me/profile/photo', auth, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const urlPath = `/uploads/${req.file.filename}`;

    // Try linking to an existing donor by userId, then by email, else create/update by userId
    const user = await User.findById(req.user.id).select('email');
    let donor = await Donor.findOne({ userId: req.user.id });
    if (!donor && user?.email) {
      donor = await Donor.findOne({ email: user.email });
    }

    const filter = donor ? { _id: donor._id } : { userId: req.user.id };
    const profile = await Donor.findOneAndUpdate(
      filter,
      { $set: { userId: req.user.id, profilePhotoUrl: urlPath } },
      { new: true, upsert: true }
    ).select('profilePhotoUrl');

    res.json({ profilePhotoUrl: profile.profilePhotoUrl });
  } catch (err) {
    console.error('Photo upload error', err);
    res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// Profile endpoints for authenticated user
app.get('/me/profile', auth, async (req, res) => {
  try {
    const profile = await Donor.findOne({ userId: req.user.id });
    res.json(profile || null);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load profile' });
  }
});

app.put('/me/profile', auth, async (req, res) => {
  try {
    const {
      aadhaar,
      name,
      email,
      phone,
      bloodType,
      address,
      age,
      weight,
      donateConsent
    } = req.body;

    // If aadhaar provided, ensure uniqueness across different users
    if (aadhaar) {
      const existing = await Donor.findOne({ aadhaar, userId: { $ne: req.user.id } });
      if (existing) {
        return res.status(409).json({ message: 'Aadhaar already in use by another profile' });
      }
    }

    const update = {
      ...(aadhaar !== undefined && { aadhaar }),
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(bloodType !== undefined && { bloodType }),
      ...(address !== undefined && { address }),
      ...(age !== undefined && { age }),
      ...(weight !== undefined && { weight }),
      ...(donateConsent !== undefined && { donateConsent }),
      userId: req.user.id
    };

    const profile = await Donor.findOneAndUpdate(
      { userId: req.user.id },
      { $set: update },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    console.error('Profile update error', err);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Past donations for the authenticated user's donor profile
app.get('/me/donations', auth, async (req, res) => {
  try {
    // First try to find donor linked directly by userId
    let donor = await Donor.findOne({ userId: req.user.id });

    // Fallback: match by email if needed (for legacy donors created without userId)
    if (!donor) {
      const user = await User.findById(req.user.id).select('email');
      if (user?.email) {
        donor = await Donor.findOne({ email: user.email });
      }
    }

    if (!donor) {
      return res.json([]);
    }

    const donations = await Donation.find({ donor: donor._id })
      .sort({ date: -1 })
      .select('amount date createdAt');

    res.json(donations);
  } catch (err) {
    console.error('Error fetching donations for profile', err);
    res.status(500).json({ message: 'Failed to load donations' });
  }
});

// Protected: admin-only for adding/updating donor donations
app.post('/donors/add', auth, requireAdmin, async (req, res) => {
  const { aadhaar, name, email, phone, bloodType, address, age, weight } = req.body;

  try {
    let donor = await Donor.findOne({ aadhaar });

    if (donor) {
      // If donor exists, update their information
      donor.name = name;
      donor.email = email;
      donor.phone = phone;
      donor.bloodType = bloodType;
      donor.address = address;
      donor.age = age;
      donor.weight = weight;
      // Note: This logic assumes a new donation is being made.
      // You might want to handle this differently.
      donor.totalDonations += 1;
      donor.points = donor.totalDonations * 100;
      const today = new Date();
      donor.lastDonation = today.toISOString().split('T')[0]; // Set current date as last donation
      donor.status = 'Ineligible';
      // set nextEligibleDate to six months from now
      const next = new Date(today);
      next.setMonth(next.getMonth() + 6);
      donor.nextEligibleDate = next;

      await donor.save();
      res.json('Donor updated and donation recorded!');
    } else {
      // If donor does not exist, create a new one
      const newDonor = new Donor({
        aadhaar,
        name,
        email,
        phone,
        bloodType,
        address,
        age,
        weight,
        totalDonations: 1, // First donation
        points: 100,
        lastDonation: new Date().toISOString().split('T')[0],
        status: 'Ineligible',
        nextEligibleDate: (() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d; })(),
      });

      await newDonor.save();
      res.json('New donor added and first donation recorded!');
    }
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Protected: admin-only to record a donation for an existing donor by ID
app.post('/donors/:id/donations', auth, requireAdmin, async (req, res) => {
  try {
    const { amount, date } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount is required and must be greater than 0' });
    }

    const donor = await Donor.findById(req.params.id);
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donationDate = date ? new Date(date) : new Date();

    // Create a donation record
    const donation = new Donation({
      donor: donor._id,
      donorName: donor.name,
      amount: Number(amount),
      date: donationDate,
    });
    await donation.save();

    // Update donor summary fields similar to /donors/add
    donor.totalDonations += 1;
    donor.points = donor.totalDonations * 100;
    donor.lastDonation = donationDate.toISOString().split('T')[0];
    donor.status = 'Ineligible';

    const next = new Date(donationDate);
    next.setMonth(next.getMonth() + 6);
    donor.nextEligibleDate = next;

    await donor.save();

    res.json({ message: 'Donation recorded successfully', donor, donation });
  } catch (err) {
    console.error('Error recording donation:', err);
    res.status(500).json({ message: 'Failed to record donation', error: err.message });
  }
});

// Protected: admin-only to view past donations for a specific donor
app.get('/donors/:id/donations', auth, requireAdmin, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id).select('_id');
    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donations = await Donation.find({ donor: donor._id })
      .sort({ date: -1 })
      .select('amount date createdAt');

    res.json(donations);
  } catch (err) {
    console.error('Error fetching donor donations:', err);
    res.status(500).json({ message: 'Failed to load donor donations' });
  }
});

// Protected: admin-only for creating a new donor without recording a donation
app.post('/donors/create', auth, requireAdmin, async (req, res) => {
  const { aadhaar, name, email, phone, bloodType, address, age, weight, lastDonation } = req.body;

  try {
    const existing = await Donor.findOne({ aadhaar });
    if (existing) {
      return res.status(400).json({ message: 'Donor with this Aadhaar already exists' });
    }

    const newDonor = new Donor({
      aadhaar,
      name,
      email,
      phone,
      bloodType,
      address,
      age,
      weight,
      totalDonations: 0,
      points: 0,
      lastDonation: lastDonation || 'Never',
      status: 'Eligible',
      donateConsent: 'Yes' // Assume consent if manually registered by admin
    });

    await newDonor.save();
    res.json({ message: 'Donor registered successfully', donor: newDonor });
  } catch (err) {
    console.error('Create donor error', err);
    res.status(500).json({ message: 'Failed to create donor' });
  }
});

// Protected: admin-only delete donor
app.delete('/donors/:id', auth, requireAdmin, async (req, res) => {
  try {
    const deletedDonor = await Donor.findByIdAndDelete(req.params.id);
    if (!deletedDonor) {
      return res.status(404).json({ message: 'Donor not found' });
    }
    res.json({ message: 'Donor deleted successfully' });
  } catch (err) {
    console.error('Delete donor error', err);
    res.status(500).json({ message: 'Failed to delete donor' });
  }
});

app.get('/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find().sort({ bloodType: 1 });
    res.json(inventory);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Potential donors endpoint - donors who haven't donated in the last 6 months (or never donated)
app.get('/potential-donors', async (req, res) => {
  try {
    const donors = await Donor.find();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const potential = donors.filter(d => {
        // Respect user's donation consent (opt-out)
        if (d.donateConsent === 'No') return false;

        if (!d.lastDonation || d.lastDonation === 'Never') return true;
        const ld = new Date(d.lastDonation);
        if (isNaN(ld.getTime())) return true; // treat unparsable as potential

        // If nextEligibleDate exists and is in the past, treat as potential again
        if (d.nextEligibleDate) {
          const next = new Date(d.nextEligibleDate);
          if (!isNaN(next.getTime()) && next <= new Date()) {
            return true;
          }
        }

        return ld <= sixMonthsAgo;
    });

    // Aggregate by bloodType to mimic inventory shape: { bloodType, units }
    const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const agg = {};
    allBloodTypes.forEach(bt => agg[bt] = 0);

    potential.forEach(d => {
      const bt = (d.bloodType || 'Unknown').toUpperCase();
      agg[bt] = (agg[bt] || 0) + 1;
    });

    const result = Object.keys(agg).sort().map(bt => ({ bloodType: bt, units: agg[bt], updatedAt: new Date() }));
    res.json(result);
  } catch (err) {
    console.error('Error fetching potential donors:', err);
    res.status(500).json({ message: 'Failed to fetch potential donors' });
  }
});

// Protected: admin-only inventory additions
app.post('/inventory/add', auth, requireAdmin, async (req, res) => {
  const { bloodType, units } = req.body;
  if (!bloodType || !units || units <= 0) {
    return res.status(400).json('Invalid data provided.');
  }

  try {
    const stock = await Inventory.findOneAndUpdate(
      { bloodType },
      { 
        $inc: { units: parseInt(units, 10) },
        $set: { lastUpdated: new Date() }
      },
      { new: true, upsert: true } // upsert: true creates the document if it doesn't exist
    );
    res.json(stock);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Events API
app.get('/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json('Error: ' + err);
  }
});

app.post('/events', auth, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, location, organizer } = req.body;
    const newEvent = new Event({ title, description, date, location, organizer });
    await newEvent.save();
    res.json('Event added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.delete('/events/:id', auth, requireAdmin, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json('Event deleted.');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.post('/events/:id/photos', auth, requireAdmin, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No photos uploaded' });
    }
    
    const photoUrls = req.files.map(file => `/uploads/${file.filename}`);
    
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json('Event not found');
    
    event.photos.push(...photoUrls);
    await event.save();
    
    res.json({ message: 'Photos uploaded successfully', photos: event.photos });
  } catch (err) {
    res.status(500).json({ message: 'Error uploading photos', error: err.message });
  }
});

app.delete('/events/:id/photos', auth, requireAdmin, async (req, res) => {
  try {
    const { photoUrl } = req.body;
    if (!photoUrl) {
      return res.status(400).json({ message: 'photoUrl is required' });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const index = event.photos.indexOf(photoUrl);
    if (index === -1) {
      return res.status(404).json({ message: 'Photo not found for this event' });
    }

    const [removedPhoto] = event.photos.splice(index, 1);
    await event.save();

    if (removedPhoto && removedPhoto.startsWith('/uploads/')) {
      const relativePath = removedPhoto.replace('/uploads/', '');
      const filePath = path.join(uploadsDir, relativePath);
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr && unlinkErr.code !== 'ENOENT') {
          console.warn('Failed to delete photo file:', unlinkErr.message);
        }
      });
    }

    res.json({ message: 'Photo removed successfully', photos: event.photos });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ message: 'Failed to delete photo' });
  }
});

// Donations that happened on the same day as a specific event
app.get('/events/:id/donations', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const eventDate = new Date(event.date);
    const startOfDay = new Date(eventDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(eventDate);
    endOfDay.setHours(23, 59, 59, 999);

    const donations = await Donation.find({
      date: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ date: -1 })
      .select('donorName amount date');

    res.json(donations);
  } catch (err) {
    console.error('Error fetching event donations:', err);
    res.status(500).json({ message: 'Failed to load event donations' });
  }
});

// Protected: admin-only inventory removal
app.post('/inventory/remove', auth, requireAdmin, async (req, res) => {
  const { bloodType, units } = req.body;
  if (!bloodType || !units || units <= 0) {
    return res.status(400).json('Invalid data provided.');
  }

  try {
    const stock = await Inventory.findOne({ bloodType });
    if (!stock || stock.units < units) {
      return res.status(400).json({ message: 'Not enough stock to remove.' });
    }

    const updatedStock = await Inventory.findOneAndUpdate(
      { bloodType },
      { 
        $inc: { units: -parseInt(units, 10) },
        $set: { lastUpdated: new Date() }
      },
      { new: true }
    );
    res.json(updatedStock);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

app.get('/requests', async (req, res) => {
  try {
    const requests = await Request.find().sort({ requestDate: -1 });
    res.json(requests);
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Allow any authenticated user to create a request (could also be open if desired)
app.post('/requests/add', auth, async (req, res) => {
  const newRequest = new Request({
    patientName: req.body.patientName,
    studentId: req.body.studentId,
    bloodType: req.body.bloodType,
    units: req.body.units,
    urgency: req.body.urgency,
  });

  try {
    await newRequest.save();
    res.json('Request added!');
  } catch (err) {
    res.status(400).json('Error: ' + err);
  }
});

// Protected: only admin can approve / reject requests
app.put('/requests/update/:id', auth, requireAdmin, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json('Request not found');
    }

    // If the status is being updated to 'Approved' and it wasn't approved before
    if (req.body.status === 'Approved' && request.status !== 'Approved') {
      const { bloodType, units } = request;

      const stock = await Inventory.findOne({ bloodType });

      if (!stock || stock.units < units) {
        return res.status(400).json({ message: 'Not enough stock available to approve this request.' });
      }

      // Decrease the stock
      stock.units -= units;
      stock.lastUpdated = new Date();
      await stock.save();
      
      request.status = req.body.status;
      await request.save();
      
      res.json({ message: 'Request approved and inventory updated successfully!' });

    } else if (req.body.status !== 'Approved') { // Handle other status changes like 'Rejected'
        request.status = req.body.status;
        await request.save();
        res.json({ message: `Request status updated to ${req.body.status}!`});
    } else { // If already approved and trying to approve again
        res.json({ message: 'Request is already approved.' });
    }

  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({ message: 'Error updating request status.', error: err.message });
  }
});

app.delete('/requests/:id', auth, requireAdmin, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const completedStatuses = ['Approved', 'Completed'];
    if (!completedStatuses.includes(request.status)) {
      return res.status(400).json({ message: 'Only completed requests can be deleted.' });
    }

    await request.deleteOne();
    res.json({ message: 'Request deleted successfully.' });
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({ message: 'Failed to delete request.', error: err.message });
  }
});

if (require.main === module) {
  app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
  });
}

module.exports = app;
