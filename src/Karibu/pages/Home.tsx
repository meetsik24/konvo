import React from "react";
import { Bolt, Flame, Rocket } from "lucide-react";
import { Typewriter } from "react-simple-typewriter";

interface HomeProps {
  onSectionChange?: (section: string) => void;
}

const Home: React.FC<HomeProps> = ({ onSectionChange }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#00333e] text-white overflow-hidden">
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
        {/* Content */}
        <div className="relative z-10 text-center p-10 w-full max-w-5xl">
        {/* Header Section */}
        <div className="mb-12">
          <h1 className="text-7xl font-bold text-[#fddf0d] mb-4">
            <Typewriter
              words={[
                "Build with Kitonga APIs",
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
          <p className="text-lg text-gray-400">
            Modern documentation for modern developers
          </p>
        </div>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Quick Start Card */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors">
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
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors">
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
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-[#fddf0d] transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <Rocket className="text-teal-400" size={24} />
              <h3 className="text-xl font-semibold">Examples</h3>
            </div>
            <pre className="bg-[#00333e] p-2 rounded text-sm text-teal-300 ">
              {`import create from '@briq/'

      const app = create({
        name: 'MyApp',
        version: '1.0.0'
      });
      `}
            </pre>
          </div>
        </div>

        {/* Get Started Button */}
        <button
          onClick={() => onSectionChange && onSectionChange("sms")}
          className="mt-12 px-6 py-3 bg-[#fddf0d] text-[#00333e] rounded-lg hover:bg-teal-600 transition-colors"
        >
          Get Started
        </button>

        
      </div>
    </div>
  );
};

export default Home;
