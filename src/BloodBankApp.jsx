import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Users, Droplets, Calendar, MapPin, Phone, Mail, AlertCircle, CheckCircle, Trophy, Award, Star, Heart, Activity, LogOut, ChevronLeft, Trash2, Image, Upload, X } from 'lucide-react';
import ScrollStack from './components/ScrollStack';
import SpotlightCard from './components/SpotlightCard';
import ClickSpark from './components/ClickSpark';
import GlobalClickSpark from './components/GlobalClickSpark';
import Toast from './components/Toast';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

const AddDonationModal = ({ isOpen, onClose, onSubmit, donor, notify = () => {} }) => {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!amount || Number(amount) <= 0) {
      notify('error', 'Please enter a valid amount of blood donated.');
      return;
    }
    if (!date) {
      notify('error', 'Please select a donation date.');
      return;
    }
    onSubmit({ amount: Number(amount), date });
  };

  if (!isOpen || !donor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Record Donation</h2>
            <p className="text-sm text-gray-600 mb-4">
              Donor: <span className="font-semibold">{donor.name}</span> ({donor.bloodType})
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount of blood donated</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Enter units donated"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Donation Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <ClickSpark>
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Cancel</button>
              </ClickSpark>
              <ClickSpark>
                <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Save Donation</button>
              </ClickSpark>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RequestModal = ({ isOpen, onClose, onSubmit, notify = () => {} }) => {
  const [newRequestData, setNewRequestData] = useState({
    studentId: '',
    bloodType: '',
    units: '',
    urgency: 'Medium',
  });

  useEffect(() => {
    if (isOpen) {
      setNewRequestData({
        studentId: '',
        bloodType: '',
        units: '',
        urgency: 'Medium',
      });
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!newRequestData.studentId || !newRequestData.bloodType || !newRequestData.units) {
      notify('error', 'Please complete all required fields for the request.');
      return;
    }
    const generatedTitle = newRequestData.bloodType
      ? `Request for ${newRequestData.bloodType}`
      : 'Blood Request';
    onSubmit({ ...newRequestData, patientName: generatedTitle });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">New Blood Request</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Reference / Contact Info"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newRequestData.studentId}
                onChange={(e) => setNewRequestData({ ...newRequestData, studentId: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newRequestData.bloodType}
                onChange={(e) => setNewRequestData({ ...newRequestData, bloodType: e.target.value })}
              >
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <input
                type="number"
                placeholder="Units"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newRequestData.units}
                onChange={(e) => setNewRequestData({ ...newRequestData, units: e.target.value })}
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={newRequestData.urgency}
                onChange={(e) => setNewRequestData({ ...newRequestData, urgency: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <ClickSpark>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</motion.button>
              </ClickSpark>
              <ClickSpark>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSubmit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Submit Request</motion.button>
              </ClickSpark>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const RegisterDonorModal = ({ isOpen, onClose, onSubmit, notify = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '', aadhaar: '', email: '', phone: '', bloodType: '', address: '', age: '', weight: '', lastDonation: ''
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!formData.name || !formData.aadhaar || !formData.bloodType) {
      notify('error', 'Name, Aadhaar and Blood Type are required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Register New Donor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <input name="aadhaar" placeholder="Aadhaar Number" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <input name="email" type="email" placeholder="Email" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <input name="phone" placeholder="Phone" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <select name="bloodType" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange}>
                <option value="">Select Blood Type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
              <input name="age" type="number" placeholder="Age" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <input name="weight" type="number" placeholder="Weight (kg)" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              <div className="md:col-span-2">
                 <label className="block text-sm text-gray-600 mb-1">Last Donation (Optional)</label>
                 <input name="lastDonation" type="date" className="w-full px-3 py-2 border rounded-lg" onChange={handleChange} />
              </div>
              <textarea name="address" placeholder="Address" rows="2" className="w-full px-3 py-2 border rounded-lg md:col-span-2" onChange={handleChange} />
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <ClickSpark>
                <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              </ClickSpark>
              <ClickSpark>
                <button onClick={handleSubmit} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Register Donor</button>
              </ClickSpark>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// AddStockModal removed — inventory modification UI is not needed for Potential Donors

// RemoveStockModal removed — inventory modification UI is not needed for Potential Donors

// Admin-only modal to view donor profile details
const ProfileViewModal = ({ isOpen, onClose, donor, resolveImg }) => {
  const [donorDonations, setDonorDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !donor || !donor._id) {
      setDonorDonations([]);
      return;
    }

    setDonationsLoading(true);
    axios
      .get(`http://localhost:5000/donors/${donor._id}/donations`)
      .then((res) => {
        setDonorDonations(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        setDonorDonations([]);
      })
      .finally(() => {
        setDonationsLoading(false);
      });
  }, [isOpen, donor && donor._id]);

  if (!isOpen || !donor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white p-6 md:p-8 rounded-xl shadow-2xl w-full max-w-2xl"
          >
            <div className="flex items-start gap-6">
              <div className="relative">
                {donor.profilePhotoUrl ? (
                  <img
                    src={resolveImg(donor.profilePhotoUrl)}
                    alt={donor.name}
                    className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border"
                  />
                ) : (
                  <div className="w-24 h-24 md:w-28 md:h-28 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-2xl">
                    {donor.name?.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                {donor.badge && (
                  <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full text-xs font-bold text-white bg-red-600 shadow">
                    {donor.badge}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{donor.name}</h3>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                    {donor.bloodType}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {donor.email || '—'}</div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {donor.phone || '—'}</div>
                  <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-400" /> Last Donation: {donor.lastDonation || 'Never'}</div>
                  <div className="flex items-center gap-2"><Users className="h-4 w-4 text-gray-400" /> Status: {donor.status || '—'}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Aadhaar</p>
                <p className="font-semibold text-gray-800 break-all">{donor.aadhaar || '—'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Age</p>
                <p className="font-semibold text-gray-800">{donor.age ?? '—'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Weight (kg)</p>
                <p className="font-semibold text-gray-800">{donor.weight ?? '—'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-500">Total Donations</p>
                <p className="font-semibold text-gray-800">{donor.totalDonations ?? 0}</p>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 mb-1">Address</p>
              <p className="text-gray-800">{donor.address || '—'}</p>
            </div>

            <div className="mt-2 p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-500 mb-1">Donation Consent</p>
              <p className="text-gray-800">{donor.donateConsent || 'No'}</p>
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 uppercase tracking-wide">
                  <Droplets className="h-3 w-3 text-red-500" />
                  Past Donations
                </p>
                {donationsLoading && (
                  <span className="text-[10px] text-gray-400">Loading...</span>
                )}
              </div>
              {donorDonations.length === 0 && !donationsLoading ? (
                <p className="text-xs text-gray-500 italic">No past donations recorded for this donor.</p>
              ) : (
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  {donorDonations.map((d) => (
                    <div
                      key={d._id || d.createdAt}
                      className="flex items-center justify-between px-2 py-1 rounded-lg bg-red-50 border border-red-100"
                    >
                      <span className="text-xs font-medium text-gray-800">
                        {new Date(d.date || d.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-semibold text-red-600">
                        {d.amount} unit{d.amount === 1 ? '' : 's'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <ClickSpark>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Close</motion.button>
              </ClickSpark>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex justify-end gap-3">
              <ClickSpark>
                <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
              </ClickSpark>
              <ClickSpark>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Delete</button>
              </ClickSpark>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


const BloodBankApp = () => {
  // Helper to resolve backend-served image URLs
  const resolveImg = (url) => {
    if (!url) return '';
    return url.startsWith('http://') || url.startsWith('https://')
      ? url
      : `http://localhost:5000${url}`;
  };
  const [activeTab, setActiveTab] = useState('dashboard');
  const [donors, setDonors] = useState([]);
  const [potentialDonors, setPotentialDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isCreateDonorModalOpen, setIsCreateDonorModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, donorId: null });
  const [requestDeleteConfirmation, setRequestDeleteConfirmation] = useState({ isOpen: false, requestId: null });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [donorForDonation, setDonorForDonation] = useState(null);
  const [pastEventsCount, setPastEventsCount] = useState(0);
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [role, setRole] = useState(() => localStorage.getItem('role') || '');
  const [userName, setUserName] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const toastTimeoutRef = useRef(null);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, isVisible: false }));
  }, []);

  const showToast = useCallback((type, message) => {
    setToast({ isVisible: true, type, message });
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    toastTimeoutRef.current = setTimeout(() => {
      hideToast();
    }, 3500);
  }, [hideToast]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }

    // Add a response interceptor to catch 401/403 and force logout
    const interceptor = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // Invalid or expired token — clear local state and prompt re-login
          showToast('error', 'Session expired or invalid. Please login again.');
          logout();
        }
        return Promise.reject(error);
      }
    );

    if (token) {
      fetchDonors();
      fetchRequests();
      fetchPotentialDonors();
      fetchEventStats();

      axios
        .get('http://localhost:5000/me/profile')
        .then((res) => {
          if (res.data && res.data.name) {
            setUserName(res.data.name);
          } else {
            setUserName('');
          }
        })
        .catch(() => {
          setUserName('');
        });
    }

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  useEffect(() => {
    const getBadge = (donations) => {
      if (donations >= 20) return 'Gold';
      if (donations >= 10) return 'Silver';
      if (donations >= 5) return 'Bronze';
      return 'Beginner';
    };

    const sortedDonors = [...donors]
      .sort((a, b) => (b.totalDonations || 0) - (a.totalDonations || 0))
      .map(donor => ({
        ...donor,
        points: (donor.totalDonations || 0) * 100,
        badge: getBadge(donor.totalDonations || 0),
      }));
    setLeaderboard(sortedDonors);
  }, [donors]);

  const fetchDonors = () => {
    axios.get('http://localhost:5000/donors')
      .then(response => {
        setDonors(response.data);
      })
      .catch(error => {
        console.error('Error fetching donors:', error);
      });
  };

  const fetchPotentialDonors = () => {
    axios.get('http://localhost:5000/potential-donors')
      .then(response => {
        setPotentialDonors(response.data);
      })
      .catch(error => {
        console.error('Error fetching potential donors:', error);
      });
  };

  const fetchRequests = () => {
    axios.get('http://localhost:5000/requests')
      .then(response => {
        setRequests(response.data);
      })
      .catch(error => {
        console.error('Error fetching requests:', error);
      });
  };

  const fetchEventStats = () => {
    axios.get('http://localhost:5000/events')
      .then(response => {
        const now = new Date();
        const pastCount = response.data.filter(e => new Date(e.date) < now).length;
        setPastEventsCount(pastCount);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  };

  // Add/Remove stock handlers removed — inventory modification is disabled for Potential Donors

  const handleRequestSubmit = (requestData) => {
    axios.post('http://localhost:5000/requests/add', requestData)
      .then(() => {
        fetchRequests();
        setIsRequestModalOpen(false);
        showToast('success', 'New blood request added successfully!');
      })
      .catch(err => {
        console.error('Error adding request:', err);
        showToast('error', 'Failed to add request. Please try again.');
      });
  };

  const handleCreateDonor = async (formData) => {
    try {
      await axios.post('http://localhost:5000/donors/create', formData);
      showToast('success', 'Donor registered successfully!');
      setIsCreateDonorModalOpen(false);
      fetchDonors();
    } catch (error) {
      console.error('Error registering donor:', error);
      showToast('error', 'Failed to register donor');
    }
  };

  const handleDeleteDonor = (id) => {
    setDeleteConfirmation({ isOpen: true, donorId: id });
  };

  const openDonationModal = (donor) => {
    if (role !== 'admin') return;
    setDonorForDonation(donor);
    setIsDonationModalOpen(true);
  };

  const handleAddDonation = async ({ amount, date }) => {
    if (!donorForDonation) return;
    try {
      await axios.post(`http://localhost:5000/donors/${donorForDonation._id}/donations`, { amount, date });
      showToast('success', 'Donation recorded successfully!');
      setIsDonationModalOpen(false);
      setDonorForDonation(null);
      fetchDonors();
    } catch (error) {
      console.error('Error recording donation:', error);
      showToast('error', 'Failed to record donation');
    }
  };

  const confirmDeleteDonor = async () => {
    if (!deleteConfirmation.donorId) return;
    try {
      await axios.delete(`http://localhost:5000/donors/${deleteConfirmation.donorId}`);
      fetchDonors();
      setDeleteConfirmation({ isOpen: false, donorId: null });
      showToast('success', 'Donor deleted successfully.');
    } catch (error) {
      console.error('Error deleting donor:', error);
      showToast('error', 'Failed to delete donor');
    }
  };

  const handleUpdateRequestStatus = (id, status) => {
    axios.put(`http://localhost:5000/requests/update/${id}`, { status })
      .then(() => {
        fetchRequests();
        showToast('success', `Request has been ${status}.`);
      })
      .catch(err => {
        console.error('Error updating request status:', err);
        showToast('error', 'Failed to update request status.');
      });
  };

  const handleDeleteRequest = (id) => {
    setRequestDeleteConfirmation({ isOpen: true, requestId: id });
  };

  const confirmDeleteRequest = async () => {
    if (!requestDeleteConfirmation.requestId) return;
    try {
      await axios.delete(`http://localhost:5000/requests/${requestDeleteConfirmation.requestId}`);
      fetchRequests();
      showToast('success', 'Request deleted successfully.');
    } catch (err) {
      console.error('Error deleting request:', err);
      showToast('error', 'Failed to delete request.');
    } finally {
      setRequestDeleteConfirmation({ isOpen: false, requestId: null });
    }
  };

  const navigate = useNavigate();

  const logout = () => {
    setToken('');
    setRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  const openProfile = (donor) => {
    if (role !== 'admin') return; // admin-only visibility
    setSelectedDonor(donor);
    setIsProfileModalOpen(true);
  };



  const MotionTab = ({ children }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );

  const DashboardTab = () => (
    <MotionTab>
      <div className="px-6 py-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h2>
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
            {[
            { title: 'Total Donors', value: donors.length, icon: <Users className="h-12 w-12 text-red-200" />, color: 'from-red-500 to-red-600' },
            { title: 'Blood Units', value: potentialDonors.reduce((sum, item) => sum + item.units, 0), icon: <Droplets className="h-12 w-12 text-blue-200" />, color: 'from-blue-500 to-blue-600' },
            { title: 'Past Events', value: pastEventsCount, icon: <Calendar className="h-12 w-12 text-green-200" />, color: 'from-green-500 to-green-600' },
            { title: 'Critical Stock', value: potentialDonors.filter(item => item.units < 20).length, icon: <AlertCircle className="h-12 w-12 text-purple-200" />, color: 'from-purple-500 to-purple-600' },
          ].map((stat, index) => (
            <motion.div key={index} variants={itemVariants} className={`bg-gradient-to-r ${stat.color} text-white p-6 rounded-lg shadow-lg`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="bg-white rounded-lg shadow-lg p-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Potential Donors Overview</h3>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {potentialDonors.map((item, index) => (
              <motion.div key={index} variants={itemVariants}>
                <SpotlightCard
                  className={item.units < 5 ? 'border-red-400 bg-red-100' : 'border-gray-200 bg-gray-50'}
                >
                  <div className="text-center space-y-1">
                    <p className="text-2xl font-bold text-red-600 tracking-wide">{item.bloodType}</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.units} {item.units === 1 ? 'donor' : 'donors'}
                    </p>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </MotionTab>
  );

  const ProfileTab = () => {
    const [profile, setProfile] = useState({
      aadhaar: '',
      name: '',
      email: '',
      phone: '',
      bloodType: '',
      address: '',
      age: '',
      weight: '',
      donateConsent: 'No',
      profilePhotoUrl: ''
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const [donations, setDonations] = useState([]);
    const fileInputRef = React.useRef(null);

    useEffect(() => {
      axios.get('http://localhost:5000/me/profile')
        .then(res => {
          if (res.data) setProfile({
            aadhaar: res.data.aadhaar || '',
            name: res.data.name || '',
            email: res.data.email || '',
            phone: res.data.phone || '',
            bloodType: res.data.bloodType || '',
            address: res.data.address || '',
            age: res.data.age || '',
            weight: res.data.weight || '',
            donateConsent: res.data.donateConsent || 'No',
            profilePhotoUrl: res.data.profilePhotoUrl || ''
          });
        })
        .catch(() => {});

      axios.get('http://localhost:5000/me/donations')
        .then(res => {
          setDonations(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setDonations([]);
        });
    }, []);

    useEffect(() => {
      if (photoFile) {
        const url = URL.createObjectURL(photoFile);
        setPhotoPreview(url);
        return () => URL.revokeObjectURL(url);
      } else {
        setPhotoPreview('');
      }
    }, [photoFile]);

    const save = () => {
      if (!profile.aadhaar || !profile.name) {
        showToast('error', 'Please fill Aadhaar and Name');
        return;
      }
      axios.put('http://localhost:5000/me/profile', profile)
        .then(() => showToast('success', 'Profile saved'))
        .catch(err => showToast('error', err.response?.data?.message || 'Failed to save profile'));
    };

    const handlePhotoChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setPhotoFile(file);
        // Auto upload on selection or wait for explicit button? 
        // Let's keep explicit button for now or merge with save.
        // For better UX, let's just set it to state and let user click upload or save.
        // But the original logic had a separate upload button. Let's keep it but style it better.
      }
    };

    const uploadPhoto = async () => {
      if (!photoFile) return;
      const fd = new FormData();
      fd.append('photo', photoFile);
      try {
        const res = await axios.post('http://localhost:5000/me/profile/photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setProfile(p => ({ ...p, profilePhotoUrl: res.data.profilePhotoUrl }));
        setPhotoFile(null);
        showToast('success', 'Photo uploaded successfully');
      } catch (err) {
        showToast('error', err.response?.data?.message || 'Failed to upload photo');
      }
    };

    return (
      <MotionTab>
        <div className="px-10 py-2 mx-5">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
              <p className="text-gray-500 mt-1">Manage your personal information and preferences</p>
            </div>
            <ClickSpark>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={save}
                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Save Changes
              </motion.button>
            </ClickSpark>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Photo & Quick Stats */}
            <div className="space-y-6">
              <motion.div 
                variants={itemVariants}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center"
              >
                <div className="relative inline-block mb-4 group">
                  <div className="w-32 h-32 rounded-full bg-gray-50 border-4 border-white shadow-lg overflow-hidden mx-auto relative">
                    {photoPreview || profile.profilePhotoUrl ? (
                      <img 
                        src={photoPreview || resolveImg(profile.profilePhotoUrl)} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <Users className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full">
                        <Plus className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoChange} 
                  />
                  {photoFile && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={uploadPhoto}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-3 py-1 rounded-full shadow-md hover:bg-blue-700 whitespace-nowrap"
                    >
                      Upload New
                    </motion.button>
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{profile.name || 'User Name'}</h3>
                <p className="text-gray-500 text-sm">{profile.email}</p>
                
                <div className="mt-6 flex justify-center gap-4">
                  <div className="text-center px-4 py-2 bg-red-50 rounded-xl border border-red-100">
                    <span className="block text-2xl font-bold text-red-600">{profile.bloodType || '-'}</span>
                    <span className="text-xs text-red-600/70 font-medium uppercase">Blood Type</span>
                  </div>
                  <div className="text-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                    <span className="block text-2xl font-bold text-blue-600">{profile.age || '-'}</span>
                    <span className="text-xs text-blue-600/70 font-medium uppercase">Age</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl shadow-lg shadow-red-600/20 p-6 text-white"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Donor Status</h4>
                    <p className="text-red-100 text-sm mb-4">
                      {profile.donateConsent === 'Yes' 
                        ? "You are registered as an active donor. Thank you for saving lives!" 
                        : "Consider becoming a donor to help those in need."}
                    </p>
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1 pr-3 w-fit">
                      <select 
                        value={profile.donateConsent}
                        onChange={e=>setProfile({...profile, donateConsent: e.target.value})}
                        className="bg-transparent text-white text-sm font-medium focus:outline-none px-2 py-1 cursor-pointer"
                      >
                        <option value="Yes" className="text-gray-900">Active Donor</option>
                        <option value="No" className="text-gray-900">Not Donating</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Column - Forms and Donation History */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.name} 
                      onChange={e=>setProfile({...profile, name: e.target.value})} 
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.aadhaar} 
                      onChange={e=>setProfile({...profile, aadhaar: e.target.value})} 
                      placeholder="XXXX-XXXX-XXXX"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.email} 
                      onChange={e=>setProfile({...profile, email: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.phone} 
                      onChange={e=>setProfile({...profile, phone: e.target.value})} 
                      placeholder="+91 XXXXX XXXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                      rows="3" 
                      className="w-full px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none" 
                      value={profile.address} 
                      onChange={e=>setProfile({...profile, address: e.target.value})} 
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-gray-400" />
                  Medical Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Type</label>
                    <div className="relative">
                      <select 
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all appearance-none" 
                        value={profile.bloodType} 
                        onChange={e=>setProfile({...profile, bloodType: e.target.value})}
                      >
                        <option value="">Select Type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.age} 
                      onChange={e=>setProfile({...profile, age: e.target.value})} 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                    <input 
                      type="number" 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                      value={profile.weight} 
                      onChange={e=>setProfile({...profile, weight: e.target.value})} 
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-red-500" />
                  Past Donations
                </h3>
                {donations.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No past donations recorded yet.</p>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {donations.map((d) => (
                      <div
                        key={d._id || d.createdAt}
                        className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(d.date || d.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">Donation</p>
                        </div>
                        <span className="text-sm font-bold text-red-600">
                          {d.amount} unit{d.amount === 1 ? '' : 's'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </MotionTab>
    );
  };




  const DonorsTab = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredDonors = useMemo(() => {
      if (!searchTerm) return donors;
      const term = searchTerm.trim().toLowerCase();
      return donors.filter((donor) => {
        const nameMatch = donor.name?.toLowerCase().includes(term);
        const bloodMatch = donor.bloodType?.toLowerCase().includes(term);
        const aadhaarMatch = String(donor.aadhaar || '').toLowerCase().includes(term);
        return nameMatch || bloodMatch || aadhaarMatch;
      });
    }, [donors, searchTerm]);

    return (
      <MotionTab>
        <div className="px-6 py-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Donor Management</h2>
            {role === 'admin' && (
              <ClickSpark>
                <button
                  onClick={() => setIsCreateDonorModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  Register Donor
                </button>
              </ClickSpark>
            )}
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search donors..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Blood Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Donation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  {role === 'admin' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                </tr>
              </thead>
              <motion.tbody variants={containerVariants} initial="hidden" animate="visible" className="bg-white divide-y divide-gray-200">
                {filteredDonors.map((donor) => (
                  <motion.tr key={donor._id} variants={itemVariants} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="relative cursor-pointer" onClick={() => openProfile(donor)} title={role === 'admin' ? 'View profile' : ''}>
                          {donor.profilePhotoUrl ? (
                            <img
                              src={resolveImg(donor.profilePhotoUrl)}
                              alt={donor.name}
                              className="w-10 h-10 rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold">
                              {donor.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          {donor.badge && (
                            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-white bg-red-600 shadow">
                              {donor.badge}
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-gray-900">{donor.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {donor.bloodType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {donor.phone}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {donor.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{donor.lastDonation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${donor.donateConsent === 'Yes' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {donor.donateConsent || 'No'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        donor.status === 'Eligible' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {donor.status}
                      </span>
                    </td>
                    {role === 'admin' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <ClickSpark>
                            <button 
                              onClick={() => handleDeleteDonor(donor._id)}
                              className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete Donor"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </ClickSpark>
                          <ClickSpark>
                            <button
                              onClick={() => openDonationModal(donor)}
                              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 shadow-sm hover:shadow-md"
                              title="Add Donation"
                            >
                              <Droplets className="w-3 h-3 mr-1" />
                              Add
                            </button>
                          </ClickSpark>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </div>
      </MotionTab>
    );
  };

  const RequestsTab = () => (
    <MotionTab>
      <div className="px-10 py-2 mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Blood Requests</h2>
            <p className="text-gray-500 mt-1">Manage and view blood donation requests</p>
          </div>
          <ClickSpark>
            <motion.button 
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 font-medium"
            >
              <Plus className="h-5 w-5" />
              New Request
            </motion.button>
          </ClickSpark>
        </div>

        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="visible" 
          className="space-y-4"
        >
          <AnimatePresence initial={false}>
          {requests.map((request) => (
            <motion.div
              key={request._id}
              layout
              initial={{ opacity: 0, y: 40, scale: 0.95, rotateX: -6 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, y: -30, scale: 0.9, rotateX: 5 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20, mass: 0.9 }}
              whileHover={{ y: -6, boxShadow: '0 30px 60px rgba(15,23,42,0.12)' }}
              className="relative overflow-hidden bg-white rounded-2xl border border-gray-100 flex flex-col md:flex-row"
            >
              <motion.div
                className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-red-100/70 via-transparent to-transparent pointer-events-none"
                animate={{ x: [50, 0, 50] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute -top-10 -right-8 h-24 w-24 bg-red-500/10 rounded-full blur-3xl"
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1.1, 0.8] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror' }}
              />

              <div className={`relative h-2 md:h-auto md:w-2 w-full ${
                request.urgency === 'High' ? 'bg-red-500' : 
                request.urgency === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
              }`} />
              
              <div className="relative p-6 flex-1 flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex justify-between items-start md:items-center mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{request.patientName}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-medium">Ref: {request.studentId}</span>
                      </p>
                    </div>
                    <motion.span
                      className={`md:hidden px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        request.urgency === 'High'
                          ? 'bg-red-50 text-red-700 border-red-100'
                          : request.urgency === 'Medium'
                          ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                          : 'bg-green-50 text-green-700 border-green-100'
                      }`}
                      animate={{ scale: [1, 1.08, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror' }}
                    >
                      {request.urgency}
                    </motion.span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 md:gap-8 mt-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-red-600 font-bold border border-gray-100"
                        animate={{ rotate: [0, -2, 2, 0] }}
                        transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror' }}
                      >
                        {request.bloodType}
                      </motion.div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 uppercase font-semibold">Blood Type</span>
                        <span className="text-sm font-medium text-gray-900">Required</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Units</span>
                      <motion.p className="text-lg font-bold text-gray-900" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1.8, repeat: Infinity, repeatType: 'mirror' }}>
                        {request.units}
                      </motion.p>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase font-semibold">Date</span>
                      <div className="flex items-center gap-2 text-gray-900 font-medium">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{new Date(request.requestDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="hidden md:block">
                       <motion.span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          request.urgency === 'High'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : request.urgency === 'Medium'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                            : 'bg-green-50 text-green-700 border-green-100'
                        }`}
                        animate={{ opacity: [0.8, 1, 0.8] }}
                        transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror' }}
                      >
                        {request.urgency} Priority
                      </motion.span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-3 min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                  <motion.span
                    className={`self-start md:self-end flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium mb-2 ${
                      request.status === 'Approved'
                        ? 'bg-green-100 text-green-700'
                        : request.status === 'Pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                    animate={{ scale: [1, 1.04, 1] }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: 'mirror' }}
                  >
                    <motion.div
                      className={`w-1.5 h-1.5 rounded-full ${
                        request.status === 'Approved'
                          ? 'bg-green-500'
                          : request.status === 'Pending'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                      transition={{ duration: 1.6, repeat: Infinity, repeatType: 'mirror' }}
                    />
                    {request.status}
                  </motion.span>

                  {request.status === 'Pending' && role === 'admin' ? (
                    <div className="flex gap-3 w-full md:w-auto">
                      <ClickSpark>
                        <motion.button 
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          onClick={() => handleUpdateRequestStatus(request._id, 'Approved')}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors shadow-sm shadow-green-600/20"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </motion.button>
                      </ClickSpark>
                      <ClickSpark>
                        <motion.button 
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
                          onClick={() => handleUpdateRequestStatus(request._id, 'Rejected')}
                          className="flex-1 md:flex-none flex justify-center items-center gap-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Reject
                        </motion.button>
                      </ClickSpark>
                    </div>
                  ) : (
                     <div className="flex flex-col gap-3 w-full md:w-auto">
                       <div className="px-4 py-2 bg-gray-50 text-gray-400 rounded-xl text-sm font-medium text-center border border-gray-100">
                        {request.status === 'Pending' ? 'Awaiting Action' : `Request ${request.status}`}
                      </div>
                       {role === 'admin' && ['Approved', 'Completed', 'Rejected'].includes(request.status) && (
                        <ClickSpark>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => handleDeleteRequest(request._id)}
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 shadow-sm shadow-red-600/30"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Request
                          </motion.button>
                        </ClickSpark>
                       )}
                     </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </MotionTab>
  );

  const EventsTab = () => {
    const [events, setEvents] = useState([]);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', location: '', organizer: '' });
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const fileInputRef = React.useRef(null);
    const [selectedEventId, setSelectedEventId] = useState(null);
    const [galleryEvent, setGalleryEvent] = useState(null);
    const [donationsEvent, setDonationsEvent] = useState(null);
    const [eventDonations, setEventDonations] = useState([]);
    const [eventDonationsLoading, setEventDonationsLoading] = useState(false);
    const [newEventDonation, setNewEventDonation] = useState({ donorId: '', amount: '', date: '', search: '' });
    const [eventDeleteTarget, setEventDeleteTarget] = useState(null);
    const [photoDeleteInfo, setPhotoDeleteInfo] = useState({ isOpen: false, eventId: null, photoUrl: '' });

    useEffect(() => {
      fetchEvents();
    }, []);

    const fetchEvents = () => {
      axios.get('http://localhost:5000/events')
        .then(res => setEvents(res.data))
        .catch(err => console.error(err));
    };

    const handleAddEvent = () => {
      if (!newEvent.title || !newEvent.date) {
        showToast('error', 'Title and Date are required');
        return;
      }
      axios.post('http://localhost:5000/events', newEvent)
        .then(() => {
          fetchEvents();
          setIsEventModalOpen(false);
          setNewEvent({ title: '', description: '', date: '', location: '', organizer: '' });
          showToast('success', 'Event added!');
        })
        .catch(() => showToast('error', 'Failed to add event'));
    };

    const requestEventDeletion = (id) => {
      setEventDeleteTarget(id);
    };

    const confirmDeleteEvent = () => {
      if (!eventDeleteTarget) return;
      axios.delete(`http://localhost:5000/events/${eventDeleteTarget}`)
        .then(() => {
          fetchEvents();
          showToast('success', 'Event deleted successfully.');
        })
        .catch(() => showToast('error', 'Failed to delete event'))
        .finally(() => setEventDeleteTarget(null));
    };

    const handleDeletePhoto = async () => {
      if (!photoDeleteInfo.eventId || !photoDeleteInfo.photoUrl) return;
      try {
        const res = await axios.delete(`http://localhost:5000/events/${photoDeleteInfo.eventId}/photos`, {
          data: { photoUrl: photoDeleteInfo.photoUrl },
        });
        const updatedPhotos = Array.isArray(res.data?.photos) ? res.data.photos : [];
        setEvents((prev) => prev.map((evt) => (evt._id === photoDeleteInfo.eventId ? { ...evt, photos: updatedPhotos } : evt)));
        setGalleryEvent((prev) => (prev && prev._id === photoDeleteInfo.eventId ? { ...prev, photos: updatedPhotos } : prev));
        showToast('success', 'Photo deleted successfully.');
      } catch (error) {
        console.error('Error deleting photo:', error);
        showToast('error', 'Failed to delete photo.');
      } finally {
        setPhotoDeleteInfo({ isOpen: false, eventId: null, photoUrl: '' });
      }
    };

    const handleUploadClick = (eventId) => {
        setSelectedEventId(eventId);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('photos', files[i]);
        }

        try {
            await axios.post(`http://localhost:5000/events/${selectedEventId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showToast('success', 'Photos uploaded successfully!');
            fetchEvents();
        } catch (error) {
            console.error('Error uploading photos:', error);
            showToast('error', 'Failed to upload photos');
        }
        
        // Reset input
        e.target.value = null;
        setSelectedEventId(null);
    };

    const openEventDonations = (event) => {
      setDonationsEvent(event);
      setEventDonations([]);
      setEventDonationsLoading(true);
      // Default new donation date to the event date
      const eventDate = event.date ? new Date(event.date) : new Date();
      setNewEventDonation({
        donorId: '',
        amount: '',
        date: eventDate.toISOString().split('T')[0],
        search: '',
      });
      axios
        .get(`http://localhost:5000/events/${event._id}/donations`)
        .then((res) => {
          setEventDonations(Array.isArray(res.data) ? res.data : []);
        })
        .catch(() => {
          setEventDonations([]);
        })
        .finally(() => {
          setEventDonationsLoading(false);
        });
    };

    const filteredDonors = donors.filter((d) => {
      if (!newEventDonation.search) return true;
      const query = newEventDonation.search.toLowerCase();
      const nameMatch = d.name?.toLowerCase().includes(query);
      const aadhaarMatch = (d.aadhaar ? String(d.aadhaar).toLowerCase() : '').includes(query);
      return nameMatch || aadhaarMatch;
    });

    const handleAddEventDonation = async () => {
      if (!newEventDonation.donorId || !newEventDonation.amount) {
        showToast('error', 'Please select a donor and enter amount.');
        return;
      }

      try {
        await axios.post(
          `http://localhost:5000/donors/${newEventDonation.donorId}/donations`,
          {
            amount: Number(newEventDonation.amount),
            date: newEventDonation.date,
          }
        );
        showToast('success', 'Donation recorded for this event.');

        // Refresh donations list for this event
        if (donationsEvent) {
          setEventDonationsLoading(true);
          axios
            .get(`http://localhost:5000/events/${donationsEvent._id}/donations`)
            .then((res) => {
              setEventDonations(Array.isArray(res.data) ? res.data : []);
            })
            .catch(() => {
              setEventDonations([]);
            })
            .finally(() => {
              setEventDonationsLoading(false);
            });
        }
      } catch (err) {
        console.error('Error adding donation for event:', err);
        showToast('error', 'Failed to add donation for this event.');
      }
    };

    const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
    const pastEvents = events.filter(e => new Date(e.date) < new Date());

    return (
      <MotionTab>
        <div className="px-6 py-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            multiple 
            accept="image/*"
            onChange={handleFileChange}
          />
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Events</h2>
            {role === 'admin' && (
              <ClickSpark>
                <button onClick={() => setIsEventModalOpen(true)} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2">
                  <Plus className="h-5 w-5" /> Add Event
                </button>
              </ClickSpark>
            )}
          </div>

          <div className="space-y-8">
            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-red-500" /> Upcoming Events
              </h3>
              {upcomingEvents.length === 0 ? (
                <p className="text-gray-500 italic">No upcoming events scheduled.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map(event => (
                    <div key={event._id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow">
                      <div className="flex justify-between items-start">
                          <div>
                              <p className="text-sm text-red-600 font-bold uppercase tracking-wide mb-1">{new Date(event.date).toLocaleDateString()}</p>
                              <h4 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h4>
                          </div>
                            {role === 'admin' && (
                              <button onClick={() => requestEventDeletion(event._id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                            )}
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                      <div className="space-y-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {event.location || 'TBD'}</div>
                        <div className="flex items-center gap-2"><Users className="h-4 w-4" /> {event.organizer || 'BloodBank Team'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-400" /> Past Events
              </h3>
              <div className="space-y-4">
                {pastEvents.map(event => (
                  <div key={event._id} className="bg-gray-50 p-4 rounded-lg flex flex-col md:flex-row justify-between items-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800">{event.title}</h4>
                      <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString()} • {event.location}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => {
                                if (event.photos && event.photos.length > 0) {
                                  setGalleryEvent(event);
                                } else {
                                  showToast('info', 'No photos available for this event.');
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <Image className="h-4 w-4" />
                            Photos {event.photos && event.photos.length > 0 && `(${event.photos.length})`}
                        </button>
                        <button 
                          onClick={() => openEventDonations(event)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <Droplets className="h-4 w-4" />
                          Donations
                        </button>
                        {role === 'admin' && (
                            <>
                                <button 
                                    onClick={() => handleUploadClick(event._id)}
                                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                >
                                    <Upload className="h-4 w-4" />
                                    Add Photos
                                </button>
                                <button onClick={() => requestEventDeletion(event._id)} className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4"/></button>
                            </>
                        )}
                    </div>
                  </div>
                ))}
                {pastEvents.length === 0 && <p className="text-gray-500 italic">No past events found.</p>}
              </div>
            </section>
          </div>

          {/* Simple Add Event Modal */}
          <AnimatePresence>
            {isEventModalOpen && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md"
                >
                  <h2 className="text-2xl font-bold mb-6">Add New Event</h2>
                  <div className="space-y-4">
                    <input placeholder="Event Title" className="w-full px-3 py-2 border rounded" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
                    <textarea placeholder="Description" className="w-full px-3 py-2 border rounded" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
                    <input type="date" className="w-full px-3 py-2 border rounded" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
                    <input placeholder="Location" className="w-full px-3 py-2 border rounded" value={newEvent.location} onChange={e => setNewEvent({...newEvent, location: e.target.value})} />
                    <input placeholder="Organizer" className="w-full px-3 py-2 border rounded" value={newEvent.organizer} onChange={e => setNewEvent({...newEvent, organizer: e.target.value})} />
                  </div>
                  <div className="mt-6 flex justify-end gap-4">
                    <button onClick={() => setIsEventModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                    <button onClick={handleAddEvent} className="px-4 py-2 bg-red-600 text-white rounded">Add Event</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Gallery Modal */}
          <AnimatePresence>
            {galleryEvent && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
                onClick={() => setGalleryEvent(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{galleryEvent.title} - Photos</h2>
                  </div>
                  
                  <div className="mb-6 min-h-[400px] flex items-center justify-center bg-gray-50 rounded-xl border border-gray-100 p-4">
                    {galleryEvent.photos && galleryEvent.photos.length > 0 ? (
                        <ScrollStack 
                          key={galleryEvent.photos.join('|')}
                            items={galleryEvent.photos} 
                            renderItem={(item) => (
                              <div className="relative w-full h-full">
                                <img 
                                  src={resolveImg(item.data)} 
                                  alt="Event photo" 
                                  className="w-full h-full object-cover" 
                                />
                                {role === 'admin' && item.stackIndex === 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setPhotoDeleteInfo({ isOpen: true, eventId: galleryEvent._id, photoUrl: item.data });
                                    }}
                                    className="absolute top-4 right-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-xs font-semibold shadow-lg hover:bg-red-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Delete Photo
                                  </button>
                                )}
                              </div>
                            )} 
                        />
                    ) : (
                        <p className="text-gray-500 italic">No photos available.</p>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Event Donations Modal */}
          <AnimatePresence>
            {donationsEvent && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-500/20 flex justify-center items-center z-50"
                onClick={() => setDonationsEvent(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {donationsEvent.title} - Donations
                    </h2>
                  </div>
                  {role === 'admin' && (
                    <div className="mb-5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                      <h3 className="text-sm font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <Droplets className="h-4 w-4" />
                        Add Donation for this Event
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Search Donor
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Type donor name or Aadhaar"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              value={newEventDonation.search}
                              onChange={(e) =>
                                setNewEventDonation((prev) => ({
                                  ...prev,
                                  search: e.target.value,
                                  donorId: '',
                                }))
                              }
                            />
                            {newEventDonation.search && (
                              <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
                                {filteredDonors.length === 0 ? (
                                  <p className="text-xs text-gray-500 px-3 py-2">No donors found.</p>
                                ) : (
                                  filteredDonors.slice(0, 8).map((d) => (
                                    <button
                                      key={d._id}
                                      type="button"
                                      onClick={() =>
                                        setNewEventDonation((prev) => ({
                                          ...prev,
                                          donorId: d._id,
                                          search: d.name,
                                        }))
                                      }
                                      className={`w-full text-left px-3 py-2 text-xs hover:bg-rose-50 ${
                                        newEventDonation.donorId === d._id ? 'bg-rose-100 text-rose-700' : 'text-gray-700'
                                      }`}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-gray-900">{d.name}</span>
                                        <div className="text-[10px] text-gray-500 flex gap-2">
                                          <span>{d.bloodType || '—'}</span>
                                          {d.aadhaar && <span>Aadhaar: {d.aadhaar}</span>}
                                        </div>
                                      </div>
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                          {newEventDonation.donorId && (
                            <p className="text-xs text-green-700 mt-2">
                              Selected donor: {
                                donors.find((d) => d._id === newEventDonation.donorId)?.name || '—'
                              }
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Amount (units)
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              value={newEventDonation.amount}
                              onChange={(e) =>
                                setNewEventDonation((prev) => ({
                                  ...prev,
                                  amount: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Donation Date
                            </label>
                            <input
                              type="date"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              value={newEventDonation.date}
                              onChange={(e) =>
                                setNewEventDonation((prev) => ({
                                  ...prev,
                                  date: e.target.value,
                                }))
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <button
                            onClick={handleAddEventDonation}
                            className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
                          >
                            Add Donation
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {eventDonationsLoading ? (
                    <p className="text-sm text-gray-500">Loading donations...</p>
                  ) : eventDonations.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No donations recorded for this event.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {eventDonations.map((d) => (
                        <div
                          key={d._id || d.date}
                          className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-2"
                        >
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{d.donorName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(d.date).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-red-600">
                            {d.amount} unit{d.amount === 1 ? '' : 's'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          <ConfirmationModal
            isOpen={Boolean(eventDeleteTarget)}
            onClose={() => setEventDeleteTarget(null)}
            onConfirm={confirmDeleteEvent}
            title="Delete Event"
            message="Are you sure you want to remove this event? This action cannot be undone."
          />
          <ConfirmationModal
            isOpen={photoDeleteInfo.isOpen}
            onClose={() => setPhotoDeleteInfo({ isOpen: false, eventId: null, photoUrl: '' })}
            onConfirm={handleDeletePhoto}
            title="Delete Photo"
            message="Remove this photo from the event gallery? This cannot be undone."
          />
        </div>
      </MotionTab>
    );
  };

  const LeaderboardTab = () => {
    const top3 = leaderboard.slice(0, 3);
    const rest = leaderboard.slice(3);

    const getBadgeColor = (badge) => {
      switch (badge) {
        case 'Gold': return 'from-yellow-400 to-yellow-600';
        case 'Silver': return 'from-gray-300 to-gray-500';
        case 'Bronze': return 'from-orange-400 to-orange-600';
        default: return 'from-blue-400 to-blue-600';
      }
    };

    return (
      <MotionTab>
        <div className="px-4 py-6 md:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Donor Leaderboard</h2>
            <p className="text-gray-500">Celebrating our top life savers</p>
          </div>

          {/* Podium Section */}
          {top3.length > 0 && (
            <div className="flex justify-center items-end gap-4 md:gap-8 mb-16 min-h-[300px]">
              {/* 2nd Place */}
              {top3[1] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-gray-300 overflow-hidden shadow-xl">
                       {top3[1].profilePhotoUrl ? (
                          <img src={resolveImg(top3[1].profilePhotoUrl)} alt={top3[1].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xl">
                            {top3[1].name.charAt(0)}
                          </div>
                        )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded-full text-sm shadow-md">
                      2nd
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-t-2xl shadow-lg w-32 md:w-40 text-center border-t-4 border-gray-300 h-40 flex flex-col justify-end pb-4">
                    <p className="font-bold text-gray-900 truncate w-full">{top3[1].name}</p>
                    <p className="text-sm text-gray-500">{top3[1].totalDonations} Donations</p>
                    <p className="text-xs font-bold text-blue-600 mt-1">{top3[1].points} pts</p>
                  </div>
                </motion.div>
              )}

              {/* 1st Place */}
              {top3[0] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="relative mb-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-yellow-400 overflow-hidden shadow-2xl ring-4 ring-yellow-100">
                       {top3[0].profilePhotoUrl ? (
                          <img src={resolveImg(top3[0].profilePhotoUrl)} alt={top3[0].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-yellow-50 flex items-center justify-center text-yellow-600 font-bold text-2xl">
                            {top3[0].name.charAt(0)}
                          </div>
                        )}
                    </div>
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                      <Trophy className="w-8 h-8 text-yellow-500 drop-shadow-md" fill="currentColor" />
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 font-bold px-4 py-1 rounded-full text-sm shadow-md">
                      1st
                    </div>
                  </div>
                  <div className="bg-gradient-to-b from-yellow-50 to-white p-4 rounded-t-2xl shadow-xl w-40 md:w-48 text-center border-t-4 border-yellow-400 h-52 flex flex-col justify-end pb-6">
                    <p className="font-bold text-lg text-gray-900 truncate w-full">{top3[0].name}</p>
                    <p className="text-yellow-700 font-medium">{top3[0].totalDonations} Donations</p>
                    <p className="text-sm font-bold text-blue-600 mt-1">{top3[0].points} pts</p>
                  </div>
                </motion.div>
              )}

              {/* 3rd Place */}
              {top3[2] && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-orange-300 overflow-hidden shadow-xl">
                       {top3[2].profilePhotoUrl ? (
                          <img src={resolveImg(top3[2].profilePhotoUrl)} alt={top3[2].name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-xl">
                            {top3[2].name.charAt(0)}
                          </div>
                        )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-orange-300 text-orange-900 font-bold px-3 py-1 rounded-full text-sm shadow-md">
                      3rd
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-t-2xl shadow-lg w-32 md:w-40 text-center border-t-4 border-orange-300 h-32 flex flex-col justify-end pb-4">
                    <p className="font-bold text-gray-900 truncate w-full">{top3[2].name}</p>
                    <p className="text-sm text-gray-500">{top3[2].totalDonations} Donations</p>
                    <p className="text-xs font-bold text-blue-600 mt-1">{top3[2].points} pts</p>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* List Section */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Donor</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Type</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Donations</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Points</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Badge</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Donation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {leaderboard.map((donor, index) => (
                    <motion.tr 
                      key={donor._id} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                          ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                            index === 1 ? 'bg-gray-100 text-gray-700' : 
                            index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}`}>
                          {index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <div className="relative cursor-pointer transition-transform group-hover:scale-105" onClick={() => openProfile(donor)}>
                            {donor.profilePhotoUrl ? (
                              <img
                                src={resolveImg(donor.profilePhotoUrl)}
                                alt={donor.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-full flex items-center justify-center text-red-600 font-bold border-2 border-white shadow-sm">
                                {donor.name.split(' ').map(n => n[0]).join('')}
                              </div>
                            )}
                          </div>
                          <div className="font-semibold text-gray-900">{donor.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold border border-red-100">
                          {donor.bloodType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900">{donor.totalDonations}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-blue-600 font-bold">
                          <Star className="w-3 h-3 fill-current" />
                          {donor.points}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm bg-gradient-to-r ${getBadgeColor(donor.badge)}`}>
                          {donor.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {donor.lastDonation}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Badge Information */}
          <motion.div 
            className="mt-8 bg-white rounded-lg shadow-lg p-6"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-red-600" />
              Badge Levels
            </h3>
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="p-4 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                <Trophy className="h-8 w-8 mb-2" />
                <p className="text-xl font-bold">Gold</p>
                <p className="text-l opacity-100 font-bold text-white">20+ donations</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-4 rounded-lg bg-gradient-to-br from-gray-300 to-gray-500 text-white">
                <Award className="h-8 w-8 mb-2" />
                <p className="text-xl font-bold">Silver</p>
                <p className="text-l opacity-100 font-bold text-white">10-19 donations</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-4 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white">
                <Award className="h-8 w-8 mb-2" />
                <p className="text-xl font-bold">Bronze</p>
                <p className="text-l opacity-100 font-bold text-white">5-9 donations</p>
              </motion.div>
              <motion.div variants={itemVariants} className="p-4 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                <Star className="h-8 w-8 mb-2" />
                <p className="text-xl font-bold">Beginner</p>
                <p className="text-l opacity-100 font-bold text-white">1-4 donations</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </MotionTab>
    );
  };



  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <Users className="h-5 w-5" /> },
    { id: 'donors', label: 'Donors', icon: <Users className="h-5 w-5" /> },
    { id: 'requests', label: 'Requests', icon: <Calendar className="h-5 w-5" /> },
    { id: 'events', label: 'Events', icon: <Calendar className="h-5 w-5" /> },
    { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="h-5 w-5" /> },
    { id: 'profile', label: 'My Profile', icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <>
      <GlobalClickSpark />
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white shadow-sm border-b border-red-200 z-40 shrink-0">
        <div className="px-6 py-5 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <Droplets className="h-8 w-8 text-red-600" />
              <h1 className="text-2xl font-bold text-gray-800">BloodBank</h1>
           </div>
           
           {/* Mobile Controls */}
           <div className="md:hidden flex items-center gap-3">
             <select
                className="block w-32 pl-2 pr-8 py-1 text-sm border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 rounded-md"
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
              >
                {tabs.map(tab => (
                  <option key={tab.id} value={tab.id}>{tab.label}</option>
                ))}
              </select>
              <button onClick={logout} className="text-gray-500 hover:text-red-600">
                <LogOut className="h-5 w-5" />
              </button>
           </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <aside 
          className={`hidden md:flex flex-col bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300 ${isSidebarExpanded ? 'w-64' : 'w-20'}`}
          onMouseEnter={() => setIsSidebarExpanded(true)}
        >
          {/* Close Button (only visible when expanded) */}
          <div className={`flex justify-end p-2 ${!isSidebarExpanded && 'hidden'}`}>
             <button onClick={(e) => { e.stopPropagation(); setIsSidebarExpanded(false); }} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
               <ChevronLeft className="h-5 w-5" />
             </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-red-50 text-red-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } ${!isSidebarExpanded ? 'justify-center px-2' : ''}`}
                title={!isSidebarExpanded ? tab.label : ''}
              >
                {tab.icon}
                {isSidebarExpanded && <span>{tab.label}</span>}
              </button>
            ))}
          </nav>

           <div className="p-4 border-t border-gray-100 bg-gray-50/50">
             {isSidebarExpanded ? (
              <>
                  <div 
                   className="flex items-center gap-3 mb-4 px-2 cursor-pointer"
                   onClick={() => setActiveTab('profile')}
                   title="View Profile"
                  >
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg">
                    {role ? role[0].toUpperCase() : 'U'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">Welcome</p>
                      <p className="text-xs text-gray-500 truncate">{userName || 'User'}</p>
                  </div>
                </div>
                 <button 
                   onClick={logout} 
                   className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
                 >
                   <LogOut className="h-4 w-4" /> 
                   Sign Out
                 </button>
               </>
             ) : (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 font-bold text-lg cursor-pointer"
                  title={userName || 'View Profile'}
                  onClick={() => setActiveTab('profile')}
                >
                  {role ? role[0].toUpperCase() : 'U'}
                </div>
                  <button onClick={logout} className="text-gray-500 hover:text-red-600" title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </button>
               </div>
             )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto px-4 py-2 md:px-8 md:py-2 scroll-smooth">
          <div className="py-2 mx-auto">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && <DashboardTab key="dashboard" />}
              {activeTab === 'donors' && <DonorsTab key="donors" />}
              {activeTab === 'requests' && <RequestsTab key="requests" />}
              {activeTab === 'events' && <EventsTab key="events" />}
              {activeTab === 'leaderboard' && <LeaderboardTab key="leaderboard" />}
              {activeTab === 'profile' && <ProfileTab key="profile" />}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Modals */}
      <RequestModal 
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        onSubmit={handleRequestSubmit}
        notify={showToast}
      />
      <RegisterDonorModal
        isOpen={isCreateDonorModalOpen}
        onClose={() => setIsCreateDonorModalOpen(false)}
        onSubmit={handleCreateDonor}
        notify={showToast}
      />
      <ProfileViewModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        donor={selectedDonor}
        resolveImg={resolveImg}
      />
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() => setDeleteConfirmation({ isOpen: false, donorId: null })}
        onConfirm={confirmDeleteDonor}
        title="Delete Donor"
        message="Are you sure you want to delete this donor? This action cannot be undone."
      />
      <ConfirmationModal
        isOpen={requestDeleteConfirmation.isOpen}
        onClose={() => setRequestDeleteConfirmation({ isOpen: false, requestId: null })}
        onConfirm={confirmDeleteRequest}
        title="Delete Request"
        message="Are you sure you want to delete this completed request?"
      />
      <AddDonationModal
        isOpen={isDonationModalOpen}
        onClose={() => { setIsDonationModalOpen(false); setDonorForDonation(null); }}
        onSubmit={handleAddDonation}
        donor={donorForDonation}
        notify={showToast}
      />
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </div>
    </>
  );
};


export default BloodBankApp;