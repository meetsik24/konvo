import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials, setError } from '../store/slices/authSlice';
import { registerUser, loginUser } from '../services/api';

const Register: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setLocalError] = useState<string | null>(null);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    if (!strongPasswordRegex.test(formData.password)) {
      setLocalError(
        'Password must be at least 8 characters long and include an uppercase letter, lowercase letter, number, and special character (!@#$%^&*).'
      );
      dispatch(setError('Weak password'));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Passwords do not match');
      dispatch(setError('Passwords do not match'));
      setLoading(false);
      return;
    }

    try {
      await registerUser(formData.name, formData.email, formData.phoneNumber, formData.password);
      const { token, user } = await loginUser(formData.email, formData.password);
      dispatch(setCredentials({
        user: { email: user.email, name: user.name, phoneNumber: user.phone_number },
        token,
      }));
      navigate('/');
    } catch (err: any) {
      console.log('Registration error:', err.response?.data); // Add this
      const errorMsg = err.response?.data?.message || 'Registration or login failed';
      setLocalError(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8"
      >
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#00333e]">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-[#6f888c]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[#fddf0d] hover:text-[#00333e]">
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input"
                placeholder="Full name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
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
                className="input"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="sr-only">
                Phone number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="input"
                placeholder="Phone number"
                value={formData.phoneNumber}
                onChange={handleChange}
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
                className="input"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
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
                className="input"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div>
            <button
              type="submit"
              className="btn bg-[#00333e] text-white w-full flex justify-center items-center"
              disabled={loading}
            >
              {loading ? 'Registering...' : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
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