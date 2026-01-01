import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Users, Activity, IdCard } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/send-sms', icon: MessageSquare, label: 'SMS' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/senderid', icon: IdCard, label: 'Sender' },
];

const MobileBottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav className="block md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex-1 flex flex-col items-center justify-center text-xs py-1 px-2 ${isActive ? 'text-[#00333e]' : 'text-gray-500 hover:text-[#00333e]'}`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#00333e]' : ''}`} />
                <span className="text-[11px] leading-3 truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
