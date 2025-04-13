// Karibu/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bolt, Flame, Rocket } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";
import { motion } from "framer-motion"; // For subtle animations

function DocumentationHome() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/documentation/sendsms');
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on navigation
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative min-h-[calc(100vh-80px)] w-full flex flex-col items-center justify-center bg-[#00333e] text-white overflow-hidden font-exo"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00333e] to-gray-900 opacity-80" />
        {/* Tech Texture with Circuit Pattern */}
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
        {/* Subtle Particle Animation */}
        <div className="absolute inset-0 particle-bg animate-particle-move" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center p-6 sm:p-10 w-full max-w-5xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-[#fddf0d] mb-4 leading-tight">
            <Typewriter
              words={[
                "Build with Briq APIs",
                "Modern APIs for Developers",
                "Start Building Today!",
              ]}
              loop={Infinity}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </h1>
          <p className="text-base sm:text-lg text-gray-400">
            Modern documentation for modern developers
          </p>
        </motion.div>

        {/* Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
        >
          {/* Quick Start Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Bolt className="text-teal-400" size={24} />
              <h3 className="text-xl font-semibold">Quick Start</h3>
            </div>
            <p className="text-gray-400 mb-4">
              Get started in seconds with our intuitive API
            </p>
            <pre className="bg-[#00333e] p-3 rounded text-sm text-teal-300">
              npm install @briq/docs
            </pre>
          </div>

          {/* Features Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="text-teal-400" size={24} />
              <h3 className="text-xl font-semibold">Features</h3>
            </div>
            <ul className="text-gray-400 space-y-2">
              <li>⚡ Blazing fast performance</li>
              <li>🔒 Type-safe APIs</li>
              <li>⚙️ Zero configuration</li>
              <li>🛠️ Modern tooling</li>
            </ul>
          </div>

          {/* Examples Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="text-teal-400" size={24} />
              <h3 className="text-xl font-semibold">Examples</h3>
            </div>
            <pre className="bg-[#00333e] p-2 rounded text-sm text-teal-300">
              {`import create from '@briq/'

const app = create({
  name: 'MyApp',
  version: '1.0.0'
});
`}
            </pre>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={handleGetStarted}
          className="mt-12 px-6 py-3 bg-[#fddf0d] text-[#00333e] rounded-lg text-base sm:text-lg font-semibold hover:bg-[#e5c90c] transition-all duration-300 hover:scale-105 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)]"
        >
          Get Started
        </motion.button>
      </div>
    </motion.div>
  );
}

export default DocumentationHome;