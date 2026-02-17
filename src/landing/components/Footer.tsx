import { Link } from "react-router-dom";
import logo from "../../../assets/briq.png";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#003d4a] border-t border-gray-700">
      <div className="container mx-auto px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <img src={logo} alt="Briq" className="h-8 w-auto mb-4" />
            <p className="text-gray-400 text-sm">
              Fast, reliable messaging solutions for Tanzanian businesses.
            </p>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features#sms" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Bulk SMS
                </Link>
              </li>
              <li>
                <Link to="/features#whatsapp" className="text-gray-400 hover:text-white text-sm transition-colors">
                  WhatsApp Business
                </Link>
              </li>
              <li>
                <Link to="/features#voice" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Voice & OTP
                </Link>
              </li>
              <li>
                <Link to="/features#chatbots" className="text-gray-400 hover:text-white text-sm transition-colors">
                  AI Chatbots
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.briq.tz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4 text-sm">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="mailto:sms@briq.tz" className="hover:text-white transition-colors">
                  sms@briq.tz
                </a>
              </li>
              <li>
                <a href="tel:+255788344348" className="hover:text-white transition-colors">
                  +255 788 344 348
                </a>
              </li>
              <li>Mwenge Tower, First Floor</li>
              <li>Dar es Salaam, Tanzania</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Briq. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a 
              href="https://twitter.com/karibubriq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Twitter
            </a>
            <a 
              href="https://www.facebook.com/karibubriq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Facebook
            </a>
            <a 
              href="https://www.instagram.com/karibubriq" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
