import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Mail, Phone, Bot, Megaphone, Sigma as Sim, Key, Activity, BarChart, IdCard } from 'lucide-react';

import { Users, DollarSign } from 'lucide-react';


const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-sms', icon: MessageSquare, label: 'Send SMS' },
  { to: '/send-email', icon: Mail, label: 'Send Email' },
  { to: '/voice', icon: Phone, label: 'Voice API' },
  { to: '/senderid', icon: IdCard, label: 'Sender ID' },
  { to: '/chatbot', icon: Bot, label: 'Chatbot' },
  // { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/apikeys', icon: Key, label: 'API Keys' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/subscription', icon: DollarSign, label: 'Subscription' },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r-2 border-primary-100">
      <div className="flex flex-col h-full py-6">
        <nav className="flex-1 space-y-2 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-500'
                }`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;