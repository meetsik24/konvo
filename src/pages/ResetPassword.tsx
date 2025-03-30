import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { setError } from '../store/slices/authSlice';
import { resetPasswordWithOtp } from '../services/api';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 sm:space-y-8"
      >
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#00333e]">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the OTP sent to your phone and your new password
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="otp" className="sr-only">
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="input text-sm sm:text-base"
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
                className="input text-sm sm:text-base"
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
                className="input text-sm sm:text-base"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm">{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn bg-gray-200 text-gray-700 w-full flex justify-center items-center text-sm sm:text-base"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              Back to Login
            </button>
            <button
              type="submit"
              className="btn bg-[#00333e] text-white w-full flex justify-center items-center text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? 'Resetting...' : (
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
            className="bg-green-500 rounded-lg p-6 max-w-sm w-full mx-4 text-white"
          >
            <div className="flex flex-col items-center">
              <CheckCircle className="w-12 h-12 mb-4" />
              <h3 className="text-lg font-bold mb-2">Password Reset Successful</h3>
              <p className="text-sm text-center">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;