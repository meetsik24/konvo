import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle, ArrowRight, LogIn } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { register, setSuccessMessage, clearSuccessMessage, setError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';

// Import images from public assets folder
const simuImage = '/assets/simu2.png';
const dashboard = '/assets/SMS.png';
const simuImage2 = '/assets/simu.png';

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { status, error, successMessage, token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  // Images to rotate through on the right side
  const images = [
    simuImage,
    dashboard,
    simuImage2
  ];

  // Rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Welcome messages for signup
  const welcomeMessages = [
    { line1: "Ready to get started?", line2: "Let's create your account!" },
    { line1: "Join the community!", line2: "Sign up in seconds." },
    { line1: "Welcome aboard!", line2: "Your journey starts here." },
  ];

  // Select a random message on component mount
  const welcomeMessage = useMemo(() => {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }, []);

  // Pre-fill referral code from URL ?ref=...
  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref && ref.trim()) {
      setFormData((prev) => ({ ...prev, referralCode: ref.trim() }));
    }
  }, [searchParams]);

  useEffect(() => {
    if (status === 'succeeded' && successMessage && token) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
        navigate('/dashboard');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, successMessage, token, navigate, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strongPasswordRegex.test(formData.password)) {
      dispatch(setError('Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (!@#$%^&*).'));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      dispatch(setError('Passwords do not match'));
      return;
    }

    try {
      await dispatch(register({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        mobileNumber: formData.mobileNumber,
        password: formData.password,
        referralCode: formData.referralCode || undefined,
      })).unwrap();

      dispatch(setSuccessMessage('Registration and login successful! Welcome aboard!'));
    } catch (err: any) {
      console.log('Registration/Login error:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="w-full lg:w-3/6 px-5 py-8 sm:p-8 lg:p-16 flex items-center justify-center bg-white min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-10">
              {/* Logo can be added here if needed */}
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {welcomeMessage.line1}
                <br />
                {welcomeMessage.line2}
              </h1>
              <p className="text-sm text-gray-600">
                Fill in your details to create your account
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
              >
                {Array.isArray(error) ? error.map((msg, index) => <p key={index}>{msg}</p>) : error}
              </motion.div>
            )}

            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="mb-6 flex items-center gap-2 bg-green-50 text-green-700 p-3.5 rounded-lg border border-green-200"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="mobileNumber"
                  name="mobileNumber"
                  type="tel"
                  autoComplete="tel"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Mobile Number (e.g., +255 712 345 678)"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <div>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  autoComplete="off"
                  className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                  placeholder="Referral code (optional)"
                  value={formData.referralCode}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 text-sm bg-[#00333e] hover:bg-[#004d5c] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                    Creating account...
                  </span>
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#00333e] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <LogIn className="w-3 h-3" />
                  Sign in here
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Dashboard Preview */}
        <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-[#00333e] via-[#001f26] to-[#00333e] items-center justify-center p-12 relative overflow-hidden">
          {/* Grid pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear_gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
          {/* Decorative glows */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-[#fddf0d]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#fddf0d]/5 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            {/* Animated Dashboard Images */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="mb-8 h-80 flex items-center justify-center"
              >
                <img
                  src={images[currentImageIndex]}
                  alt="Briq Dashboard"
                  className="max-w-md max-h-full mx-auto rounded-2xl object-contain"
                />
              </motion.div>
            </AnimatePresence>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              A Unified Hub for Smarter
              <br />
              Communication Management
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/80 text-sm max-w-md mx-auto leading-relaxed"
            >
              Briq empowers you with a unified communication command center—
              delivering deep insights and a 360° view of your entire messaging world.
            </motion.p>

            {/* Progress Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`h-1 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? 'w-8 bg-[#fddf0d]'
                    : 'w-1 bg-white/30'
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;