import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, MessageCircle, PhoneCall, PhoneForwarded } from 'lucide-react';

const features = [
  {
    title: 'Bulk SMS',
    description: 'Send and receive SMS messages globally with our robust API.',
    icon: MessageSquare,
  },
  {
    title: 'WhatsApp Business',
    description: 'Engage with customers on WhatsApp using our official API.',
    icon: MessageCircle,
  },
  {
    title: 'Voice Solutions',
    description: 'Crystal-clear voice calling capabilities with global coverage.',
    icon: PhoneCall,
  },
  {
    title: 'IVR System',
    description: 'Create interactive voice response systems for your business.',
    icon: PhoneForwarded,
  },
];

export default function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen font-sans bg-gradient-to-b from-[#0d262f] to-[#1a3c47] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0d262f] border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-white text-2xl font-bold">BRIQ</div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="text-black bg-[#f5c518] px-4 py-2 rounded-lg hover:bg-[#f5c518]/90 transition-colors"
            >
              Login Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Background Image */}
      <section
        className="pt-32 pb-20 bg-[#1a3c47] bg-opacity-80 relative"
        style={{
          backgroundImage: `url(/assets/hero.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Overlay for Readability */}
        <div className="absolute inset-0 bg-[#1a3c47] bg-opacity-70 z-0"></div>
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              Instant & Reliable
              <br />
              <span className="text-[#f5c518]">Customer Management <br />Solutions</span>
            </h1>
            <p className="text-xl text-gray-200 mb-8">
              Reach your audience instantly with customized messages for
              promotions, notifications, updates, and reminders in Tanzania.
            </p>
            <motion.button
              onClick={handleGetStarted}
              className="mt-6 inline-block bg-[#f5c518] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#f5c518]/90 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[#1a3c47] bg-opacity-80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Grow Your Business With BRIQ
            </h2>
            <p className="text-lg text-gray-300">
              Explore how our bulk SMS, SMS API, and OTP solutions can transform your business in Tanzania
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-[#2a4b57] rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <feature.icon className="h-16 w-16 text-[#f5c518] mb-4 mx-auto" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0d262f] py-12 border-t border-gray-700">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo and Tagline */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">BRIQ SOLUTIONS INC.</h3>
              <p className="text-gray-300">
                Instant & Reliable Customer Management Solutions in Tanzania
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <p className="text-gray-300">
                Phone: <a href="tel:+255788344348" className="text-[#f5c518] hover:underline">+255788344348</a>
              </p>
              <p className="text-gray-300">
                Email: <a href="mailto:sms@briq.tz" className="text-[#f5c518] hover:underline">sms@briq.tz</a>
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#f5c518] transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#f5c518] transition-colors">Terms of Service</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-[#f5c518] transition-colors">Support</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-400">© BRIQ 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}