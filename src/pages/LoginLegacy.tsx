import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Phone, X } from 'lucide-react';
import { setCredentials, setError } from '../store/slices/authSlice';
import { loginUser, requestOtp } from '../services/api';

// Placeholder for the logo (replace with your actual logo)
import Logo from '/assets/briq2.png'; // Adjust the path to your logo file

const Login: React.FC = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: location.state?.username || '',
        password: '',
    });
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setLocalError] = useState<string | null>(null);
    const [modalError, setModalError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError(null);

        try {
            const { user, token } = await loginUser(formData.username, formData.password);
            dispatch(setCredentials({ user, token }));
            navigate((user?.orange || user?.role === 'admin') ? '/orange/dashboard' : '/dashboard');
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
            setShowModal(false);
            navigate('/ResetPassword', { state: { phoneNumber } });
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to send OTP. Please try again.';
            setModalError(errorMsg);
            dispatch(setError(errorMsg));
        } finally {
            setModalLoading(false);
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

            {/* Login Form */}
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

                {/* Welcome Text */}
                <div>
                    <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-extrabold text-[#00333e]">
                        Welcome Back
                    </h2>
                    <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
                        Sign in to continue to your dashboard
                    </p>
                </div>

                {/* Login Form */}
                <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4 sm:space-y-5">
                        <div>
                            <label htmlFor="username" className="sr-only">
                                Username | Phone-number
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                                placeholder="Username or Phone Number"
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
                                className="appearance-none rounded-lg relative block w-full px-3 py-2 sm:py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm sm:text-base transition duration-200"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-xs sm:text-sm text-center">{error}</div>
                    )}

                    <div className="space-y-3 sm:space-y-4">
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
                                    Signing in...
                                </span>
                            ) : (
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
                                className="group relative w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
                                disabled={loading}
                            >
                                Forgot Password
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/register')}
                                className="group relative w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-gray-300 text-sm sm:text-base font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
                                disabled={loading}
                            >
                                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                                Sign up
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>

            {/* Modal for Phone Number Input and OTP Sending */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full mx-4 relative z-10"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                            disabled={modalLoading}
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-[#00333e] mb-2">Reset Password</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter your phone number to receive an OTP
                        </p>

                        <form onSubmit={handleSendOTP}>
                            <div className="mb-4">
                                <label htmlFor="phoneNumber" className="sr-only">
                                    Phone Number
                                </label>
                                <input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    type="tel"
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00333e] focus:border-[#00333e] text-sm transition duration-200"
                                    placeholder="Phone Number (e.g., +1234567890)"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    disabled={modalLoading}
                                />
                            </div>

                            {modalError && (
                                <div className="text-red-500 text-xs mb-4">{modalError}</div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="group relative w-full flex justify-center items-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
                                    disabled={modalLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="group relative w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#00333e] hover:bg-[#002a36] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00333e] transition duration-200"
                                    disabled={modalLoading}
                                >
                                    {modalLoading ? (
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
                                            Sending...
                                        </span>
                                    ) : (
                                        <>
                                            <Phone className="w-4 h-4 mr-1" />
                                            Send OTP
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
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

export default Login;