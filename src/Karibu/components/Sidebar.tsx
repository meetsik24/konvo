import React from 'react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange }) => {
  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-gray-800 p-6 bg-[#00333e] text-white shadow-xl">
      <nav className="space-y-3">
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeSection === 'home'
              ? 'bg-gray-700 text-[#fddf0d] shadow-md'
              : 'text-gray-300 hover:bg-gray-800 hover:text-[#fddf0d]'
          }`}
          onClick={() => onSectionChange('home')}
        >
          Home
        </button>
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeSection === 'sms'
              ? 'bg-gray-700 text-[#fddf0d] shadow-md'
              : 'text-gray-300 hover:bg-gray-800 hover:text-[#fddf0d]'
          }`}
          onClick={() => onSectionChange('sms')}
        >
          Send SMS
        </button>
        <button
          className={`w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            activeSection === 'other'
              ? 'bg-gray-700 text-[#fddf0d] shadow-md'
              : 'text-gray-300 hover:bg-gray-800 hover:text-[#fddf0d]'
          }`}
          onClick={() => onSectionChange('other')}
        >
          Other Endpoints
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;