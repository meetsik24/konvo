import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { register, setSuccessMessage, clearSuccessMessage, setError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';

// Placeholder for the logo (replace with your actual logo)
import Logo from '/assets/briq2.png'; // Adjust the path to your logo file

const Register: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { status, error, successMessage, token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: '',
  });

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

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
    <div className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gradient Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom right, #00333e, #111827)',
        }}
      />

      {/* Animated Particle Texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.2) 1px, transparent 0),
            radial-gradient(circle at 20px 20px, rgba(255, 255, 255, 0.15) 1px, transparent 0),
            radial-gradient(circle at 40px 40px, rgba(255, 255, 255, 0.1) 1px, transparent 0),
            radial-gradient(circle at 60px 60px, rgba(255, 255, 255, 0.15) 1px, transparent 0),
            radial-gradient(circle at 80px 80px, rgba(255, 255, 255, 0.2) 1px, transparent 0)
          `,
          backgroundSize: '100px 100px',
          backgroundBlendMode: 'overlay',
          animation: 'drift 20s linear infinite',
          opacity: 0.3,
        }}
      />

      {/* Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 sm:p-8 space-y-6 sm:space-y-8 relative z-10"
      >
        {/* Logo Section */}
        <div className="flex justify-center">
          <motion.img
            src={Logo}
            alt="Logo"
            className="h-12 sm:h-16 w-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>

        {/* Heading and Subtext */}
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#00333e]">
            Create Your Account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#fddf0d] hover:text-[#00333e] transition duration-200">
              Sign in
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username" // Added to help Chrome identify the username field
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="fullName" className="sr-only">
                Full name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email" // Added to help Chrome identify the email field
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="mobileNumber" className="sr-only">
                Mobile number
              </label>
              <input
                id="mobileNumber"
                name="mobileNumber"
                type="tel"
                autoComplete="tel" // Added to help Chrome identify the phone number field
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Mobile number (e.g., 0xxxxxxxxxx)"
                value={formData.mobileNumber}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password" // Added to enable Chrome password suggestion
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password" // Added to ensure Chrome treats this as part of the new password flow
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs sm:text-sm text-center">
              {Array.isArray(error) ? error.map((msg, index) => <p key={index}>{msg}</p>) : error}
            </div>
          )}

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex items-center justify-center gap-1 sm:gap-2 bg-green-100 text-green-700 p-2 sm:p-3 rounded-lg shadow-lg border border-green-200"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce text-green-600" />
                <p className="text-xs sm:text-sm font-semibold">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-[#00333e] hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
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
                  Registering...
                </span>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* CSS for the Animated Texture */}
      <style>
        {`
          @keyframes drift {
            0% {
              background-position: 0 0;
            }
            100% {
              background-position: 100px 100px;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .animated-texture {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default Register;