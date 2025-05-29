import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { register, setSuccessMessage, clearSuccessMessage, setError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';

// Placeholder for the logo and banner (replace with your actual assets)
import Logo from '/assets/briq2.png';
import loginBanner from '/assets/thumb3.jpg';

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

  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Centered Card with Two Segments */}
        <div className="flex flex-col md:flex-row">
          {/* Left Segment - Informational Image (hidden on mobile) */}
          <div className="hidden md:block w-full md:w-1/2 p-0 order-2 md:order-1">
            <img src={loginBanner} alt="Register Banner" className="w-full h-full object-cover" />
          </div>

          {/* Right Segment - Registration Form (first on mobile) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col items-center order-1 md:order-2">
            <div className="mb-4">
              <img src={Logo} alt="Logo" className="h-16 w-auto" />
            </div>
            <h2 className="text-lg font-semibold text-[#00333e] mb-2">Create Your Account</h2>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-[#00333e] hover:underline">Sign in</Link>
            </p>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-2 rounded mb-4 text-center">
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
                  className="flex items-center justify-center gap-2 bg-green-100 text-green-700 p-3 rounded-lg shadow-lg border border-green-200 mb-4"
                >
                  <CheckCircle className="w-6 h-6 animate-bounce text-green-600" />
                  <p className="text-sm font-semibold">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form className="space-y-4 w-full max-w-xs" onSubmit={handleSubmit}>
              <div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Full name"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Email address"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Mobile number (e.g., 0xxxxxxxxxx)"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00333e]"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={status === 'loading'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-[#00333e] text-white text-sm font-medium rounded-md hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-[#00333e] transition duration-200"
                disabled={status === 'loading'}
              >
                {status === 'loading' ? (
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
                    Registering...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Account
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modal for Success/Error Handling (if needed in future) */}
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
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
            {/* Placeholder for modal content */}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Register;