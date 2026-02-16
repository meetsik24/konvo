import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageSquare, 
  Phone, 
  Mail, 
  MapPin,
  ArrowUpRight,
  Heart
} from 'lucide-react';
import briqLogo from "../../../assets/briq.png";

export function Footer() {
  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 100;
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const footerLinks = {
    products: [
      { name: "SMS Services", href: "#services" },
      { name: "WhatsApp Business", href: "#services" },
      { name: "Voice Services", href: "#services" },
      { name: "AI Chatbots", href: "#services" },
      { name: "OTP Verification", href: "#verification" },
    ],
    developers: [
      { name: "Documentation", href: "https://docs.briq.tz", external: true },
      { name: "API Reference", href: "https://docs.briq.tz/api", external: true },
      { name: "SDKs", href: "https://docs.briq.tz/sdks", external: true },
      { name: "Status Page", href: "https://status.briq.tz", external: true },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "#footer" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
    ],
  };

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/karibubriq", label: "Instagram" },
    { icon: Twitter, href: "https://twitter.com/karibubriq", label: "Twitter" },
    { icon: Facebook, href: "https://www.facebook.com/karibubriq", label: "Facebook" },
    { icon: Linkedin, href: "https://linkedin.com/company/briq", label: "LinkedIn" },
  ];

  return (
    <footer id="footer" className="bg-[#00333e] text-white relative overflow-hidden font-exo">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fddf0d]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#00a3bf]/5 rounded-full blur-3xl" />
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        <div className="grid lg:grid-cols-6 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <img src={briqLogo} alt="Briq Logo" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 leading-relaxed max-w-sm">
              Tanzania's leading Communication Platform as a Service (CPaaS). 
              Empowering businesses with SMS, WhatsApp, Voice, and AI-powered solutions.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-gray-400 hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Products</h3>
            <ul className="space-y-4">
              {footerLinks.products.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      if (link.href.startsWith("#")) {
                        e.preventDefault();
                        handleScrollToSection(link.href.replace("#", ""));
                      }
                    }}
                    className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300 flex items-center gap-1 group"
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Developers</h3>
            <ul className="space-y-4">
              {footerLinks.developers.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300 flex items-center gap-1 group"
                  >
                    {link.name}
                    {link.external && (
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Company</h3>
            <ul className="space-y-4">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleScrollToSection(link.href.replace("#", ""));
                      }}
                      className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Contact</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="mailto:sms@briq.tz"
                  className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300 flex items-start gap-3"
                >
                  <Mail className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>sms@briq.tz</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+255788344348"
                  className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300 flex items-start gap-3"
                >
                  <Phone className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>+255 788 344 348</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span>
                  Mwenge Tower, First Floor<br />
                  Dar Es Salaam, Tanzania
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-white/10 pt-12 mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl font-semibold mb-3">Stay Updated</h3>
            <p className="text-gray-400 mb-6">
              Get the latest updates on new features, product launches, and more.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-[#fddf0d] transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#fddf0d] text-[#00333e] rounded-xl font-semibold hover:bg-[#f0d000] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Briq Solutions Inc. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            {footerLinks.legal.map((link, index) => (
              <Link
                key={index}
                to={link.href}
                className="text-gray-400 hover:text-[#fddf0d] transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="text-gray-400 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> in Tanzania
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;