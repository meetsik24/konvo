import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Bell, Settings, LogOut, Coffee } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import type { RootState } from '../store';

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-white border-b-2 border-primary-100">
      <div className="px-6 mx-auto max-w-7xl">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="w-8 h-8 text-primary-500" />
              <span className="text-2xl font-bold text-primary-500">Briq</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-6">
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
    </nav>
  );
};

export default Navbar;