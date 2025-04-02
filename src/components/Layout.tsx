import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa] flex flex-col">
      {/* Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      {/* Main Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar closeSidebar={closeSidebar} isSidebarOpen={isSidebarOpen} />

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main
          className={`flex-1 p-4 sm:p-6 transition-all duration-300 overflow-y-auto ${
            isSidebarOpen ? 'sm:pl-64' : 'sm:pl-64'
          }`}
        >
          <div className="max-w-6xl mx-auto pt-14">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;