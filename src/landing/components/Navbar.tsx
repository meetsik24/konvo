import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../../../assets/briq.png";

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const navigate = useNavigate();

  const products = [
    { name: "Bulk SMS", href: "/features#sms" },
    { name: "WhatsApp", href: "/features#whatsapp" },
    { name: "Voice & OTP", href: "/features#voice" },
    { name: "AI Chatbots", href: "/features#chatbots" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#001f29]/95 backdrop-blur-md border-b border-white/10"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Briq" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {/* Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIsProductsOpen(true)}
              onMouseLeave={() => setIsProductsOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Products
                <ChevronDown className="w-4 h-4" />
              </button>
              {isProductsOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-[#002a38] rounded-lg shadow-lg border border-white/10 py-2">
                  {products.map((product, i) => (
                    <Link
                      key={i}
                      to={product.href}
                      className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {product.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/pricing"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>

            <a
              href="https://docs.briq.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Docs
            </a>

            <Link
              to="/contact"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate("/register")}
              className="bg-[#0ea5e9] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0284c7] transition-colors"
            >
              Start free
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-gray-300"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-[#002a38] border-t border-white/10 py-4 rounded-b-xl shadow-lg">
            <div className="space-y-3">
              <div className="px-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Products
                </div>
                {products.map((product, i) => (
                  <Link
                    key={i}
                    to={product.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 text-gray-300 hover:text-white"
                  >
                    {product.name}
                  </Link>
                ))}
              </div>
              <div className="border-t border-white/10 pt-3 px-4 space-y-3">
                <Link
                  to="/pricing"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-white"
                >
                  Pricing
                </Link>
                <a
                  href="https://docs.briq.tz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block py-2 text-gray-300 hover:text-white"
                >
                  Docs
                </a>
                <Link
                  to="/contact"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 text-gray-300 hover:text-white"
                >
                  Contact
                </Link>
              </div>
              <div className="border-t border-white/10 pt-4 px-4 space-y-3">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-gray-300 font-medium hover:text-white"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    navigate("/register");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#0ea5e9] text-white py-3 rounded-lg font-medium hover:bg-[#0284c7]"
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
