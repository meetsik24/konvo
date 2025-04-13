// Karibu/components/Sidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { X, Menu } from "lucide-react";

function DocumentationSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="relative">
      {/* Mobile Toggle Button */}
      <div className="md:hidden p-4 bg-[#00333e] text-white">
        <button onClick={toggleMobileMenu} className="flex items-center gap-2">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          <span className="text-lg font-semibold">Menu</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          isMobileMenuOpen ? "block" : "hidden"
        } md:block fixed top-0 left-0 w-64 h-screen bg-[#00333e] text-white p-6 pt-[80px] shadow-lg rounded-r-lg font-exo transition-all duration-300 z-40 overflow-y-auto`}
      >
        {/* Sidebar Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
           Briq Karibu API
          </h2>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-300 mb-3">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <NavLink
                  to="/documentation/home"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${
                      isActive
                        ? "bg-[#fddf0d] text-[#00333e] font-semibold"
                        : "text-gray-300 hover:bg-[#fddf0d]/20 hover:text-white"
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/documentation/sendsms"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${
                      isActive
                        ? "bg-[#fddf0d] text-[#00333e] font-semibold"
                        : "text-gray-300 hover:bg-[#fddf0d]/20 hover:text-white"
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Send SMS
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/documentation/otherendpoints"
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-lg text-sm transition-colors duration-300 ${
                      isActive
                        ? "bg-[#fddf0d] text-[#00333e] font-semibold"
                        : "text-gray-300 hover:bg-[#fddf0d]/20 hover:text-white"
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Other Endpoints
                </NavLink>
              </li>
            </ul>
          </div>

         
        </nav>
      </aside>
    </div>
  );
}

export default DocumentationSidebar;