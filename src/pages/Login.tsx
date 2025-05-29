import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, X } from 'lucide-react';
import { setCredentials, setError, clearError } from '../store/slices/authSlice';
import { loginUser, requestOtp } from '../services/api';
import { AppDispatch, RootState } from '../store/store'; // Adjust path to your store file

// Placeholder for the logo and banner (replace with your actual assets)
import Logo from '/assets/briq2.png';
import loginBanner from '/assets/thumb3.jpg';

const Login: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { error: globalError } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: location.state?.username || '',
    password: '',
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);
    dispatch(clearError());

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
    setShowModal(true);
    setModalError(null); // Clear modal error when opening
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError(null);

    if (!phoneNumber) {
      setModalError('Please enter a phone number.');
      setModalLoading(false);
      return;
    }

    try {
      await requestOtp(phoneNumber);
      setShowModal(false); // Close modal after successful request
      navigate('/ResetPassword', { state: { phoneNumber } }); // Navigate with state
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to send OTP. Please try again.';
      setModalError(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setModalLoading(false);
    }
  };

  // Sync global error with local state if it exists
  useEffect(() => {
    if (globalError && !localError) {
      setLocalError(globalError);
    }
  }, [globalError, localError]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Right Section (Login Form) - First on Mobile */}
      <div className="order-first md:order-last w-full md:w-1/2 bg-white p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-sm space-y-4"
        >
          {/* Logo in Top Center */}
          <div className="flex justify-center mb-4">
            <img src={Logo} alt="Logo" className="h-20 w-auto" />
          </div>

          <h2 className="text-lg font-semibold text-[#00333e] text-center">Log in to your account</h2>

          {(localError || globalError) && (
            <div className="bg-red-50 text-red-600 text-sm p-2 rounded text-center">
              {localError || globalError}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                placeholder="Username or Email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
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
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#00333e] text-white text-sm font-medium rounded-md hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
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
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <LogIn className="w-4 h-4 mr-2" />
                  Log in
                </span>
              )}
            </button>

            <div className="text-sm text-[#00333e] text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:underline"
                disabled={loading}
              >
                Forgot username?
              </button>
              <span className="mx-2">|</span>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="hover:underline"
                disabled={loading}
              >
                Reset password
              </button>
            </div>
          </form>

          {/* Create Account Button */}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full py-2 px-4 border border-[#00333e] text-[#00333e] text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
          >
            Create account
          </button>
        </motion.div>
      </div>

      {/* Left Section (Image and Content) - Last on Mobile */}
      <div className="order-last md:order-first w-full md:w-1/2 bg-gray-100 p-6 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 flex justify-center">
            {/* Centered Image */}
            <div className="w-60 h-100 rounded-md overflow-hidden">
              <img src={loginBanner} alt="Login Banner" className="w-full h-full object-cover" />
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[#00333e] mb-2">Welcome to Briq</h2>
          <p className="text-sm text-gray-600 mb-4">
            Empowering your journey with cutting-edge solutions tailored for your success.
          </p>
          <a href="#" className="text-sm text-[#00333e] hover:underline">Learn more about Briq</a>
        </motion.div>
      </div>

      {/* Modal for Phone Number Input and OTP Sending */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-md shadow-md p-4 max-w-sm w-full mx-2 relative z-10"
          >
            <button
              onClick={() => {
                setShowModal(false);
                setModalError(null); // Clear error when closing manually
              }}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              disabled={modalLoading}
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-sm font-semibold text-[#00333e] mb-2">Reset Password</h3>
            <p className="text-xs text-gray-600 mb-3">Enter your phone number to receive an OTP</p>

            <form onSubmit={handleSendOTP}>
              <div className="mb-3">
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Phone Number (e.g., +1234567890)"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={modalLoading}
                />
              </div>

              {modalError && (
                <div className="text-red-600 text-xs mb-3">{modalError}</div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setModalError(null);
                  }}
                  className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-2 px-4 bg-[#00333e] text-white text-sm font-medium rounded-md hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
                  disabled={modalLoading}
                >
                  {modalLoading ? (
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
                      Sending...
                    </span>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Login;