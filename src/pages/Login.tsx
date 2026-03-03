import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Phone, PhoneCall, ArrowRight, Lock, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/slices/authSlice';
import { flake_request, flake_verify, loginUser } from '../services/api';

// Import images from public assets folder
const simuImage = '/assets/simu2.png';
const dashboard = '/assets/SMS.png';
const simuImage2 = '/assets/simu.png';
const whatsappIcon = '/assets/whatsapp-logo.png';

type LoginMethod = 'otp' | 'password';

const AuthScreen: React.FC = () => {
  // Login method toggle
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('otp');

  // OTP-based login state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'whatsapp' | 'sms' | 'call'>('whatsapp');
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [otp, setOtp] = useState('');

  // Password-based login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  // Images to rotate through on the right side
  const images = [
    simuImage,
    dashboard,
    simuImage2
  ];

  // Rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Rotating welcome messages
  const welcomeMessages = [
    { line1: "Hey there, superstar!", line2: "Ready to dive back in?" },
    { line1: "Long time no tap!", line2: "Let's get you back in." },
    { line1: "Knock knock!", line2: "It's your account calling." },
    { line1: "Your seat's still warm", line2: "hop back in!" },
    { line1: "Back for more?", line2: "We knew you'd be." },
  ];

  // Select a random message on component mount
  const welcomeMessage = useMemo(() => {
    return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
  }, []);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return setError('Please enter your phone number');

    setLoading(true);
    setError(null);

    try {
      await flake_request(phoneNumber, preferredChannel);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return setError('Enter the 6-digit code');

    setLoading(true);
    setError(null);

    try {
      console.log("📞 Calling flake_verify with phoneNumber:", phoneNumber, "otp:", otp);
      const { token, user, orange } = await flake_verify(phoneNumber, otp);
      dispatch(setCredentials({ user, token }));

      // Navigate based on user role/orange flag
      if (orange || user?.orange || user?.role === 'admin') {
        navigate('/orange/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      return setError('Please enter both username and password');
    }

    setLoading(true);
    setError(null);

    try {
      const { token, user } = await loginUser(username, password);
      dispatch(setCredentials({ user, token }));
      navigate((user?.orange || user?.role === 'admin') ? '/orange/dashboard' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials or server error');
    } finally {
      setLoading(false);
    }
  };

  // Reset form when switching methods
  const handleMethodSwitch = (method: LoginMethod) => {
    setLoginMethod(method);
    setError(null);
    setStep('input');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Form */}
        <div className="w-full lg:w-3/6 px-5 py-8 sm:p-8 lg:p-16 flex items-center justify-center bg-white min-h-screen lg:min-h-0 overflow-y-auto">
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-10">
              {/* <div className="flex items-center gap-2">
                <img src="/assets/briq.png" alt="Briq Logo" className="w-8 h-8" />

              </div> */}
            </div>

            {/* Welcome Text */}
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                {loginMethod === 'otp' ? (
                  step === 'input' ? (
                    <>
                      {welcomeMessage.line1}
                      <br />
                      {welcomeMessage.line2}
                    </>
                  ) : (
                    'Verify your phone'
                  )
                ) : (
                  'Welcome Back'
                )}
              </h1>
              <p className="text-sm text-gray-600">
                {loginMethod === 'otp' ? (
                  step === 'input'
                    ? 'Just your number. No passwords, No stress.'
                    : 'Enter the 6-digit code we sent you'
                ) : (
                  'Sign in with your username and password'
                )}
              </p>
            </div>

            {/* Login Method Toggle */}
            <div className="mb-6">
              <p className="text-xs text-gray-500 mb-3">Choose login method</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleMethodSwitch('otp')}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border transition-all ${loginMethod === 'otp'
                    ? 'border-[#00333e] bg-[#00333e] text-white shadow-sm'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">OTP</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMethodSwitch('password')}
                  className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border transition-all ${loginMethod === 'password'
                    ? 'border-[#00333e] bg-[#00333e] text-white shadow-sm'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                >
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Password</span>
                </button>
              </div>
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

            {/* Password Login Form */}
            {loginMethod === 'password' && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username or Phone Number"
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                    required
                  />
                </div>

                <div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="w-full py-3 text-sm bg-[#00333e] hover:bg-[#004d5c] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? 'Signing in...' : (
                    <>
                      Sign in <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* OTP Login Forms */}
            {loginMethod === 'otp' && (
              <>
                {/* Step 1: Phone Input */}
                {step === 'input' && (
                  <form onSubmit={handleSendOTP} className="space-y-4">
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
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-3">Send code via</p>
                      <div className="flex gap-2">
                        {/* WhatsApp */}
                        <button
                          type="button"
                          onClick={() => setPreferredChannel('whatsapp')}
                          className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all ${preferredChannel === 'whatsapp'
                            ? 'border-[#00333e] bg-[#00333e]/5'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          title="WhatsApp"
                        >
                          <img
                            src={whatsappIcon}
                            alt="WhatsApp"
                            className="w-5 h-5 object-contain"
                          />
                        </button>

                        {/* SMS */}
                        <button
                          type="button"
                          onClick={() => setPreferredChannel('sms')}
                          className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all ${preferredChannel === 'sms'
                            ? 'border-[#00333e] bg-[#00333e]/5'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          title="SMS"
                        >
                          <MessageCircle className="w-5 h-5 text-gray-600" />
                        </button>

                        {/* Voice Call */}
                        <button
                          type="button"
                          onClick={() => setPreferredChannel('call')}
                          className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all ${preferredChannel === 'call'
                            ? 'border-[#00333e] bg-[#00333e]/5'
                            : 'border-gray-300 hover:border-gray-400'
                            }`}
                          title="Voice Call"
                        >
                          <PhoneCall className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !phoneNumber}
                      className="w-full py-3 text-sm bg-[#00333e] hover:bg-[#004d5c] text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? 'Sending...' : (
                        <>
                          Continue <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Step 2: OTP Input */}
                {step === 'otp' && (
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-3">
                        Code sent to <span className="font-medium text-gray-700">{phoneNumber}</span>
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00333e] focus:border-transparent transition placeholder-gray-400"
                        placeholder="Enter 6-digit code"
                        autoFocus
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setStep('input');
                          setOtp('');
                          setError(null);
                        }}
                        className="flex-1 py-3 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="flex-1 py-3 text-sm bg-[#00333e] hover:bg-[#004d5c] text-white font-medium rounded-lg transition disabled:opacity-50"
                      >
                        {loading ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSendOTP}
                      disabled={loading}
                      className="text-sm text-[#00333e] hover:underline w-full text-center font-medium"
                    >
                      Resend code
                    </button>
                  </form>
                )}
              </>
            )}

            {/* Footer Links */}
            {/* <div className="mt-10 text-center text-xs text-gray-500">
              Copyright · Briq. All Rights Reserved{' '}
              <a href="#" className="text-[#00333e] hover:underline">Terms & Condition</a>
              {' · '}
              <a href="#" className="text-[#00333e] hover:underline">Privacy & Policy</a>
            </div> */}

            {/* Sign Up & Forgot Password Links */}
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
              <p className="text-xs text-gray-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate(ref ? `/register?ref=${encodeURIComponent(ref)}` : '/register')}
                  className="text-[#00333e] hover:underline font-medium inline-flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Sign up here
                </button>
              </p>
              <p className="text-xs text-gray-500">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-[#00333e] hover:underline font-medium"
                >
                  Forgot password?
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
            {/* Animated Dashboard Images */}
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

            {/* Logo Icon */}
            {/* <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="mb-6 inline-block"
            >
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-[#00333e] font-bold text-2xl">B</span>
                </div>
              </div>
            </motion.div> */}

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-3xl font-bold text-white mb-4"
            >
              A Unified Hub for Smarter
              <br />
              Communication Management
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-white/80 text-sm max-w-md mx-auto leading-relaxed"
            >
              Briq empowers you with a unified communication command center—
              delivering deep insights and a 360° view of your entire messaging world.
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

export default AuthScreen;