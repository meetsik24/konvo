// components/Sidebar.tsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, IdCard, Megaphone, Users, Activity, DollarSign, Plus } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-sms', icon: MessageSquare, label: 'Send SMS' },
  { to: '/senderid', icon: IdCard, label: 'Sender ID' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/subscription', icon: DollarSign, label: 'Subscription' },
];

const Sidebar: React.FC = () => {
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId, addWorkspace } = useWorkspace();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleAddWorkspace = () => {
    if (newWorkspaceName.trim()) {
      addWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r-2 border-primary-100">
      <div className="flex flex-col h-full py-6">
        <div className="px-3 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Workspaces</h2>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="New Workspace"
              className="input w-full text-gray-600 border-primary-200 focus:border-primary-500 focus:ring-primary-500"
            />
            <button
              onClick={handleAddWorkspace}
              className="btn btn-primary flex items-center justify-center w-10 h-10 rounded-xl p-0"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => setCurrentWorkspaceId(ws.id)}
                className={`w-full text-left px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                  currentWorkspaceId === ws.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-500'
                }`}
              >
                {ws.name}
              </button>
            ))}
          </div>
        </div>
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