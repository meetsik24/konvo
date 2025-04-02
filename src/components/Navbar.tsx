import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Settings, LogOut, Check, Menu, X, Trash2, Building } from 'lucide-react';
import { logout, fetchUserProfile } from '../store/slices/authSlice';
import { store } from '../store/store';
import { fetchNotifications, deleteNotification, markNotificationAsRead, getSubscriptionUsage } from '../services/api';
import { motion } from 'framer-motion';

import type { RootState } from '../store/store';
import { useWorkspace } from '../pages/WorkspaceContext';

interface Notification {
  notification_id: string;
  user_id: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

interface NavbarProps {
  isSidebarOpen?: boolean;
  toggleSidebar: () => void;
  closeSidebar?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isSidebarOpen, toggleSidebar }) => {
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
    isLoading: workspaceLoading,
  } = useWorkspace();

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [balance, setBalance] = useState<number | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const fetchedNotifications = await fetchNotifications();
        setNotifications(fetchedNotifications);
      } catch (err: any) {
        setError(err.message || 'Failed to load notifications');
      }
    };
    loadNotifications();
  }, []);

  // Fetch SMS credits balance on mount and when user or token changes
  useEffect(() => {
    const loadBalance = async () => {
      if (!user?.plan_id || !token) return;
      try {
        const subscriptionUsage = await getSubscriptionUsage(user.plan_id);
        setBalance(subscriptionUsage.sms_credits);
      } catch (err: any) {
        setError(err.message || 'Failed to load balance');
      }
    };
    loadBalance();
  }, [token, user]);

  // Automatically open workspace modal if no workspaces exist
  useEffect(() => {
    if (workspaces.length === 0 && !workspaceLoading && !isWorkspaceModalOpen) {
      setIsWorkspaceModalOpen(true);
    }
  }, [workspaces, workspaceLoading, isWorkspaceModalOpen]);

  useEffect(() => {
    if (!token || status === 'loading' || user) return;
    setIsLoading(true);
    dispatch(fetchUserProfile(token) as any)
      .unwrap()
      .then(() => setError(null))
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile.';
        setError(errorMessage);
      })
      .finally(() => setIsLoading(false));
  }, [token, dispatch, status, user]);

  const handleLogout = useCallback(() => {
    dispatch(logout());
    navigate('/login');
  }, [dispatch, navigate]);

  const handleCreateWorkspace = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [newWorkspaceName, addWorkspace, refreshWorkspaces, workspaces]
  );

  const handleDeleteWorkspace = useCallback(
    async (id: string) => {
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
    },
    [deleteWorkspace, refreshWorkspaces, workspaces]
  );

  const handleDismissNotification = useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id);
        setNotifications((prev) => prev.filter((notif) => notif.notification_id !== id));
      } catch (err: any) {
        setError(err.message || 'Failed to dismiss notification');
      }
    },
    []
  );

  const handleMarkAsRead = useCallback(
    async (id: string) => {
      try {
        await markNotificationAsRead(id);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.notification_id === id ? { ...notif, is_read: true } : notif
          )
        );
      } catch (err: any) {
        setError(err.message || 'Failed to mark notification as read');
      }
    },
    []
  );

  const notificationPanel = useMemo(
    () => (
      <>
        {/* Mobile: Centered Pop-Up */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:hidden">
          <div className="bg-white border rounded-xl shadow-lg w-full max-w-[90vw] max-h-[80vh] overflow-y-auto">
            <div className="p-3 border-b flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {error ? (
              <p className="p-3 text-red-500 text-center text-xs">{error}</p>
            ) : notifications.length === 0 ? (
              <p className="p-3 text-gray-500 text-center text-xs">No notifications</p>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.notification_id}
                  className={`flex items-start gap-2 p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                    notif.is_read ? 'bg-gray-100' : 'bg-white'
                  }`}
                >
                  <div className="flex-shrink-0">
                    <span className="text-blue-500">i</span>
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-xs ${
                        notif.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'
                      }`}
                    >
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(notif.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.notification_id)}
                        className="text-gray-400 hover:text-green-500"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDismissNotification(notif.notification_id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Desktop: Dropdown */}
        <div className="hidden sm:block absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
          <div className="p-3 border-b">
            <h3 className="text-base font-semibold text-gray-800">Notifications</h3>
          </div>
          {error ? (
            <p className="p-3 text-red-500 text-center text-xs">{error}</p>
          ) : notifications.length === 0 ? (
            <p className="p-3 text-gray-500 text-center text-xs">No notifications</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.notification_id}
                className={`flex items-start gap-2 p-3 border-b last:border-b-0 hover:bg-gray-50 ${
                  notif.is_read ? 'bg-gray-100' : 'bg-white'
                }`}
              >
                <div className="flex-shrink-0">
                  <span className="text-blue-500">i</span>
                </div>
                <div className="flex-1">
                  <p
                    className={`text-xs ${
                      notif.is_read ? 'text-gray-500' : 'text-gray-700 font-medium'
                    }`}
                  >
                    {notif.message}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(notif.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.notification_id)}
                      className="text-gray-400 hover:text-green-500"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismissNotification(notif.notification_id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          )
        </div>
      </>
    ),
    [notifications, handleDismissNotification, handleMarkAsRead, error]
  );

  const workspaceModal = useMemo(
    () => (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4"
        onClick={() => {
          if (workspaces.length > 0) setIsWorkspaceModalOpen(false);
        }}
      >
        <div
          className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-[90vw] sm:max-w-sm max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
            <h4 className="text-base sm:text-lg font-bold text-[#00333e]">Manage Workspaces</h4>
            {workspaces.length > 0 && (
              <button
                onClick={() => setIsWorkspaceModalOpen(false)}
                className="text-gray-500 hover:text-[#00333e] transition-colors"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {/* Create Workspace Form */}
          <div className="p-3 sm:p-4">
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-[#00333e] mb-1">
                  Create New Workspace
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm text-[#00333e] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
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
                className="w-full bg-[#00333e] text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-lg hover:bg-[#002a36] transition-colors disabled:bg-[#00333e]/50"
                disabled={isLoading || workspaceLoading}
              >
                {isLoading || workspaceLoading ? 'Creating...' : 'Create Workspace'}
              </button>
            </form>
          </div>

          {/* Workspace List */}
          <div className="p-3 sm:p-4 pt-0 sm:pt-0">
            <h5 className="text-xs sm:text-sm font-semibold text-[#00333e] mb-2 sm:mb-3">
              Your Workspaces
            </h5>
            {workspaceLoading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00333e] mx-auto" />
                <p className="text-gray-500 text-xs mt-1">Loading workspaces...</p>
              </div>
            ) : workspaces.length === 0 ? (
              <p className="text-gray-500 text-xs text-center">
                No workspaces available. Please create one to proceed.
              </p>
            ) : (
              workspaces.map((workspace) => (
                <div
                  key={workspace.workspace_id}
                  className="flex items-center justify-between py-1 sm:py-2 px-2 sm:px-3 mb-1 sm:mb-2 rounded-lg hover:bg-[#fddf0d] transition-colors border border-gray-200"
                >
                  <button
                    onClick={() => {
                      setCurrentWorkspaceId(workspace.workspace_id);
                      setIsWorkspaceModalOpen(false);
                    }}
                    className={`flex-1 text-left text-xs sm:text-sm ${
                      workspace.workspace_id === currentWorkspaceId
                        ? 'text-[#00333e] font-semibold'
                        : 'text-gray-700 hover:text-[#00333e]'
                    }`}
                    disabled={isLoading || workspaceLoading}
                  >
                    <Building className="w-4 h-4 inline-block mr-1" /> {workspace.name}
                  </button>
                  {workspaces.length > 1 && (
                    <button
                      onClick={() => handleDeleteWorkspace(workspace.workspace_id)}
                      className="text-red-500 hover:text-red-600 p-1 transition-colors"
                      disabled={isLoading || workspaceLoading}
                      title="Delete workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    ),
    [
      workspaces,
      currentWorkspaceId,
      handleDeleteWorkspace,
      isLoading,
      workspaceLoading,
      setCurrentWorkspaceId,
      newWorkspaceName,
      handleCreateWorkspace,
      error,
    ]
  );

  useEffect(() => {
    if (workspaces.length > 0 && !currentWorkspaceId && !workspaceLoading) {
      const newId = workspaces[0].workspace_id;
      setCurrentWorkspaceId(newId);
      localStorage.setItem('currentWorkspaceId', newId);
    }
  }, [workspaces, currentWorkspaceId, setCurrentWorkspaceId, workspaceLoading]);

  const avatarUrl =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=006400&color=fff`;

  const unreadCount = notifications.filter((notif) => !notif.is_read).length;

  return (
    <>
      {/* Mobile Navbar (hidden on desktop) */}
      <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50 sm:hidden">
        <div className="px-3 sm:px-5 mx-auto max-w-7xl">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Left Side: Hamburger Menu and Logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSidebar}
                className="p-2 text-[#00333e] rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300"
                aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isSidebarOpen}
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <Link to="/" className="flex items-center">
                <motion.img
                  src="/assets/briq2.png"
                  alt="Briq Logo"
                  className="w-10 h-10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                />
              </Link>
            </div>

            {/* Right Side: Actions */}
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-[#00333e] rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300 relative"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationOpen && notificationPanel}
              </div>

              {/* Workspace Button with Icon */}
              <div className="relative">
                <button
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 text-[#00333e] rounded-lg hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300 text-xs sm:text-sm font-medium border border-transparent hover:border-[#fddf0d]"
                  disabled={isLoading || workspaceLoading}
                >
                  <Building className="w-4 h-4 sm:w-5 sm:h-5" />
                  Workspace
                </button>
                {isWorkspaceModalOpen && workspaceModal}
              </div>

              {/* Settings */}
              <Link
                to="/account"
                className="p-2 text-[#00333e] rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300"
              >
                <Settings className="w-5 h-5 sm:w-6 sm:h-6" />
              </Link>

              {/* Avatar */}
              <div className="flex items-center gap-1 sm:gap-2 bg-[#fddf0d] px-2 sm:px-3 py-1 sm:py-2 rounded-full">
                <img
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-green-500 hover:border-[#00333e] transition-all duration-300"
                  src={avatarUrl}
                  alt={user?.username || 'User'}
                  onError={(e) => {
                    console.error('Avatar load error, falling back to default image');
                    e.currentTarget.src = '/assets/default-avatar.png';
                  }}
                />
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-[#00333e] rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Navbar (hidden on mobile) */}
      <nav className="bg-white shadow-md fixed top-0 left-64 w-[calc(100%-256px)] z-50 hidden sm:block">
        <div className="px-4 sm:px-3">
          <div className="flex justify-end items-center h-16">
            {/* Right Side: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Balance */}
              <div className="text-sm font-medium text-[#00333e] hidden md:block">
                SMS Credits:{' '}
                <span className="text-[#fddf0d]">
                  {balance !== null ? balance : 'Loading...'}
                </span>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-[#00333e] rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300 relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {isNotificationOpen && notificationPanel}
              </div>

              {/* Workspace Button */}
              <button
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-[#00333e] rounded-lg hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300 text-sm font-medium border border-transparent hover:border-[#fddf0d] hidden md:flex"
                disabled={isLoading || workspaceLoading}
              >
                <Building className="w-5 h-5" />
                <span>Workspace</span>
              </button>
              {isWorkspaceModalOpen && workspaceModal}

              {/* Settings */}
              <Link
                to="/account"
                className="p-2 text-[#00333e] rounded-full hover:bg-[#fddf0d] hover:text-[#00333e] transition-all duration-300"
              >
                <Settings className="w-6 h-6" />
              </Link>

              {/* Avatar */}
              <div className="flex items-center gap-2 bg-[#fddf0d] px-3 py-2 rounded-full">
                <img
                  className="w-8 h-8 rounded-full border-2 border-green-500 hover:border-[#00333e] transition-all duration-300"
                  src={avatarUrl}
                  alt={user?.username || 'User'}
                  onError={(e) => (e.currentTarget.src = '/assets/default-avatar.png')}
                />
                <div className="hidden lg:block">
                  <div className="text-xs font-bold text-[#00333e]">{user?.username || 'Loading...'}</div>
                  <div className="text-xs text-gray-700">{user?.email || 'Loading...'}</div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-[#00333e] rounded-full hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;