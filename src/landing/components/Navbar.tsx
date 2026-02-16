import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Menu, X, ChevronDown, MessageSquare, MessageCircle, Phone, Shield } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../../../assets/briq.png";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const services = [
    { icon: MessageSquare, name: "SMS Services", description: "Bulk SMS & messaging", href: "#services" },
    { icon: MessageCircle, name: "WhatsApp Business", description: "Official WhatsApp API", href: "#services" },
    { icon: Phone, name: "Voice Services", description: "Voice calls & IVR", href: "#services" },
    { icon: MessageSquare, name: "Chatbots", description: "Automated support", href: "#services" },
    { icon: Shield, name: "OTP Verification", description: "Multi-channel OTP", href: "#verification" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsServicesOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
  };

  const handleLoginClick = () => {
    navigate("/login");
    setIsMobileMenuOpen(false);
  };

  const handleRegisterClick = () => {
    navigate("/register");
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-exo ${
        scrolled
          ? "bg-[#00333e]/95 backdrop-blur-lg shadow-lg py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img src={logo} alt="Briq Logo" className="h-9 w-auto transition-transform group-hover:scale-105" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {location.pathname === "/" ? (
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("home");
                }}
                className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
              >
                Home
              </a>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
              >
                Home
              </Link>
            )}

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsServicesOpen(true)}
              onMouseLeave={() => setIsServicesOpen(false)}
            >
              <button
                className="flex items-center gap-1 px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
              >
                Services
                <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <div className="p-2">
                      {services.map((service, index) => (
                        <a
                          key={index}
                          href={service.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleScrollToSection(service.href.replace("#", ""));
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-[#00333e]/10 flex items-center justify-center text-[#00333e] group-hover:bg-[#fddf0d] group-hover:text-[#00333e] transition-colors">
                            <service.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.description}</div>
                          </div>
                        </a>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 p-3 bg-gray-50">
                      <a
                        href="#services"
                        onClick={(e) => {
                          e.preventDefault();
                          handleScrollToSection("services");
                        }}
                        className="text-sm text-[#00333e] font-medium hover:text-[#fddf0d] transition-colors flex items-center gap-2"
                      >
                        View all services
                        <Zap className="w-4 h-4" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="#pricing"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection("pricing");
              }}
              className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
            >
              Pricing
            </a>

            <a
              href="https://docs.briq.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
            >
              Developers
            </a>

            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                handleScrollToSection("footer");
              }}
              className="px-4 py-2 text-white/90 hover:text-white text-sm font-medium transition-colors rounded-lg hover:bg-white/10"
            >
              Contact
            </a>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              onClick={handleLoginClick}
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/10 px-5 py-2 rounded-lg font-medium"
            >
              Log in
            </Button>
            <Button
              onClick={handleRegisterClick}
              className="bg-[#fddf0d] hover:bg-[#f0d000] text-[#00333e] px-6 py-2 rounded-lg font-semibold shadow-lg shadow-[#fddf0d]/20 transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#00333e] border-t border-white/10 mt-3"
          >
            <div className="container mx-auto px-4 py-6 space-y-4">
              {location.pathname === "/" ? (
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    handleScrollToSection("home");
                  }}
                  className="block py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
                >
                  Home
                </a>
              ) : (
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
                >
                  Home
                </Link>
              )}

              {/* Mobile Services Accordion */}
              <div>
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className="w-full flex items-center justify-between py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
                >
                  Services
                  <ChevronDown className={`w-5 h-5 transition-transform ${isServicesOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {isServicesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-2 overflow-hidden"
                    >
                      {services.map((service, index) => (
                        <a
                          key={index}
                          href={service.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleScrollToSection(service.href.replace("#", ""));
                          }}
                          className="flex items-center gap-3 py-2 text-gray-300 hover:text-[#fddf0d] transition-colors"
                        >
                          <service.icon className="w-5 h-5" />
                          {service.name}
                        </a>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <a
                href="#pricing"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("pricing");
                }}
                className="block py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
              >
                Pricing
              </a>

              <a
                href="https://docs.briq.tz"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
              >
                Developers
              </a>

              <a
                href="#footer"
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToSection("footer");
                }}
                className="block py-3 text-white hover:text-[#fddf0d] font-medium transition-colors"
              >
                Contact
              </a>

              <div className="pt-4 space-y-3 border-t border-white/10">
                <Button
                  onClick={handleLoginClick}
                  variant="outline"
                  className="w-full bg-transparent border-white/30 text-white hover:bg-white/10 py-3 rounded-lg font-medium"
                >
                  Log in
                </Button>
                <Button
                  onClick={handleRegisterClick}
                  className="w-full bg-[#fddf0d] hover:bg-[#f0d000] text-[#00333e] py-3 rounded-lg font-semibold"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export default Navbar;