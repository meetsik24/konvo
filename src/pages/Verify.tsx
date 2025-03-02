import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setVerified } from '../store/slices/authSlice';
import { verifyOtp, resendOTP } from '../services/api';


const Verify = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(30);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || '';
    const phoneNumber = location.state?.phoneNumber || '';
    const [notification, setNotification] = useState({
        show: false,
        message: '',
        type: 'success' as 'success' | 'error'
    });
    const dispatch = useDispatch();

    useEffect(() => {
        if (!phoneNumber) {
            navigate('/register');
        }
    }, [phoneNumber, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (index: number, value: string) => {
        if (value.length > 1) return;
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const resendOTPHandler = async () => {
        setCountdown(30);
        try {
            await resendOTP(phoneNumber, 'sms'); // Use the imported resendOTP function
            setNotification({
                show: true,
                message: 'New OTP sent successfully',
                type: 'success'
            });
        } catch {
            setNotification({
                show: true,
                message: 'Failed to send OTP. Please try again.',
                type: 'error'
            });
        }
    };

    const verifyOTP = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            setError('Please enter all digits');
            return;
        }

        setLoading(true);
        
        try {
            // Call the real API endpoint
            const response = await verifyOtp(otpString, 'sms', phoneNumber);

            if (response.success) {
                dispatch(setVerified());
                
                setNotification({
                    show: true,
                    message: 'Account verified successfully! Redirecting to login...',
                    type: 'success'
                });

                // Redirect after showing success message
                setTimeout(() => {
                    navigate('/login', { 
                        state: { 
                            message: 'Account verified successfully. Please login.',
                            email 
                        } 
                    });
                }, 2000);
            } else {
                throw new Error('Invalid OTP');
            }
        } catch {
            setError('Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-primary-500" />
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Verify Your Account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a verification code to<br />
                        <span className="font-medium">{email}</span>
                    </p>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="flex gap-2 justify-center">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => inputRefs.current[index] = el}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(index, e.target.value)}
                                onKeyDown={e => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-2xl rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-primary-500"
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        onClick={verifyOTP}
                        disabled={loading || otp.includes('')}
                        className="w-full btn btn-primary"
                    >
                        {loading ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                            'Verify Account'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            onClick={resendOTPHandler}
                            disabled={countdown > 0}
                            className="text-primary-600 hover:text-primary-500 text-sm font-medium"
                        >
                            {countdown > 0 ? (
                                `Resend code in ${countdown}s`
                            ) : (
                                'Resend verification code'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {notification.show && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${
                    notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                    {notification.message}
                </div>
            )}
        </motion.div>
    );
};

export default Verify;
