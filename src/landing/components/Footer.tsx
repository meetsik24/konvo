import React from 'react';
import { X, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer
      className="py-12"
      style={{
        background: 'linear-gradient(180deg, #1a1a1a 0%, #000000 100%)',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Logo and Tagline */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-white">Briq</span>
            </div>
            <p
              className="mt-2 text-sm text-gray-400"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Scale operations with additional integrations or add-ons.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3
              className="text-lg font-semibold text-white mb-4"
              style={{ fontFamily: 'Exo, sans-serif' }}
            >
              Navigation
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Case Studies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Insight
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3
              className="text-lg font-semibold text-white mb-4"
              style={{ fontFamily: 'Exo, sans-serif' }}
            >
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Terms & Privacy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  404
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Miscellaneous */}
          <div>
            <h3
              className="text-lg font-semibold text-white mb-4"
              style={{ fontFamily: 'Exo, sans-serif' }}
            >
              Miscellaneous
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Insights
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3
              className="text-lg font-semibold text-white mb-4"
              style={{ fontFamily: 'Exo, sans-serif' }}
            >
              Company
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}