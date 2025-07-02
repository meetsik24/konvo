// Karibu/components/Navbar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Github, Menu, X } from 'lucide-react';
import { Button } from '../../landing/components/ui/button';

const DocumentationNavbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle navigation to landing page
  const handleBackToBriq = () => {
    navigate('/');
    toggleMobileMenu(); // Close mobile menu after clicking
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md border border-gray-700/50 rounded-lg py-3 px-4 sm:px-6 transition-all duration-300 max-w-5xl w-[90%] font-exo ${
        scrolled ? 'bg-[#00333e]/90 shadow-lg' : 'bg-[#00333e]/60 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-2">
          <img
            src="/assets/briq.png"
            alt="Briq Logo"
            className="h-8 w-auto shadow-md"
          />
          <div className="text-[#fddf0d] font-bold text-sm sm:text-base uppercase tracking-tight">
            KARIBU API
          </div>
        </div>

        {/* Hamburger Icon for Mobile */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <a
            href="https://github.com/BRIQ-BLOCK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300 flex items-center gap-2"
          >
            <Github size={18} />
            GitHub
          </a>
          <Button
            onClick={handleBackToBriq}
            className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] text-xs sm:text-sm uppercase px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-all duration-300 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)] flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Get Back to Briq
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col items-center gap-4 bg-[#00333e] rounded-lg py-6 border-t border-gray-700/50">
          <a
            href="https://github.com/BRIQ-BLOCK"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300 flex items-center gap-2"
          >
            <Github size={18} />
            GitHub
          </a>
          <Button
            onClick={handleBackToBriq}
            className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] text-sm uppercase px-6 py-2 rounded-full transition-all duration-300 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)] flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Get Back to Briq
          </Button>
        </div>
      )}
    </nav>
  );
};

export default DocumentationNavbar;