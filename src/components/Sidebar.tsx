import React, { useEffect, useState } from 'react';
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle collapse state based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768); // Collapse on mobile (< 768px)
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  useEffect(() => {
    console.log('Sidebar: Workspaces:', workspaces);
    console.log('Sidebar: Current Workspace ID:', currentWorkspaceId);
    console.log('Sidebar: Active Workspace:', activeWorkspace);
    console.log('Sidebar: Is Workspace Selected?', isWorkspaceSelected);
  }, [workspaces, currentWorkspaceId, activeWorkspace, isWorkspaceSelected]);

  return (
    <aside
      className={`bg-white flex flex-col h-screen overflow-y-auto fixed top-0 left-0 z-40 transition-all duration-300 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'w-16' : 'w-56'} md:w-56 md:translate-x-0 border-r border-gray-200`}
    >
      <div className="flex flex-col h-full py-3">
        {/* Logo Section */}
        <div className="px-3 mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center">
            <img src="/assets/briq2.png" alt="Briq Logo" className="w-6 h-7" />
            {!isCollapsed && (
              <h1 className="text-sm font-semibold text-gray-800 ml-2">Briq Solutions</h1>
            )}
          </div>
          <button
            onClick={toggleCollapse}
            className="md:hidden p-1 rounded hover:bg-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isCollapsed ? 'M4 6h16M4 12h16M4 18h16' : 'M6 18L18 6M6 6l12 12'}
              />
            </svg>
          </button>
        </div>

        {/* Workspace Section */}
        <div className="px-3 mb-3">
          {!isCollapsed && (
            <>
              <h2 className="text-sm font-regular text-gray-800 mb-2">Workspace</h2>
              <div
                className={`px-3 py-1.5 text-sm font-regular rounded-sm transition-all duration-200 ${
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
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-regular rounded-sm transition-all duration-200 ${
                  !isWorkspaceSelected
                    ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                    : isActive
                    ? 'bg-[#fddf0d] text-gray-800'
                    : 'text-gray-600 hover:bg-gray-200'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              onClick={(e) => {
                if (!isWorkspaceSelected) {
                  e.preventDefault();
                } else {
                  closeSidebar();
                }
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0 mr-2" />
              {!isCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Notifications */}
        <div className="px-3 mt-auto">
          {!isCollapsed && (
            <div className="text-sm text-gray-600 flex items-center">
              <span>Notifications</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;