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
      <div className="relative z-10 text-center p-4 sm:p-6 md:p-10 w-full max-w-5xl">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-[#fddf0d] mb-4 leading-tight">
            <Typewriter
              words={[
                "Send Instant Messages",
                "Manage Workspaces",
                "Create Campaigns",
              ]}
              loop={Infinity}
              cursor
              cursorStyle="|"
              typeSpeed={70}
              deleteSpeed={50}
              delaySpeed={1000}
            />
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-400">
            Powerful APIs to manage SMS messaging, workspaces, and campaigns with ease.
          </p>
        </motion.div>

        {/* Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 w-full"
        >
          {/* Instant Messaging Card */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Bolt className="text-teal-400" size={24} />
              <h3 className="text-lg sm:text-xl font-semibold">Instant Messaging</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Send SMS messages instantly to recipients.
            </p>
            <motion.pre
              whileHover={{ scale: 1.02 }}
              className="bg-[#00333e] p-2 sm:p-3 rounded text-xs sm:text-sm text-teal-300 whitespace-pre-wrap overflow-x-auto transition-transform duration-200 [box-shadow:_0_0_5px_rgba(253,223,13,0.2)]"
            >
              <span className="text-green-400">curl</span>{' '}
              <span className="text-purple-400">-X POST</span>{' '}
              <span className="text-blue-300">/v1/message/send-instant</span>{' '}
              <span className="text-yellow-400">\\\n-H "X-API-Key: &lt;key&gt;"</span>{' '}
              <span className="text-red-400">\\\n-d &#123;"content": "Hello!"&#125;</span>
            </motion.pre>
          </div>

          {/* Workspace Card */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Flame className="text-teal-400" size={24} />
              <h3 className="text-lg sm:text-xl font-semibold">Workspace</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Create and manage workspaces for your projects.
            </p>
            <motion.pre
              whileHover={{ scale: 1.02 }}
              className="bg-[#00333e] p-2 sm:p-3 rounded text-xs sm:text-sm text-teal-300 whitespace-pre-wrap overflow-x-auto transition-transform duration-200 [box-shadow:_0_0_5px_rgba(253,223,13,0.2)]"
            >
              <span className="text-green-400">curl</span>{' '}
              <span className="text-purple-400">-X POST</span>{' '}
              <span className="text-blue-300">/v1/workspace/create/</span>{' '}
              <span className="text-yellow-400">\\\n-H "X-API-Key: &lt;key&gt;"</span>{' '}
              <span className="text-red-400">\\\n-d &#123;"name": "Workspace"&#125;</span>
            </motion.pre>
          </div>

          {/* Campaigns Card */}
          <div className="bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors duration-300">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="text-teal-400" size={24} />
              <h3 className="text-lg sm:text-xl font-semibold">Campaigns</h3>
            </div>
            <p className="text-gray-400 text-xs sm:text-sm mb-4">
              Schedule and manage SMS campaigns.
            </p>
            <motion.pre
              whileHover={{ scale: 1.02 }}
              className="bg-[#00333e] p-2 sm:p-3 rounded text-xs sm:text-sm text-teal-300 whitespace-pre-wrap overflow-x-auto transition-transform duration-200 [box-shadow:_0_0_5px_rgba(253,223,13,0.2)]"
            >
              <span className="text-green-400">curl</span>{' '}
              <span className="text-purple-400">-X POST</span>{' '}
              <span className="text-blue-300">/v1/campaign/create/</span>{' '}
              <span className="text-yellow-400">\\\n-H "X-API-Key: &lt;key&gt;"</span>{' '}
              <span className="text-red-400">\\\n-d &#123;"name": "Campaign"&#125;</span>
            </motion.pre>
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