import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import logo from "../../../assets/briq.png";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const products = [
    { name: "Bulk SMS", href: "#services" },
    { name: "WhatsApp", href: "#services" },
    { name: "Voice & OTP", href: "#services" },
    { name: "AI Chatbots", href: "#services" },
  ];

  const navLinks = [
    { label: "Features", href: "#services" },
    { label: "Pricing", href: "#pricing" },
    { label: "Docs", href: "https://docs.briq.tz", external: true },
    { label: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href.startsWith("#")) return false;
    return location.pathname === href;
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  const handleAnchorClick = (href: string) => {
    setIsMobileMenuOpen(false);
    if (href.startsWith("#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <nav
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 mx-auto w-[calc(100%-2rem)] max-w-5xl ${scrolled
          ? "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl"
          : "bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg"
        } rounded-2xl`}
    >
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img src={logo} alt="Briq" className="h-8 w-auto" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button
                className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsProductsOpen((v) => !v)}
                aria-expanded={isProductsOpen}
              >
                Products
                <ChevronDown className={`w-4 h-4 transition-transform ${isProductsOpen ? "rotate-180" : ""}`} />
              </button>
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-[#003d4a] backdrop-blur-md rounded-xl shadow-xl border border-white/20 py-2">
                  {products.map((product, i) => (
                    <button
                      key={i}
                      onClick={() => { setIsProductsOpen(false); handleAnchorClick(product.href); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      {product.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : link.href.startsWith("#") ? (
                <button
                  key={link.label}
                  onClick={() => handleAnchorClick(link.href)}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {link.label}
                </button>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`text-sm font-medium transition-colors ${isActive(link.href)
                      ? "text-[#fddf0d] border-b border-[#fddf0d] pb-0.5"
                      : "text-gray-300 hover:text-white"
                    }`}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-[#fddf0d] text-[#00333e] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#fce96a] transition-colors"
            >
              Start free
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#002831] border-t border-white/20 py-4 rounded-b-xl -mx-6 px-6">
            <div className="space-y-1">
              <div className="px-0">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Products
                </div>
                {products.map((product, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnchorClick(product.href)}
                    className="block w-full text-left py-2 text-gray-300 hover:text-[#fddf0d] transition-colors"
                  >
                    {product.name}
                  </button>
                ))}
              </div>
              <div className="border-t border-white/20 pt-3 px-0 space-y-1">
                <button
                  onClick={() => handleAnchorClick("#pricing")}
                  className="block w-full text-left py-2 text-gray-300 hover:text-[#fddf0d] transition-colors"
                >
                  Pricing
                </button>
                <a
                  href="https://docs.briq.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-[#fddf0d] transition-colors"
                >
                  Docs
                </a>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 transition-colors ${isActive("/contact") ? "text-[#fddf0d]" : "text-gray-300 hover:text-[#fddf0d]"
                    }`}
                >
                  Contact
                </Link>
              </div>
              <div className="border-t border-white/20 pt-4 px-0 space-y-3">
                <button
                  onClick={() => { navigate("/login"); setIsMobileMenuOpen(false); }}
                  className="w-full text-center py-2 text-gray-300 font-medium hover:text-white"
                >
                  Log in
                </button>
                <button
                  onClick={() => { navigate("/register"); setIsMobileMenuOpen(false); }}
                  className="w-full bg-[#fddf0d] text-[#00333e] py-3 rounded-lg font-semibold hover:bg-[#fce96a]"
                >
                  Start free
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
