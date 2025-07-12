import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, IdCard, Megaphone, Users, Activity, DollarSign } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext';

const navItems = [
  { to: 'Dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-sms', icon: MessageSquare, label: 'Send SMS' },
  { to: '/senderid', icon: IdCard, label: 'Sender ID' },

  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/subscription', icon: DollarSign, label: 'Subscription' },
  { to: '/apikeys', icon: IdCard, label: 'API Keys' },
 
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
      className={`bg-[#00333e] flex flex-col h-screen overflow-y-auto sticky top-0 z-40 sm:z-0 ${
        isSidebarOpen ? 'block' : 'hidden'
      } sm:block`}
    >
      <div className="flex flex-col h-full py-4">
        {/* Logo Section */}
        <div className="px-5 mb-4 flex items-center gap-2 border-b border-[#005a6e]">
          <img src="/assets/briq.png" alt="Briq Logo" className="w-8 h-8" />
          <h1 className="text-lg font-bold text-white py-1.5">Briq Solutions</h1>
        </div>

        {/* Workspace Section */}
        <div className="px-4 mb-4">
          <h2 className="text-md font-semibold text-white mb-3">Workspace</h2>
          <div
            className={`px-2 py-2 text-lg font-medium rounded-lg transition-all duration-200 ${
              isWorkspaceSelected
                ? 'text-white bg-[#005a6e] border border-[#fddf0d]/20'
                : 'text-gray-400 bg-[#002a36] italic'
            }`}
          >
            {activeWorkspace?.name || 'No Workspace Selected'}
          </div>
          {!isWorkspaceSelected && (
            <p className="mt-2 text-xs text-red-400">Please select a workspace from the Navbar.</p>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-lg font-small rounded-md transition-all duration-200 ${
                  !isWorkspaceSelected
                    ? 'text-gray-400 cursor-not-allowed bg-[#002a36]'
                    : isActive
                    ? 'bg-[#fddf0d] text-[#00333e] shadow-md shadow-[#fddf0d]/20'
                    : 'text-white hover:bg-[#005a6e]'
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