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
    <div className="min-h-screen bg-[#fffbf3] relative overflow-hidden">
      {/* Decorative doodles */}
      <div
        className="doodle doodle-coffee w-24 h-24 sm:w-32 sm:h-32 top-20 left-10 sm:left-20 animate-float"
      />
      <div
        className="doodle doodle-heart w-16 h-16 sm:w-24 sm:h-24 top-40 right-10 sm:right-40 animate-float"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="doodle doodle-star w-12 h-12 sm:w-20 sm:h-20 bottom-20 left-1/4 sm:left-1/3 animate-float"
        style={{ animationDelay: '2s' }}
      />

      {/* Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />

      {/* Main Layout */}
      <div className="flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 top-16 z-50 w-64 transform transition-transform duration-300 ease-in-out sm:static sm:top-0 sm:translate-x-0 ${
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
        <main className="flex-1 p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;