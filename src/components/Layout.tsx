import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex min-h-screen" style={{ zoom: '90%' }}>
        {/* Sidebar */}
        <Sidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Overlay for mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-30 sm:hidden"
              onClick={closeSidebar}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="flex justify-center items-start px-4 sm:px-6 py-6 h-full">
              <div className="w-full max-w-7xl">
                <Outlet />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
