import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { setError } from '../store/slices/authSlice';
import { resetPasswordWithOtp } from '../services/api';

// Placeholder for the logo (replace with your actual logo)
import Logo from '/assets/briq2.png'; // Adjust the path to your logo file

const ResetPassword: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '';

  const [formData, setFormData] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    if (!phoneNumber) {
      setLocalError('Phone number is missing. Please start the password reset process again.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      await resetPasswordWithOtp(phoneNumber, formData.otp, formData.password);
      setFormData({ otp: '', password: '', confirmPassword: '' });
      setShowSuccessPopup(true);
      setTimeout(() => {
        setShowSuccessPopup(false);
        navigate('/login');
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to reset password. Invalid OTP or server error.';
      setLocalError(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setLoading(false);
    }
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

      {/* Reset Password Form */}
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
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your phone and your new password
          </p>
        </div>

        {/* Form */}
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="New Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs sm:text-sm text-center">{error}</div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="group relative w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Back to Login
            </button>
            <button
              type="submit"
              className="group relative w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-[#00333e] hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
              disabled={loading}
            >
              {loading ? (
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
                  Resetting...
                </span>
              ) : (
                <>
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Reset Password
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 relative z-10"
          >
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 mb-4 text-green-600 animate-bounce" />
              <h3 className="text-lg font-bold text-[#00333e] mb-2">Password Reset Successful</h3>
              <p className="text-sm text-gray-600 text-center">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
            </div>
          </motion.div>
        </div>
      )}

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

export default ResetPassword;