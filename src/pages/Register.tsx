import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, CheckCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { register, setSuccessMessage, clearSuccessMessage, setError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store/store';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 sm:space-y-8"
      >
        <div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#00333e]">
            Create your account
          </h2>
          <p className="mt-2 text-center text-xs sm:text-sm text-[#6f888c]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#fddf0d] hover:text-[#00333e]">
              Sign in
            </Link>
          </p>
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
                className="input text-sm sm:text-base"
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
                className="input text-sm sm:text-base"
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
                required
                className="input text-sm sm:text-base"
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
                required
                className="input text-sm sm:text-base"
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
                required
                className="input text-sm sm:text-base"
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
                required
                className="input text-sm sm:text-base"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={status === 'loading'}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs sm:text-sm">
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
                className="flex items-center justify-center gap-1 sm:gap-2 bg-green-100 text-green-700 p-2 sm:p-3 rounded-lg shadow-lg"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce" />
                <p className="text-xs sm:text-sm font-semibold">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <button
              type="submit"
              className="btn bg-[#00333e] text-white w-full flex justify-center items-center text-sm sm:text-base"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Registering...' : (
                <>
                  <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Create account
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Register;