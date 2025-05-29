import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, IdCard, Megaphone, Users, Activity, DollarSign } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext';

const navItems = [
  { to: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-sms', icon: MessageSquare, label: 'Send SMS' },
  { to: '/senderid', icon: IdCard, label: 'Sender ID' },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/subscription', icon: DollarSign, label: 'Subscription' },
  { to: '/apikeys', icon: IdCard, label: 'API Keys' },
  { to: '/voice', icon: Megaphone, label: 'Voice API' },
];

interface SidebarProps {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, isSidebarOpen }) => {
  const { workspaces, currentWorkspaceId } = useWorkspace();
  const activeWorkspace = workspaces.find((ws: { workspace_id: string; name: string }) => ws.workspace_id === currentWorkspaceId);
  const isWorkspaceSelected = !!currentWorkspaceId;

  useEffect(() => {
    console.log('Sidebar: Workspaces:', workspaces);
    console.log('Sidebar: Current Workspace ID:', currentWorkspaceId);
    console.log('Sidebar: Active Workspace:', activeWorkspace);
    console.log('Sidebar: Is Workspace Selected?', isWorkspaceSelected);
  }, [workspaces, currentWorkspaceId, activeWorkspace, isWorkspaceSelected]);

  return (
    <aside className="w-30 bg-white flex flex-col h-screen overflow-y-auto sticky top-0 z-40">
      <div className="flex flex-col h-full py-3">
        {/* Logo Section */}
        <div className="px-3 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center">
            <img src="/assets/briq.png" alt="Briq Logo" className="w-8 h-8" />
            <h1 className="text-sm font-semibold text-gray-800 ml-2">Briq Solutions</h1>
          </div>
        </div>

        {/* Workspace Section */}
        <div className="px-3 mb-3">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Workspace</h2>
          <div
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 ${
              isWorkspaceSelected
                ? 'text-gray-800 bg-gray-200'
                : 'text-gray-500 bg-gray-100 italic'
            }`}
          >
            {activeWorkspace?.name || 'No Workspace Selected'}
          </div>
          {!isWorkspaceSelected && (
            <p className="mt-1 text-xs text-red-500">Select a workspace from Navbar.</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  !isWorkspaceSelected
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : isActive
                    ? 'bg-[#fddf0d] text-gray-800'
                    : 'text-gray-600 hover:bg-gray-200'
                }`
              }
              onClick={(e) => {
                if (!isWorkspaceSelected) {
                  e.preventDefault();
                } else {
                  closeSidebar();
                }
              }}
            >
              <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Notifications */}
        <div className="px-3 mt-auto">
          <div className="text-sm text-gray-600 flex items-center">
            <span>Notifications</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;