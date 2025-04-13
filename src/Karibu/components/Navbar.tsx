// Navbar.tsx
import React from 'react';
import { ArrowLeft, Github } from 'lucide-react';

const Navbar: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#00333e] text-white px-6 py-4 border-b border-gray-900 shadow-xl z-50">
      <div className="flex items-center justify-between w-full">
        {/* Logo and Title - Far Left */}
        <div className="flex items-center gap-3">
          <img
            src="/assets/briq.png"
            alt="Logo"
            className="w-10 h-10 shadow-md"
          />
          <div className="text-[#fddf0d] font-bold text-xl tracking-tight">KARIBU APIs</div>
        </div>

        {/* Navigation Links - Far Right */}
        <nav className="flex items-center gap-6">
          <a
            href="https://github.com/BRIQ-BLOCK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-[#fddf0d] transition-colors"
          >
            <Github size={20} />
          </a>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#fddf0d] text-[#00333e] rounded-lg hover:bg-[#e6c70b] transition-colors font-semibold shadow-md">
            <ArrowLeft size={18} />
            Get Back to Briq
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;