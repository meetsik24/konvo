import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#00333e] font-inter p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#fddf0d] opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fddf0d] opacity-5 rounded-full blur-3xl -ml-10 -mb-10"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center relative z-10 max-w-lg mx-auto"
      >
        <motion.div
          initial={{ scale: 0.8, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2
          }}
          className="inline-block mb-6"
        >
          <Compass className="w-24 h-24 text-[#fddf0d] mx-auto opacity-80" />
        </motion.div>

        <h1 className="text-8xl font-bold text-white mb-2 tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-[#fddf0d] mb-4">Lost in the digital void?</h2>

        <p className="text-gray-300 text-lg mb-8 leading-relaxed">
          The page you're looking for has gone on a permanent vacation.
          Or maybe it never existed. Deep thoughts.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-white text-[#00333e] px-8 py-3 rounded-xl font-bold hover:bg-[#fddf0d] transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
        >
          <Home className="w-5 h-5" />
          <span>Return to Base</span>
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;