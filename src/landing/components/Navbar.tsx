import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bgColor, setBgColor] = useState('bg-[#00333e]/30'); // Deep Navy with transparency
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Docs', href: '/developer-docs' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const heroSection = document.getElementById('hero');
      const featuresSection = document.getElementById('features');
      const ctaSection = document.getElementById('cta');
      const scrollPosition = window.scrollY + 100;

      if (heroSection && scrollPosition < heroSection.offsetHeight) {
        setBgColor('bg-[#00333e]/30');
      } else if (featuresSection && scrollPosition < featuresSection.offsetHeight + featuresSection.offsetTop) {
        setBgColor('bg-[#fddfd0]/20'); // Light for features
      } else if (ctaSection && scrollPosition >= ctaSection.offsetTop) {
        setBgColor('bg-[#00333e]/40'); // Darker for CTA
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 backdrop-blur-md ${bgColor} border-b border-[#fddfd0]/30 py-4 px-6 flex justify-between items-center transition-colors duration-500`}>
      <div className="flex items-center space-x-4">
        <motion.img
          src="/assets/briq2.png"
          alt="Briq Logo"
          className="h-12 w-12"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.span
          className="text-[#fddfd0] font-bold text-2xl"
          style={{ fontFamily: 'Exo, sans-serif' }}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Briq
        </motion.span>
      </div>
      <div className="hidden md:flex items-center space-x-6">
        {navigation.map((item) => (
          <motion.div
            key={item.name}
            whileHover={{ y: -5, transition: { duration: 0.3 } }}
          >
            <Link
              to={item.href}
              className={clsx(
                'text-lg font-medium text-[#fddfd0] hover:text-white transition-all rounded-lg px-4 py-2',
                location.pathname === item.href && 'bg-[#fddfd0]/20'
              )}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {item.name}
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="md:hidden">
        <motion.button
          className="text-[#fddfd0] focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
        >
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </motion.button>
      </div>
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="md:hidden absolute top-16 right-6 w-48 bg-[#00333e]/50 backdrop-blur-md rounded-xl p-4 border border-[#fddfd0]/30"
        >
          <div className="flex flex-col space-y-3">
            {navigation.map((item) => (
              <motion.div
                key={item.name}
                whileHover={{ x: 5, transition: { duration: 0.3 } }}
              >
                <Link
                  to={item.href}
                  className={clsx(
                    'text-base font-medium text-[#fddfd0] hover:text-white hover:bg-[#fddfd0]/10 rounded-md px-3 py-2',
                    location.pathname === item.href && 'bg-[#fddfd0]/20'
                  )}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;