import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { setCredentials, setError } from '../store/slices/authSlice';
import { loginUser } from '../services/api';

const Login: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: location.state?.username || '',
    password: '',
  });
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const { token, user } = await loginUser(formData.username, formData.password);
      dispatch(setCredentials({ user, token }));
      navigate('/dashboard');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials or server error';
      setLocalError(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowModal(true); // Show the modal when "Forgot Password" is clicked
  };

  const handleModalClose = () => {
    setShowModal(false);
    // Navigate to the EnterOTP page with a mock phone number
    navigate('/enter-otp', { state: { phoneNumber: '+1234567890' } });
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
            Welcome back
          </h2>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input text-sm sm:text-base w-full"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
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
                required
                className="input text-sm sm:text-base w-full"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm text-center">{error}</div>}

          <div className="space-y-3 sm:space-y-4">
            <button
              type="submit"
              className="btn bg-[#00333e] text-white w-full flex justify-center items-center text-sm sm:text-base"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <>
                  <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Sign in
                </>
              )}
            </button>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="btn bg-gray-200 text-gray-700 w-full flex justify-center items-center text-sm sm:text-base"
                disabled={loading}
              >
                Forgot Password
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="btn bg-gray-200 text-gray-700 w-full flex justify-center items-center text-sm sm:text-base"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Sign up
              </button>
            </div>
          </div>
        </form>
      </motion.div>

      {/* Modal for OTP Sent Confirmation */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
          >
            <h3 className="text-lg font-bold text-[#00333e] mb-4">OTP Sent</h3>
            <p className="text-sm text-gray-600 mb-6">
              An OTP has been sent to your mobile number (+1234567890). Please enter the OTP to proceed.
            </p>
            <button
              onClick={handleModalClose}
              className="btn bg-[#00333e] text-white w-full flex justify-center items-center text-sm"
            >
              Proceed to Enter OTP
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;