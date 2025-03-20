import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import heroImage from '../assets/hero.png'; // Corrected image path
import {
  MessageSquare,
  Mail,
  MessageCircle,
  PhoneCall,
  PhoneForwarded,
  Hash,
  Bot,
  Smartphone,
  BarChart3,
  Shield,
  Globe,
  Zap
} from 'lucide-react';

const features = [
  {
    title: 'SMS API',
    description: 'Send and receive SMS messages globally with our robust API.',
    icon: MessageSquare,
    category: 'core'
  },
  {
    title: 'Email Services',
    description: 'Deliver transactional and marketing emails with high deliverability.',
    icon: Mail,
    category: 'core'
  },
  {
    title: 'WhatsApp Business',
    description: 'Engage with customers on WhatsApp using our official API.',
    icon: MessageCircle,
    category: 'core'
  },
  {
    title: 'Voice Solutions',
    description: 'Crystal-clear voice calling capabilities with global coverage.',
    icon: PhoneCall,
    category: 'core'
  },
  {
    title: 'IVR System',
    description: 'Create interactive voice response systems for your business.',
    icon: PhoneForwarded,
    category: 'advanced'
  },
  {
    title: 'USSD Services',
    description: 'Deploy USSD applications for mobile users.',
    icon: Hash,
    category: 'advanced'
  },
  {
    title: 'AI Chatbots',
    description: 'Automate customer interactions with AI-powered chatbots.',
    icon: Bot,
    category: 'advanced'
  },
  {
    title: 'eSIM Technology',
    description: 'Manage eSIM profiles and connectivity with ease.',
    icon: Smartphone,
    category: 'advanced'
  },
  {
    title: 'Analytics',
    description: 'Track and analyze customer interactions in real-time.',
    icon: BarChart3,
    category: 'tools'
  },
  {
    title: 'Security',
    description: 'Enterprise-grade security for all communications.',
    icon: Shield,
    category: 'tools'
  },
  {
    title: 'Global Reach',
    description: 'Connect with customers worldwide through our network.',
    icon: Globe,
    category: 'tools'
  },
  {
    title: 'Quick Integration',
    description: 'Easy-to-implement APIs with comprehensive documentation.',
    icon: Zap,
    category: 'tools'
  }
];

export default function Home() {
  const navigate = useNavigate(); // Hook to handle navigation

  const handleGetStarted = () => {
    navigate('/login'); // Navigate to the login page
  };

  return (
    <div className="pt-16 font-sans" style={{ fontFamily: 'Exo, sans-serif' }}>
      {/* Hero Section with Navy Gradient */}
      <section className="relative overflow-hidden py-20 sm:py-32" style={{
        background: 'linear-gradient(135deg, #00333e 0%, #02141a 100%)'
      }}>
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center md:text-left mb-10 md:mb-0"
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight text-white sm:text-5xl mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Instant & Reliable
              <br />
              <span className="text-yellow-400">Customer Management  <br />Solutions</span>
            </motion.h1>
            <motion.p
              className="mt-4 text-lg leading-7 text-gray-200 max-w-xl mx-auto md:mx-0"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Reach your audience instantly with customized messages for promotions, notifications, updates, and reminders.
            </motion.p>
            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  className="w-full sm:w-64 p-3 rounded-l-md bg-gray-800 text-white border-none focus:outline-none"
                />
                <motion.button
                  className="bg-yellow-400 text-gray-900 p-3 rounded-r-md hover:bg-yellow-500 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  Request Callback
                </motion.button>
              </div>
              <p className="text-gray-400 text-sm mt-2 sm:mt-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Or Call: +255 788 344 348
              </p>
            </motion.div>
            <motion.button
              onClick={handleGetStarted} // Use button with onClick instead of <a>
              className="mt-6 inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Get Started <ArrowRight className="ml-2 h-4 w-4 inline" />
            </motion.button>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-10 md:mt-0"
          >
            <img
              src="/assets/hero.png"
              alt="Hero Illustration"
              className="max-w-xs md:max-w-sm lg:max-w-md mx-auto md:mx-0"
            />
          </motion.div>
        </div>
        <motion.p
          className="text-center text-gray-400 text-sm mt-8"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          150+ businesses are growing faster with simple, effective SMS communication.
        </motion.p>
      </section>

      {/* Features Section with Notify Africa Style */}
      <section id="features" className="py-24" style={{
        background: 'linear-gradient(135deg, #00333e 0%, #02141a 100%)'
      }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'Exo, sans-serif' }}>
              Grow Your Business With Briq
            </h2>
            <p className="mt-4 text-lg text-gray-200" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Explore how our solutions can transform your industry
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800 bg-opacity-70 backdrop-blur-md p-6 rounded-xl shadow-lg text-white hover:bg-opacity-80 transition-all"
              >
                <feature.icon className="h-8 w-8 text-yellow-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: 'Exo, sans-serif' }}>{feature.title}</h3>
                <p className="text-gray-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Yellow Gradient */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, #00333e 0%, #7b6d00 100%)'
      }}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ fontFamily: 'Exo, sans-serif' }}>
              Ready to transform your customer engagement?
            </h2>
            <p className="mt-4 text-lg text-yellow-50" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              Join Briq today and elevate your communication strategy.
            </p>
            <div className="mt-8">
              <motion.button
                onClick={handleGetStarted} // Use button with onClick instead of <a>
                className="inline-block bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 inline" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}