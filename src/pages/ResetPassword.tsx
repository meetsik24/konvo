import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { setError } from '../store/slices/authSlice';
import { resetPasswordWithOtp } from '../services/api';

// Placeholder for the logo and banner (replace with your actual assets)
import Logo from '/assets/briq2.png';

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
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-3xl bg-white shadow-sm rounded-sm overflow-hidden">
        {/* Centered Card with Two Segments */}
        <div className="flex flex-col md:flex-row">
          {/* Right Segment - Reset Password Form (comes first on mobile) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col items-center order-1 md:order-2">
            <div className="mb-4">
              <img src={Logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <h2 className="text-lg font-semibold text-[#00333e] mb-2">Reset Password</h2>
            <p className="text-center text-sm text-gray-600 mb-4">
              Enter the OTP sent to your phone and your new password
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4 text-center">
                {error}
              </div>
            )}

            <AnimatePresence>
              {showSuccessPopup && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg border border-green-200 mb-4"
                >
                  <CheckCircle className="w-6 h-6 animate-bounce text-green-600" />
                  <p className="text-sm font-semibold">Password Reset Successful</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-4 w-full max-w-xs" onSubmit={handleSubmit}>
              <div>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Enter OTP"
                  value={formData.otp}
                  onChange={(e) => setFormData({ ...formData, otp: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="New Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                />
              </div>
              <div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
                >
                  <span className="flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
                  </span>
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto py-2 px-4 bg-[#00333e] text-white text-sm font-medium rounded-md hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-4 w-4 mr-2 text-white"
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
                    <span className="flex items-center justify-center">
                      <Lock className="w-4 h-4 mr-2" /> Reset Password
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Left Segment - Informational Image (hidden on mobile) */}
          <div className="hidden md:block w-full md:w-1/2 p-0 order-2 md:order-1">
            <img src="/assets/thumb3.jpg" alt="Info Banner" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;