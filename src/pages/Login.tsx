import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';
import { setCredentials, setError } from '../store/slices/authSlice';
import { loginUser } from '../services/api';

const Login: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: location.state?.email || location.state?.phoneNumber || '',
    password: '',
  });
  const [error, setLocalError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLocalError(null);

    try {
      const { token, user } = await loginUser(formData.identifier, formData.password);
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
          <p className="mt-2 text-center text-xs sm:text-sm text-[#6f888c]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[#fddf0d] hover:text-[#00333e]">
              Sign up
            </Link>
          </p>
        </div>
        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Email or Phone number
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="input text-sm sm:text-base"
                placeholder="Email or Phone number"
                value={formData.identifier}
                onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
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
                className="input text-sm sm:text-base"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs sm:text-sm">{error}</div>}

          <div>
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
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;