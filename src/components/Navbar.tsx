import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Settings, LogOut, Plus, X, Coffee, ChevronDown, Trash2 } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useWorkspace } from '../pages/WorkspaceContext';

interface Notification {
  id: string;
  type: 'senderid_accepted' | 'senderid_rejected' | 'subscription_renewal' | 'other';
  message: string;
  timestamp: string;
}

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId, addWorkspace, deleteWorkspace } = useWorkspace();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isWorkspaceListOpen, setIsWorkspaceListOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock notifications
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'senderid_accepted', message: 'Sender ID "BRIQ123" was accepted.', timestamp: '2025-03-06T10:00:00Z' },
    { id: '2', type: 'senderid_rejected', message: 'Sender ID "TESTID" was rejected.', timestamp: '2025-03-06T09:30:00Z' },
    { id: '3', type: 'subscription_renewal', message: 'Your subscription renews in 3 days.', timestamp: '2025-03-06T08:00:00Z' },
    { id: '4', type: 'other', message: 'System maintenance scheduled for tomorrow.', timestamp: '2025-03-05T15:00:00Z' },
  ]);

  const handleLogout = () => {
    console.log('Logging out user:', user?.email);
    dispatch(logout());
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      console.log('Workspace name is empty, aborting creation');
      setError('Workspace name cannot be empty');
      return;
    }
    console.log('Creating workspace with name:', newWorkspaceName);
    setIsLoading(true);
    setError(null);
    try {
      await addWorkspace(newWorkspaceName);
      console.log('Workspace created successfully:', newWorkspaceName);
      setNewWorkspaceName('');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Failed to create workspace:', err);
      setError('Failed to create workspace. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    console.log('Initiating delete for workspace ID:', id);
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      setIsLoading(true);
      setError(null);
      try {
        await deleteWorkspace(id);
        console.log('Workspace deleted successfully, ID:', id);
        setIsWorkspaceListOpen(false);
      } catch (err: any) {
        console.error('Failed to delete workspace:', err);
        setError('Failed to delete workspace. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log('Delete canceled by user for ID:', id);
    }
  };

  const handleDismissNotification = (id: string) => {
    console.log('Dismissing notification with ID:', id);
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'senderid_accepted': return <span className="text-green-500">✓</span>;
      case 'senderid_rejected': return <span className="text-red-500">✗</span>;
      case 'subscription_renewal': return <span className="text-yellow-500">!</span>;
      case 'other': return <span className="text-blue-500">i</span>;
      default: return null;
    }
  };

  return (
    <nav className="bg-white border-b-2 border-primary-100">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/assets/briq2.png" alt="Briq Logo" className="w-8 h-8" />
              <span className="text-2xl font-bold text-primary-500">Briq</span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Panel */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors relative"
              >
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full" />
                )}
              </button>
              {isNotificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg z-10 max-h-96 overflow-y-auto">
                  <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center">No notifications</p>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="flex items-start gap-3 p-4 border-b last:border-b-0 hover:bg-gray-50"
                      >
                        <div className="flex-shrink-0">{getNotificationIcon(notif.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{notif.message}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDismissNotification(notif.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Workspace List Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceListOpen(!isWorkspaceListOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors"
              >
                <Coffee className="w-6 h-6" />
                <ChevronDown className="w-4 h-4" />
              </button>
              {isWorkspaceListOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white border rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto">
                  <div className="p-3 border-b bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-700">Your Workspaces</h4>
                  </div>
                  {workspaces.length === 0 ? (
                    <p className="p-4 text-gray-500 text-center text-sm">No workspaces available</p>
                  ) : (
                    workspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-gray-100 transition-colors"
                      >
                        <button
                          onClick={() => {
                            console.log('Switching to workspace ID:', workspace.id);
                            setCurrentWorkspaceId(workspace.id);
                            setIsWorkspaceListOpen(false);
                          }}
                          className={`flex-1 text-left text-sm ${
                            workspace.id === currentWorkspaceId
                              ? 'text-primary-600 font-semibold'
                              : 'text-gray-700 hover:text-primary-500'
                          }`}
                        >
                          {workspace.name}
                        </button>
                        {workspaces.length > 1 && (
                          <button
                            onClick={() => handleDeleteWorkspace(workspace.id)}
                            className="text-red-400 hover:text-red-600 p-1"
                            disabled={isLoading}
                            title="Delete workspace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Workspace Creation Button */}
            <button
              onClick={() => {
                console.log('Opening create workspace modal');
                setIsCreateModalOpen(true);
              }}
              className="flex items-center gap-2 p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors"
              disabled={isLoading}
            >
              <Plus className="w-6 h-6" />
              <span className="hidden md:inline text-sm">Workspace</span>
            </button>

            <Link
              to="/account"
              className="p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors"
            >
              <Settings className="w-6 h-6" />
            </Link>
            <div className="flex items-center gap-3 bg-primary-50 px-4 py-2 rounded-full">
              <img
                className="w-10 h-10 rounded-full border-2 border-primary-200"
                src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=ffaa00&color=fff`}
                alt={user?.name || 'User'}
              />
              <div className="hidden md:block">
                <div className="text-sm font-bold text-gray-700">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Workspace Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Create New Workspace</h2>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Workspace Name</label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="input w-full text-gray-600 border-primary-200 focus:border-primary-500 focus:ring-primary-500 rounded-xl"
                  placeholder="Enter workspace name"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Closing create workspace modal');
                    setIsCreateModalOpen(false);
                  }}
                  className="btn px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 text-sm font-medium text-white rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;