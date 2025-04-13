// Karibu/components/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/briq.png";

function Navbar() {
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Smooth scroll to section
  const handleScrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: "smooth",
      });
    }
    toggleMobileMenu();
  };

  // Handle navigation to documentation
  const handleDocumentationClick = () => {
    navigate("/documentation");
    toggleMobileMenu();
  };

  // Handle navigation to login
  const handleLoginClick = () => {
    navigate("/login");
    toggleMobileMenu();
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md border border-gray-700/50 rounded-lg py-3 px-4 sm:px-6 transition-all duration-300 max-w-5xl w-[90%] font-exo ${
        scrolled ? "bg-[#00333e]/90 shadow-lg" : "bg-[#00333e]/60 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img src={logo} alt="Briq Logo" className="h-8 w-auto" />
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
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("home");
            }}
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("services");
            }}
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300"
          >
            Our Services
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("pricing");
            }}
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="/documentation"
            onClick={(e) => {
              e.preventDefault();
              handleDocumentationClick();
            }}
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300"
          >
            KARIBU-API
          </a>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("footer");
            }}
            className="text-white hover:text-[#fddf0d] text-xs sm:text-sm uppercase transition-colors duration-300"
          >
            Contact Us
          </a>
          <Button
            onClick={handleLoginClick}
            className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] text-xs sm:text-sm uppercase px-4 sm:px-6 py-1.5 sm:py-2 rounded-full transition-all duration-300 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)]"
          >
            Login
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 flex flex-col items-center gap-4 bg-[#00333e] rounded-lg py-6 border-t border-gray-700/50">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("home");
            }}
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#services"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("services");
            }}
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Our Services
          </a>
          <a
            href="#pricing"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("pricing");
            }}
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="/documentation"
            onClick={(e) => {
              e.preventDefault();
              handleDocumentationClick();
            }}
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            KARIBU-API
          </a>
          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              handleScrollToSection("footer");
            }}
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Contact Us
          </a>
          <Button
            onClick={handleLoginClick}
            className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] text-sm uppercase px-6 py-2 rounded-full transition-all duration-300 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)]"
          >
            Login
          </Button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;