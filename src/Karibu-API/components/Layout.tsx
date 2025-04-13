// Layout.tsx
import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Home from '../pages/Home';
import SendSMS from '../pages/SendSMS';
import OtherEndpoints from '../pages/OtherEndpoints';

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState('home');

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <Home onSectionChange={setActiveSection} />;
      case 'sms':
        return <SendSMS />;
      case 'other':
        return <OtherEndpoints />;
      default:
        return <Home onSectionChange={setActiveSection} />;
    }
  };

  const showSidebar = activeSection !== 'home';

  return (
    <div className="min-h-screen flex flex-col bg-[#00333e]">
      <Navbar />
      <div className="flex flex-1 min-h-0 pt-[80px]"> {/* Explicit height offset */}
        {showSidebar && (
          <Sidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
        )}
        <main className="flex-1 px-6 overflow-auto">
          {children || renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Layout;