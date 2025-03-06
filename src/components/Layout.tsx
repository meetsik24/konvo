import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fffbf3] relative overflow-hidden">
      {/* Decorative doodles */}
      <div className="doodle doodle-coffee w-32 h-32 top-20 left-20 animate-float" />
      <div className="doodle doodle-heart w-24 h-24 top-40 right-40 animate-float" style={{ animationDelay: '1s' }} />
      <div className="doodle doodle-star w-20 h-20 bottom-20 left-1/3 animate-float" style={{ animationDelay: '2s' }} />
      
      <Navbar />
      <div className="flex">
        <Sidebar /> {/* Workspace management will be added here */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;