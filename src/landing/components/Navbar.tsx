import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import logo from "../../assets/briq.png"; // Adjust the path based on your folder structure

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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

  return (
    <nav
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 backdrop-blur-md border border-gray-700/50 rounded-lg py-4 px-6 transition-all duration-300 max-w-5xl w-[90%] font-exo ${
        scrolled
          ? "bg-[#00333e]/90 shadow-lg"
          : "bg-[#00333e]/60 shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Briq Logo"
            className="h-8 w-auto"
          />
          
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <a
            href="#home"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Home
          </a>
          <a
            href="#services"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Our Services
          </a>
          <a
            href="#pricing"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Pricing
          </a>
          <a
            href="#documentation"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            KARIBU-API
          </a>
          <a
            href="#footer"
            className="text-white hover:text-[#fddf0d] text-sm uppercase transition-colors duration-300"
          >
            Contact Us
          </a>
          <Button
            className="bg-[#fddf0d] hover:bg-[#e5c90c] text-[#00333e] text-sm uppercase px-6 py-2 rounded-full transition-all duration-300 [box-shadow:_0_0_15px_rgba(253,223,13,0.5)]"
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
}