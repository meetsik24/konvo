import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Trash2, Shield, RefreshCw, Lock, CheckCircle, X } from 'lucide-react';
import { listApiKeys, createApiKey, deleteApiKey } from '../services/api';

interface ApiKey {
  api_key_id: string;
  name: string;
  api_key: string;
  status: 'active' | 'inactive';
  created_at: string;
  expires_at: string;
}

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Fetch API keys
  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const data = await listApiKeys();
      setApiKeys(data);
    } catch (error: any) {
      showNotification('Failed to fetch API keys: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  // Create a new API key
  const handleCreateApiKey = async () => {
    setLoading(true);
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // Set to 30 days from now
  
      const newKey = await createApiKey({
        name: 'NewApiKey', // Simplified name
        expires_at: expiresAt.toISOString(),
      });
      setApiKeys((prev) => [...prev, newKey]);
      showNotification('New API key generated successfully', 'success');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to generate API key';
      showNotification(`Failed to generate API key: ${errorMessage}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete an API key
  const handleDeleteApiKey = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this API key? This action cannot be undone.'
    );

    if (!confirmed) return;

    setActionInProgress(`delete-${id}`);
    try {
      await deleteApiKey(id);
      setApiKeys((prevKeys) => prevKeys.filter((key) => key.api_key_id !== id));
      showNotification('API key deleted successfully', 'success');
    } catch (error: any) {
      showNotification('Failed to delete API key: ' + error.message, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = async (key: string) => {
    setActionInProgress(`copy-${key}`);
    try {
      await navigator.clipboard.writeText(key);
      showNotification('API key copied to clipboard', 'success');
    } catch (error: any) {
      showNotification('Failed to copy API key: ' + error.message, 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 4000);
  };

  // Mask API key for display
  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 8);
    const suffix = key.slice(-4);
    return `${prefix}...${suffix}`;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Success/Error Notification */}
      {notification.show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <div
            className={`p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs ${
              notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              {notification.type === 'success' ? (
                <CheckCircle className="w-10 h-10" />
              ) : (
                <X className="w-10 h-10" />
              )}
            </motion.div>
            <span className="text-lg font-semibold text-center">
              {notification.type === 'success' ? 'Success' : 'Error'}
            </span>
            <p className="text-sm text-center">{notification.message}</p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <Key className="w-6 h-6 text-[#00333e]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#00333e]">API Key Management</h1>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00333e]"></div>
          <p className="ml-4 text-[#00333e] text-lg">Loading...</p>
        </motion.div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="space-y-6">
          {/* API Keys Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <p className="text-sm text-gray-600">Manage your API keys securely</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateApiKey}
                disabled={loading}
                className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-colors disabled:bg-[#00333e]/50"
              >
                <Key className="w-5 h-5" />
                Generate New API Key
              </motion.button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-[#00333e] text-sm">
                      API Key
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#00333e] text-sm">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#00333e] text-sm">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#00333e] text-sm">
                      Created
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-[#00333e] text-sm">
                      Expires
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-[#00333e] text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((apiKey) => (
                    <motion.tr
                      key={apiKey.api_key_id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full border font-mono text-sm text-gray-700">
                          {maskApiKey(apiKey.api_key)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">{apiKey.name}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            apiKey.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {apiKey.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(apiKey.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {new Date(apiKey.expires_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyToClipboard(apiKey.api_key)}
                          disabled={actionInProgress === `copy-${apiKey.api_key}`}
                          className="text-gray-500 hover:text-[#00333e] transition-colors"
                          title="Copy API key"
                        >
                          {actionInProgress === `copy-${apiKey.api_key}` ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00333e]" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteApiKey(apiKey.api_key_id)}
                          disabled={actionInProgress === `delete-${apiKey.api_key_id}`}
                          className="text-red-500 hover:text-red-600 transition-colors"
                          title="Delete API key"
                        >
                          {actionInProgress === `delete-${apiKey.api_key_id}` ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-500" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                  {apiKeys.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                        No API keys found. Generate one to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Secure Access</h3>
                  <p className="text-gray-600 text-sm">
                    Protect your API endpoints with key authentication
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <RefreshCw className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Key Rotation</h3>
                  <p className="text-gray-600 text-sm">
                    Regularly rotate keys for enhanced security
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Lock className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Access Control</h3>
                  <p className="text-gray-600 text-sm">
                    Manage permissions and access levels
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ApiKeys;