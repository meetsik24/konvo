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
    <aside
      className={`w-64 bg-white flex flex-col h-screen overflow-y-auto shadow-md sticky top-0 z-40 sm:z-0 ${
        isSidebarOpen ? 'block' : 'hidden'
      } sm:block`}
    >
      <div className="flex flex-col h-full py-4">
        {/* Logo Section */}
        <div className="px-4 mb-4 flex items-center gap-2">
          <img src="/assets/briq2.png" alt="Briq Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-[#00333e]">Briq Solutions</h1>
        </div>

        {/* Workspace Section */}
        <div className="px-4 mb-4">
          <h2 className="text-sm font-semibold text-[#00333e] mb-3">Workspace</h2>
          <div
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
              isWorkspaceSelected
                ? 'text-[#00333e] bg-[#fddf0d]/20 border border-[#00333e]/20'
                : 'text-gray-400 bg-gray-100 italic'
            }`}
          >
            {activeWorkspace?.name || 'No Workspace Selected'}
          </div>
          {!isWorkspaceSelected && (
            <p className="mt-2 text-xs text-red-500">Please select a workspace from the Navbar.</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  !isWorkspaceSelected
                    ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                    : isActive
                    ? 'bg-[#00333e] text-white shadow-md shadow-[#00333e]/20'
                    : 'text-[#00333e] hover:bg-[#fddf0d] hover:text-[#00333e]'
                }`
              }
              onClick={(e) => {
                if (!isWorkspaceSelected) {
                  e.preventDefault();
                } else {
                  closeSidebar();
                }
              }}
              title={!isWorkspaceSelected ? 'Select a workspace to enable navigation' : undefined}
            >
              <item.icon className="w-5 h-5 mr-2" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;