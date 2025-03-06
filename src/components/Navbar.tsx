// Navbar.tsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Settings, LogOut, Coffee, Plus, ChevronDown } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';
import { useWorkspace } from '../pages/WorkspaceContext';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { workspaces, currentWorkspaceId, addWorkspace, setCurrentWorkspaceId } = useWorkspace();
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    addWorkspace(newWorkspaceName);
    setNewWorkspaceName('');
    setIsCreateModalOpen(false);
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
            {/* Workspace Navigation Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                className="flex items-center gap-2 p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors"
              >
                <Coffee className="w-6 h-6" />
                <span className="hidden md:inline">Workspaces</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isWorkspaceDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                  {workspaces.map(workspace => (
                    <button
                      key={workspace.id}
                      onClick={() => {
                        setCurrentWorkspaceId(workspace.id);
                        setIsWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${
                        workspace.id === currentWorkspaceId
                          ? 'bg-primary-50 text-primary-500'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {workspace.name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setIsCreateModalOpen(true);
                      setIsWorkspaceDropdownOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> New Workspace
                  </button>
                </div>
              )}
            </div>

            <button className="p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors">
              <Bell className="w-6 h-6" />
            </button>
            <Link to="/account" className="p-2 text-gray-600 rounded-full hover:bg-primary-50 hover:text-primary-500 transition-colors">
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
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary px-4 py-2 text-sm font-medium text-white rounded-xl"
                >
                  Create
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