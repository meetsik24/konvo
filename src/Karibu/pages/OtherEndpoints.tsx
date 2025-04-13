// Karibu/pages/OtherEndpoints.tsx
import React from 'react';
import { motion } from 'framer-motion';

const OtherEndpoints: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="min-h-[calc(100vh-64px)] w-full bg-[#00333e] text-white font-exo"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00333e] to-gray-900 opacity-80" />
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
        <div className="absolute inset-0 particle-bg animate-particle-move" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] w-full pt-[80px] max-w-7xl mx-auto">
        {/* Left Side: Description (Sticky) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-[400px] border-r border-gray-700/50 p-6 sticky top-[80px] self-start"
        >
          {/* Header (Non-Scrollable) */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
              Other Endpoints
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Additional endpoints will be documented here in the future.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Placeholder for Future Content (Scrollable) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]"
        >
          {/* Placeholder for future content */}
          <div className="text-gray-400 text-base sm:text-lg">
            Coming soon...
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OtherEndpoints;