import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <Navbar toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
        
        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
            onClick={closeSidebar}
          />
        )}
        
        {/* Main Content */}
        <div
          className={`flex-1 overflow-auto w-full transition-all duration-300 pt-16 ${
            isSidebarOpen ? 'sm:pl-64' : 'sm:pl-64'
          }`}
        >
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;