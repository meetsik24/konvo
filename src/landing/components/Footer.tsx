import { Link, useNavigate } from "react-router-dom";
import logo from "../../../assets/briq.png";
import { MoveRight } from "lucide-react";

const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-white pt-24 overflow-hidden">
      {/* CTA Section - Floating Card Style */}
      <div className="container mx-auto px-6 lg:px-8 relative z-20 -mb-24">
        <div className="bg-gradient-to-br from-[#003d4a] to-[#001f26] rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10 relative overflow-hidden group">
          {/* Grid background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

          {/* Abstract blobs */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#fddf0d]/10 rounded-full blur-3xl group-hover:bg-[#fddf0d]/20 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all duration-700" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Ready to scale your <span className="text-[#fddf0d]">business messaging?</span>
              </h2>
              <p className="text-gray-300 text-lg md:text-xl font-medium">
                Join 500+ enterprises across Tanzania using Briq's production-ready APIs.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <button
                onClick={() => navigate("/register")}
                className="bg-[#fddf0d] text-[#003d4a] px-10 py-4 rounded-xl text-lg font-bold hover:bg-[#fce96a] transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(253,223,13,0.3)] shadow-lg flex items-center justify-center gap-2"
              >
                Get Started <MoveRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/contact")}
                className="bg-white/5 text-white px-10 py-4 rounded-xl text-lg font-bold hover:bg-white/10 transition-all border border-white/20 backdrop-blur-sm"
              >
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="bg-[#001f26] pt-40 pb-12 relative overflow-hidden">
        {/* Subtle grid for the bottom part too */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        <div className="container mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2 space-y-6">
              <img src={logo} alt="Briq" className="h-10 w-auto" />
              <p className="text-gray-400 text-lg leading-relaxed max-w-sm font-medium">
                The leading communication platform for modern enterprises in Tanzania. Reliable, scalable, and secure.
              </p>
              <div className="flex gap-4">
                <a
                  href="https://twitter.com/karibubriq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#fddf0d] hover:border-[#fddf0d] transition-all"
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </a>
                <a
                  href="https://www.facebook.com/karibubriq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#fddf0d] hover:border-[#fddf0d] transition-all"
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a
                  href="https://www.instagram.com/karibubriq"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-[#fddf0d] hover:border-[#fddf0d] transition-all"
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
              </div>
            </div>

            <div className="col-span-1">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.15em]">Products</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#services" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    Bulk SMS
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    WhatsApp API
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    OTP &amp; Voice
                  </a>
                </li>
                <li>
                  <a href="#services" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    AI Chatbots
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-span-1">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.15em]">Company</h3>
              <ul className="space-y-4">
                <li>
                  <a href="#pricing" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a
                    href="https://docs.briq.tz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300"
                  >
                    Integrations
                  </a>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-[#fddf0d] text-base font-medium transition-colors inline-block hover:translate-x-1 duration-300">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.15em]">Office</h3>
              <ul className="space-y-4 text-base text-gray-400 font-medium">
                <li>
                  <a href="mailto:sms@briq.tz" className="hover:text-[#fddf0d] transition-colors">
                    sms@briq.tz
                  </a>
                </li>
                <li>
                  <a href="tel:+255788344348" className="hover:text-[#fddf0d] transition-colors">
                    +255 788 344 348
                  </a>
                </li>
                <li className="leading-relaxed">
                  Mwenge Tower, First Floor<br />
                  Dar es Salaam, Tanzania
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-500 text-sm font-medium">
              © {currentYear} Briq. Designed & Built in Dar es Salaam.
            </p>
            <div className="flex gap-8">
              <Link to="/terms" className="text-gray-500 hover:text-[#fddf0d] text-xs font-semibold uppercase tracking-widest transition-colors">
                Terms
              </Link>
              <Link to="/privacy" className="text-gray-500 hover:text-[#fddf0d] text-xs font-semibold uppercase tracking-widest transition-colors">
                Privacy
              </Link>
              <Link to="/contact" className="text-gray-500 hover:text-[#fddf0d] text-xs font-semibold uppercase tracking-widest transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

