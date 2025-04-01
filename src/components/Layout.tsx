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
    <div className="min-h-screen bg-[#fff] relative">
      {/* Decorative doodles */}
     

      {/* Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-64px)] pt-16">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 top-16 z-50 w-64 transform transition-transform duration-300 ease-in-out sm:w-64 sm:static sm:top-0 sm:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 top-16 bg-black bg-opacity-50 z-40 sm:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:pl-72 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;