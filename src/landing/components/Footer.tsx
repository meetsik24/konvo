import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { Instagram, Twitter, Facebook } from 'lucide-react';
import briqLogo from "../../../assets/briq.png";

export function Footer() {
  return (
    <footer className="bg-[#00333e] text-white py-16 relative overflow-hidden font-exo">
      {/* Animated Background Patterns */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
        <div className="absolute inset-0 particle-bg animate-particle-move" />
        <div className="absolute inset-0 feature-pattern-bg animate-feature-move" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src={briqLogo} alt="Briq Logo" className="w-16 h-18 relative z-10" />
              <span className="text-xl font-bold text-white relative z-10">
                Briq Solutions <br /> Inc
              </span>
            </div>
            <p className="text-[#6f888c]">
              We are dedicated to revolutionizing customer services through WhatsApp business solutions.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://www.instagram.com/karibubriq" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors" target="_blank" rel="noopener noreferrer">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://twitter.com/karibubriq" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors" target="_blank" rel="noopener noreferrer">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/karibubriq" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors" target="_blank" rel="noopener noreferrer">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Navigation Links (Reflecting Navbar) */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Navigation</h3>
            <ul className="space-y-4">
              <li>
                <a href="#home" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#services" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Our Services
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#documentation" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Developer Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Information</h3>
            <ul className="space-y-4">
              <li>
                <Link to="/privacy" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="#brief" className="text-[#6f888c] hover:text-[#fddf0d] transition-colors">
                  Brief Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 mt-1 flex-shrink-0 text-[#6f888c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[#6f888c]">
                  Mwenge Tower First Floor <br /> Dar Es Salaam, Tanzania
                </span>
              </li>
              <li>
                <a href="mailto:sms@briq.tz" className="text-[#6f888c] hover:text-[#fddf0d] flex items-center gap-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  sms@briq.tz
                </a>
              </li>
              <li>
                <a href="tel:+255757294146" className="text-[#6f888c] hover:text-[#fddf0d] flex items-center gap-2 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +255 760 487 336
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#6f888c]/50 text-center text-[#6f888c]">
          © Briq 2025. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;