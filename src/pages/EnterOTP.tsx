import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowLeft } from 'lucide-react';
import { setError } from '../store/slices/authSlice';

const EnterOTP: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const phoneNumber = location.state?.phoneNumber || '';
  const [otp, setOtp] = useState('');
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    if (!phoneNumber) {
      setLocalError('Phone number is missing. Please start the password reset process again.');
      setLoading(false);
      return;
    }

    if (otp.length < 4) {
      setLocalError('Please enter a valid OTP.');
      setLoading(false);
      return;
    }

    try {
      if (otp !== '123456') {
        throw new Error('Invalid OTP. Please try again.');
      }
      navigate('/reset-password', { state: { phoneNumber } });
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify OTP. Please try again.';
      setLocalError(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = () => {
    setLoading(true);
    setLocalError(null);
    try {
      // Mock resend OTP (since requestPasswordResetOtp was removed)
      setTimeout(() => {
        alert('A new OTP has been sent to your phone number. (Mock OTP: 123456)');
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to resend OTP. Please try again.';
      setLocalError(errorMsg);
      dispatch(setError(errorMsg));
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
            Enter OTP
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#6f888c]">
            Enter the OTP sent to your phone number ({phoneNumber}).
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
                className="input text-sm sm:text-base w-full"
                placeholder="Enter OTP (Mock OTP: 123456)"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-[#fddf0d] hover:text-[#00333e] text-xs sm:text-sm"
                disabled={loading}
              >
                Resend OTP
              </button>
            </div>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm text-center">{error}</div>}

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
              {loading ? 'Verifying...' : (
                <>
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Verify OTP
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EnterOTP;