import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, AlertCircle, ArrowRight, HeartPulse, Heart, Users } from 'lucide-react';
import BloodCellModel from './BloodCellModel';
import ClickSpark from './ClickSpark';
import GlobalClickSpark from './GlobalClickSpark';
import Toast from './Toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'info' });
  const navigate = useNavigate();
  const toastTimeoutRef = useRef(null);
  const redirectTimeoutRef = useRef(null);

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
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, []);

  const { email, password, role } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/register`, {
        email,
        password,
        role,
      });
      localStorage.setItem('token', res.data.token);
      if (res.data.role) localStorage.setItem('role', res.data.role);
      showToast('success', 'Registration successful');
      redirectTimeoutRef.current = setTimeout(() => navigate('/'), 900);
    } catch (err) {
      setError(err.response?.data?.msg || 'User already exists or error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalClickSpark />
      <div className="min-h-screen flex bg-white">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <div className="bg-red-50 p-3 rounded-2xl">
                <HeartPulse className="w-8 h-8 text-red-600 fill-current" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Create an account
            </h2>
            <p className="mt-2 text-gray-500">
              Join our community of life savers today.
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={onSubmit}>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3 border border-red-100"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    value={email}
                    onChange={onChange}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    value={password}
                    onChange={onChange}
                    minLength="6"
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all duration-200"
                    placeholder="Create a password"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">Must be at least 6 characters long</p>
              </div>
            </div>

            <ClickSpark>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-red-600/20 text-sm font-bold text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </ClickSpark>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-red-600 hover:text-red-500 transition-colors">
                  Sign in instead
                </Link>
              </p>
            </div>
          </form>
          </div>
        </div>

        {/* Right Side - Branding */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden items-center justify-center p-12">
          {/* 3D Model Background */}
          <div className="absolute inset-0 z-0 opacity-80">
            <BloodCellModel />
          </div>

          {/* Abstract Background Shapes */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 -left-20 w-96 h-96 bg-red-700 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
            <div className="absolute bottom-0 -right-20 w-96 h-96 bg-red-950 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-lg text-white space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-4xl font-bold tracking-tight mb-6">
                Why Join Us?
              </h2>
              <ul className="space-y-6">
                {[
                  { 
                    title: "Save Lives", 
                    desc: "Your donation can save up to 3 lives.",
                    icon: Heart
                  },
                  { 
                    title: "Community", 
                    desc: "Join a network of heroes.",
                    icon: Users
                  }
                ].map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-center gap-4 p-4 rounded-2xl   border border-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="bg-white p-3 rounded-full shadow-lg shadow-red-900/20">
                      <item.icon className="w-6 h-6 text-red-600 fill-red-100" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-white">{item.title}</h3>
                      <p className="text-red-100/90">{item.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      <Toast
        isVisible={toast.isVisible}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />
    </>
  );
};

export default RegisterPage;
