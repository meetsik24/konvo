import React from 'react';
import { motion } from 'framer-motion';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#00333e] text-white py-12">
      <div className="container mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h3 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Exo, sans-serif' }}>Connect With Us</h3>
          <div className="flex justify-center space-x-6 mb-6">
            <a href="https://twitter.com" className="text-[#fddfd0] hover:text-white text-lg transition-colors">Twitter</a>
            <a href="https://linkedin.com" className="text-[#fddfd0] hover:text-white text-lg transition-colors">LinkedIn</a>
            <a href="https://facebook.com" className="text-[#fddfd0] hover:text-white text-lg transition-colors">Facebook</a>
          </div>
          <p className="text-sm mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span className="text-[#fddfd0]">Email:</span> support@briq.com | <span className="text-[#fddfd0]">Phone:</span> +255 788 344 348
          </p>
          <p className="text-xs" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            © 2025 Briq. All rights reserved. | <a href="/terms" className="text-[#fddfd0] hover:text-white">Terms</a> | <a href="/privacy" className="text-[#fddfd0] hover:text-white">Privacy</a>
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;