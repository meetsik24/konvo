import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Lock, Edit, Check, X } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../services/api';
import type { RootState } from '..';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  user_id: string;
  username: string;
  email: string;
  full_name: string; 
  mobile_number: string;
  account_status: string;
}

const Account: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserProfile>({
    user_id: '',
    username: '',
    email: '',
    full_name: '',
    mobile_number: '',
    account_status: 'active',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getProfile(token);
        console.log('Fetched profile data:', data);
        setProfile(data);
        setFormData({
          user_id: data.user_id || '',
          username: data.username || '',
          email: data.email || '',
          full_name: data.full_name || '',
          mobile_number: data.mobile_number || '',
          account_status: data.account_status || 'Not set',
        });
        setError(null);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!formData.full_name.trim()) {
      setError('Full name is required.');
      setIsLoading(false);
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (!phoneRegex.test(formData.mobile_number)) {
      setError('Please enter a valid mobile number (e.g., +1234567890).');
      setIsLoading(false);
      return;
    }

    try {
      const updatedData = {
        full_name: formData.full_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
      };
      await updateProfile({ token, ...updatedData });
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      const newProfile = await getProfile(token);
      setProfile(newProfile);
      setFormData({
        ...formData,
        ...newProfile,
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
  
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All password fields are required.');
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirmation do not match.');
      setIsLoading(false);
      return;
    }
  
    try {
      await changePassword(token, {
        old_password: passwordData.currentPassword, // Changed from current_password to old_password
        new_password: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail;
      if (Array.isArray(errorMessage)) {
        setError(errorMessage.map((err: any) => err.msg || err.message || 'Unknown error').join(', '));
      } else {
        setError(errorMessage || 'Failed to change password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-semibold text-[#00333e] mb-8">Account Settings</h1>
      </motion.div>

      {/* Error and Success Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-center mb-6"
        >
          {error}
        </motion.div>
      )}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-md text-center mb-6"
        >
          {success}
        </motion.div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-md p-6 border border-gray-200 mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Profile Information</h2>
        {!isEditing ? (
          <div className="space-y-3 sm:space-y-4">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Username: {profile?.username || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Full Name: {profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Email: {profile?.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Mobile Number: {profile?.mobile_number || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Account Status: {profile?.account_status || 'Not set'}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Username</label>
              <input
                type="text"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Full Name</label>
              <input
                type="text"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
              <input
                type="email"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Mobile Number</label>
              <input
                type="tel"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Account Status</label>
              <input
                type="text"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={formData.account_status}
                onChange={(e) => setFormData({ ...formData, account_status: e.target.value })}
                disabled
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Change Section */}
      <div className="bg-white rounded-md p-6 border border-gray-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#00333e]">Change Password</h2>
        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e]"
          >
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Current Password</label>
              <input
                type="password"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">New Password</label>
              <input
                type="password"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Confirm New Password</label>
              <input
                type="password"
                className="w-full text-sm py-3 px-4 border border-gray-300 rounded-md bg-white text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 text-sm py-2 px-3 bg-[#00333e] text-white rounded-md hover:bg-[#005a6e] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Account;