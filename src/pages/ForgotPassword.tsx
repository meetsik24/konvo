import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle, Phone } from 'lucide-react';
import { requestOtp } from '../services/api';

const simuImage = '/assets/simu2.png';
const dashboard = '/assets/SMS.png';
const simuImage2 = '/assets/simu.png';

const ForgotPassword: React.FC = () => {
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = [simuImage, dashboard, simuImage2];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const welcomeMessages = [
        { line1: "Forgot your password?", line2: "We'll help you reset it." },
        { line1: "No worries,", line2: "it happens to the best of us." },
        { line1: "Let's get you", line2: "back into your account." },
    ];

    const welcomeMessage = useMemo(() => {
        return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await requestOtp(phoneNumber);
            setSent(true);
            setTimeout(() => {
                navigate('/ResetPassword', { state: { phoneNumber } });
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            <div className="w-full min-h-screen flex flex-col lg:flex-row">
                {/* Left Side - Form */}
                <div className="w-full lg:w-3/6 p-8 lg:p-16 flex items-center justify-center bg-white">
                    <div className="w-full max-w-md">
                        {/* Logo placeholder */}
                        <div className="mb-10" />

                        {/* Welcome Text */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                                {welcomeMessage.line1}
                                <br />
                                {welcomeMessage.line2}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Enter your phone number and we'll send you a code to reset your password
                            </p>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
                            >
                                {error}
                            </motion.div>
                        )}

                        <AnimatePresence>
                            {sent && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="mb-6 flex items-center gap-2 bg-green-50 text-green-700 p-3.5 rounded-lg border border-green-200"
                                >
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <p className="text-sm font-medium">Code sent! Redirecting...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="phone"
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        placeholder="Phone Number (e.g., +255 712 345 678)"
                                        className="w-full pl-11 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                                        required
                                        disabled={loading || sent}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !phoneNumber || sent}
                                className="w-full py-3 text-sm bg-[#00333e] hover:bg-[#004d5c] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? 'Sending code...' : sent ? 'Code sent!' : (
                                    <>
                                        Send Reset Code <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Back to Login */}
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <p className="text-xs text-gray-500">
                                Remember your password?{' '}
                                <button
                                    type="button"
                                    onClick={() => navigate('/login')}
                                    className="text-[#00333e] hover:underline font-medium inline-flex items-center gap-1"
                                >
                                    <ArrowLeft className="w-3 h-3" />
                                    Back to login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Dashboard Preview */}
                <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-[#00333e] via-[#001f26] to-[#00333e] items-center justify-center p-12 relative overflow-hidden">
                    {/* Grid pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
                    {/* Decorative glows */}
                    <div className="absolute top-20 right-20 w-32 h-32 bg-[#fddf0d]/5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 left-20 w-40 h-40 bg-[#fddf0d]/5 rounded-full blur-3xl"></div>

                    <div className="relative z-10 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentImageIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6 }}
                                className="mb-8 h-80 flex items-center justify-center"
                            >
                                <img
                                    src={images[currentImageIndex]}
                                    alt="Briq Dashboard"
                                    className="max-w-md max-h-full mx-auto rounded-2xl object-contain"
                                />
                            </motion.div>
                        </AnimatePresence>

                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-3xl font-bold text-white mb-4"
                        >
                            Secure Account
                            <br />
                            Recovery
                        </motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-white/80 text-sm max-w-md mx-auto leading-relaxed"
                        >
                            We'll send a verification code to your phone so you can securely reset your password.
                        </motion.p>

                        {/* Progress Indicators */}
                        <div className="flex justify-center gap-2 mt-8">
                            {images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`h-1 rounded-full transition-all duration-300 ${index === currentImageIndex
                                        ? 'w-8 bg-[#fddf0d]'
                                        : 'w-1 bg-white/30'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
