import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { User, Lock, Edit, Check, X } from 'lucide-react';
import { getProfile, updateProfile, changePassword } from '../services/api'; // Adjust path
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

  // Fetch profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const data = await getProfile(token);
        console.log('Fetched profile data:', data); // Log the full response
        // Ensure all fields are mapped, even if some are missing
        setProfile(data);
        setFormData({
          user_id: data.user_id || '',
          username: data.username || '',
          email: data.email || '',
          full_name: data.full_name || '',
          mobile_number: data.mobile_number || '',
          account_status: data.account_status || 'Not set', // Default if missing
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

  // Handle profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // Basic international phone number format
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
        // Note: account_status is not included here because it's not editable in the form
      };
      await updateProfile(token, updatedData);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      // Refetch profile to ensure consistency, including account_status
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

  // Handle password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
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
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
      });
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsChangingPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setError(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6 p-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <User className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Account Settings</h1>
      </div>

      {/* Error and Success Messages */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}

      {/* Profile Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Username: {profile?.username || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Full Name: {profile?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email: {profile?.email || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Mobile Number: {profile?.mobile_number || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status: {profile?.account_status || 'Not set'}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Edit className="w-5 h-5" />
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                className="input w-full"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled // Username might be immutable; adjust if editable
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                className="input w-full"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="input w-full"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
              <input
                type="tel"
                className="input w-full"
                value={formData.mobile_number}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
              <input
                type="text"
                className="input w-full"
                value={formData.account_status}
                onChange={(e) => setFormData({ ...formData, account_status: e.target.value })}
                disabled // Assuming account_status is read-only; adjust if editable
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="btn btn-secondary"
              >
                <X className="w-5 h-5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Password Change Section */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {!isChangingPassword ? (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Lock className="w-5 h-5" />
            Change Password
          </button>
        ) : (
          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <input
                type="password"
                className="input w-full"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                className="input w-full"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <input
                type="password"
                className="input w-full"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
              />
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setIsChangingPassword(false)}
                className="btn btn-secondary"
              >
                <X className="w-5 h-5" /> Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default Account;