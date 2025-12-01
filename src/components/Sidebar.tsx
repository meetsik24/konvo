import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard,
  MessageSquare,
  IdCard,
  Users,
  Activity,
  DollarSign,
  LogOut,
  Settings,
  Bell,
  Check,
  X,
  Building,
  Plus,
  Trash2
} from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext';
import { logout, fetchUserProfile } from '../store/slices/authSlice';
import { store } from '../store/store';
import { fetchNotifications, deleteNotification, markNotificationAsRead } from '../services/api';
import type { RootState } from '../store/store';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/send-sms', icon: MessageSquare, label: 'Send SMS' },
  { to: '/senderid', icon: IdCard, label: 'Sender ID' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/logs', icon: Activity, label: 'Logs' },
  { to: '/subscription', icon: DollarSign, label: 'Subscription' },
  { to: '/apikeys', icon: IdCard, label: 'Developer Apps & API' },
];

interface SidebarProps {
  closeSidebar: () => void;
  isSidebarOpen: boolean;
}

interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar, isSidebarOpen }) => {
  const dispatch = useDispatch<typeof store.dispatch>();
  const navigate = useNavigate();
  const { user, token, status } = useSelector((state: RootState) => state.auth);
  const {
    workspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
    addWorkspace,
    deleteWorkspace,
    refreshWorkspaces,
    isLoading: workspaceLoading
  } = useWorkspace();

  const activeWorkspace = workspaces.find((ws: { workspace_id: string; name: string }) => ws.workspace_id === currentWorkspaceId);
  const isWorkspaceSelected = !!currentWorkspaceId;

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  useEffect(() => {
    if (!token || status === 'loading' || user) return;
    dispatch(fetchUserProfile(token));
  }, [token, dispatch, status, user]);

  // Fetch notifications
  useEffect(() => {
    const loadNotifications = async () => {
      if (!token || !user || status === 'loading') return;
      try {
        const fetchedNotifications = await fetchNotifications();
        setNotifications(fetchedNotifications);
      } catch (err: any) {
        console.error('Failed to load notifications', err);
      }
    };
    loadNotifications();
  }, [token, user, status]);

  // Automatically open workspace modal if no workspaces exist
  useEffect(() => {
    if (workspaces.length === 0 && !workspaceLoading && !isWorkspaceModalOpen) {
      setIsWorkspaceModalOpen(true);
    }
  }, [workspaces, workspaceLoading, isWorkspaceModalOpen]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleDismissNotification = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((notif) => notif.notification_id !== id));
    } catch (err: any) {
      console.error('Failed to dismiss notification', err);
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.notification_id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err: any) {
      console.error('Failed to mark notification as read', err);
    }
  }, []);

  const handleCreateWorkspace = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setError('Workspace name cannot be empty');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await addWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      await refreshWorkspaces();
      if (workspaces.length > 0) setIsWorkspaceModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  }, [newWorkspaceName, addWorkspace, refreshWorkspaces, workspaces]);

  const handleDeleteWorkspace = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteWorkspace(id);
        await refreshWorkspaces();
        if (workspaces.length <= 1) setIsWorkspaceModalOpen(true);
      } catch (err: any) {
        setError(err.message || 'Failed to delete workspace');
      } finally {
        setIsLoading(false);
      }
    }
  }, [deleteWorkspace, refreshWorkspaces, workspaces]);

  const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=006400&color=fff`;
  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  const notificationPanel = useMemo(() => (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-20 md:left-20 md:right-auto md:w-80 bg-white border rounded-xl shadow-2xl z-[60] max-h-[500px] overflow-y-auto">
      <div className="p-3 border-b flex justify-between items-center sticky top-0 bg-white z-10">
        <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
        <button onClick={() => setIsNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      {notifications.length === 0 ? (
        <p className="p-4 text-gray-500 text-center text-sm">No notifications</p>
      ) : (
        notifications.map((notif) => (
          <div key={notif.notification_id} className={`flex items-start gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${notif.is_read ? 'bg-gray-50' : 'bg-white'}`}>
            <div className="flex-1">
              <p className={`text-sm ${notif.is_read ? 'text-gray-500' : 'text-gray-800 font-medium'}`}>{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
            </div>
            <div className="flex gap-1">
              {!notif.is_read && (
                <button onClick={() => handleMarkAsRead(notif.notification_id)} className="p-1 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded">
                  <Check className="w-3 h-3" />
                </button>
              )}
              <button onClick={() => handleDismissNotification(notif.notification_id)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  ), [notifications, handleDismissNotification, handleMarkAsRead]);

  const workspaceModal = useMemo(() => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4"
      onClick={() => {
        if (workspaces.length > 0) setIsWorkspaceModalOpen(false);
      }}
    >
      <div
        className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm max-h-[85vh] md:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
          <h4 className="text-lg font-bold text-[#00333e]">Manage Workspaces</h4>
          {workspaces.length > 0 && (
            <button
              onClick={() => setIsWorkspaceModalOpen(false)}
              className="text-gray-500 hover:text-[#00333e] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Create Workspace Form */}
        <div className="p-4">
          <form onSubmit={handleCreateWorkspace}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#00333e] mb-1">
                Create New Workspace
              </label>
              <input
                type="text"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                className="w-full px-3 py-2 text-sm text-[#00333e] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                placeholder="Enter workspace name"
                required
                disabled={isLoading || workspaceLoading}
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs mb-2 bg-red-50 p-2 rounded-lg">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full bg-[#00333e] text-white px-4 py-3 sm:py-2 text-sm font-medium rounded-lg hover:bg-[#002a36] active:bg-[#002a36] transition-colors disabled:bg-[#00333e]/50 flex items-center justify-center gap-2 touch-manipulation"
              disabled={isLoading || workspaceLoading}
            >
              <Plus className="w-4 h-4" />
              {isLoading || workspaceLoading ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        </div>

        {/* Workspace List */}
        <div className="p-4 pt-0">
          <h5 className="text-sm font-semibold text-[#00333e] mb-3">
            Your Workspaces
          </h5>
          {workspaceLoading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00333e] mx-auto" />
              <p className="text-gray-500 text-xs mt-2">Loading workspaces...</p>
            </div>
          ) : workspaces.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4">
              No workspaces available. Please create one to proceed.
            </p>
          ) : (
            <div className="space-y-2">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.workspace_id}
                  className={`flex items-center justify-between p-2 rounded-lg border transition-all ${workspace.workspace_id === currentWorkspaceId
                      ? 'bg-[#fddf0d]/10 border-[#fddf0d] shadow-sm'
                      : 'border-gray-100 hover:bg-gray-50'
                    }`}
                >
                  <button
                    onClick={() => {
                      setCurrentWorkspaceId(workspace.workspace_id);
                      setIsWorkspaceModalOpen(false);
                    }}
                    className={`flex-1 text-left text-sm flex items-center gap-2 py-2 px-2 rounded touch-manipulation ${workspace.workspace_id === currentWorkspaceId
                        ? 'text-[#00333e] font-semibold'
                        : 'text-gray-700'
                      }`}
                    disabled={isLoading || workspaceLoading}
                  >
                    <Building className={`w-4 h-4 ${workspace.workspace_id === currentWorkspaceId ? 'text-[#00333e]' : 'text-gray-400'}`} />
                    {workspace.name}
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      onClick={() => handleDeleteWorkspace(workspace.workspace_id)}
                      className="text-gray-400 hover:text-red-500 active:text-red-500 p-2 sm:p-1.5 rounded-md hover:bg-red-50 active:bg-red-50 transition-colors touch-manipulation"
                      disabled={isLoading || workspaceLoading}
                      title="Delete workspace"
                      aria-label="Delete workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  ), [workspaces, currentWorkspaceId, handleDeleteWorkspace, isLoading, workspaceLoading, setCurrentWorkspaceId, newWorkspaceName, handleCreateWorkspace, error]);

  return (
    <>
      <aside
        className={`bg-[#00333e] flex flex-col shadow-xl overflow-hidden transition-all duration-300 ease-in-out
          ${isSidebarOpen 
            ? 'fixed md:sticky top-0 left-0 h-screen w-64 z-50 md:z-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl md:top-4' 
            : 'fixed md:sticky top-0 left-0 h-screen w-0 md:w-64 -translate-x-full md:translate-x-0 z-50 md:z-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl md:top-4'
          }`}
      >
        <div className="flex flex-col h-full py-4">
          {/* Logo Section - Hidden on mobile, shown on desktop */}
          <div className="hidden md:flex px-5 mb-6 items-center gap-3">
            <img src="/assets/briq.png" alt="Briq Logo" className="w-8 h-8" />
            <h1 className="text-lg font-bold text-white">Briq Solutions</h1>
          </div>
          
          {/* Close button for mobile */}
          <div className="flex md:hidden px-4 mb-4 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/briq.png" alt="Briq Logo" className="w-8 h-8" />
              <h1 className="text-lg font-bold text-white">Briq Solutions</h1>
            </div>
            <button
              onClick={closeSidebar}
              className="p-2 text-gray-300 hover:text-white hover:bg-[#004d5c] rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 md:py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group touch-manipulation ${!isWorkspaceSelected
                    ? 'text-gray-500 cursor-not-allowed'
                    : isActive
                      ? 'bg-[#fddf0d] text-[#00333e] shadow-lg shadow-[#fddf0d]/20'
                      : 'text-gray-300 hover:bg-[#004d5c] hover:text-white active:bg-[#004d5c]'
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
                <item.icon className={`w-5 h-5 md:w-5 md:h-5 mr-3 transition-colors flex-shrink-0 ${!isWorkspaceSelected ? 'text-gray-600' : ''
                  }`} />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer Section (Workspace, User Profile & Actions) */}
          <div className="mt-auto px-4 pt-4 border-t border-[#004d5c] space-y-4">

            {/* Workspace Selector (Moved to Bottom) */}
            <div>
              <button
                onClick={() => {
                  setIsWorkspaceModalOpen(true);
                  closeSidebar();
                }}
                className={`w-full px-3 py-3 md:py-2.5 text-sm font-medium rounded-lg transition-all duration-200 flex items-center gap-2 touch-manipulation ${isWorkspaceSelected
                    ? 'text-white bg-[#004d5c] border border-[#fddf0d]/20 hover:bg-[#005a6e] active:bg-[#005a6e]'
                    : 'text-gray-400 bg-[#002a36] italic'
                  }`}
              >
                <Building className="w-4 h-4 text-[#fddf0d] flex-shrink-0" />
                <span className="truncate flex-1 text-left">{activeWorkspace?.name || 'Select Workspace'}</span>
                <Settings className="w-3 h-3 text-gray-400 flex-shrink-0" />
              </button>
              {!isWorkspaceSelected && (
                <p className="mt-1 text-[10px] text-red-400 px-1">Please select a workspace.</p>
              )}
            </div>

            {/* User Profile & Actions */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="relative">
                  <button
                    onClick={() => {
                      setIsNotificationOpen(!isNotificationOpen);
                      closeSidebar();
                    }}
                    className="p-2.5 md:p-2 text-gray-300 hover:text-white hover:bg-[#004d5c] active:bg-[#004d5c] rounded-lg transition-colors relative touch-manipulation"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                </div>

                <Link 
                  to="/account" 
                  onClick={closeSidebar}
                  className="p-2.5 md:p-2 text-gray-300 hover:text-white hover:bg-[#004d5c] active:bg-[#004d5c] rounded-lg transition-colors touch-manipulation"
                  aria-label="Account Settings"
                >
                  <Settings className="w-5 h-5" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2.5 md:p-2 text-gray-300 hover:text-red-400 hover:bg-[#004d5c] active:bg-[#004d5c] rounded-lg transition-colors touch-manipulation"
                  aria-label="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#002a36] border border-[#004d5c]">
                <img
                  src={avatarUrl}
                  alt={user?.username}
                  className="w-9 h-9 rounded-full border border-[#004d5c]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.username || 'User'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modals and Panels */}
      <AnimatePresence>
        {isNotificationOpen && notificationPanel}
        {isWorkspaceModalOpen && workspaceModal}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;