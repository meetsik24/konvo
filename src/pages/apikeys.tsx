import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Copy, Trash2, Shield, RefreshCw, Lock } from 'lucide-react';

// Remove MUI imports and use HTML/Tailwind instead

interface ApiKey {
  id: string;
  key: string;
  createdAt: string;
}

const ApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success' as 'success' | 'error'
  });

  // Add loading states for individual operations
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/keys');
      const data = await response.json();
      setApiKeys(data);
    } catch (error) {
      showNotification('Failed to fetch API keys', 'error');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const generateApiKey = async () => {
    setLoading(true);
    try {
      // TODO: Replace with your API endpoint
      const response = await fetch('/api/keys', { method: 'POST' });
      const newKey = await response.json();
      setApiKeys([...apiKeys, newKey]);
      showNotification('New API key generated successfully', 'success');
    } catch (error) {
      showNotification('Failed to generate API key', 'error');
    }
    setLoading(false);
  };

  // Enhanced delete function with confirmation and loading state
  const deleteApiKey = async (id: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this API key? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    setActionInProgress(`delete-${id}`);
    try {
      const response = await fetch(`/api/keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete API key');
      }

      setApiKeys(prevKeys => prevKeys.filter(key => key.id !== id));
      showNotification('API key deleted successfully', 'success');
    } catch (error) {
      showNotification('Failed to delete API key', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  // Enhanced copy function with loading state and error handling
  const copyToClipboard = async (key: string) => {
    setActionInProgress(`copy-${key}`);
    try {
      await navigator.clipboard.writeText(key);
      showNotification('API key copied to clipboard', 'success');
    } catch (error) {
      showNotification('Failed to copy API key', 'error');
    } finally {
      setActionInProgress(null);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 8);
    const suffix = key.slice(-4);
    return `${prefix}...${suffix}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Key className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">API Key Management</h1>
      </div>

      <div className="card p-8">
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">Manage your API keys securely</p>
          <button
            onClick={generateApiKey}
            disabled={loading}
            className="btn btn-primary flex items-center gap-2"
          >
            <Key className="w-5 h-5" />
            Generate New API Key
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">API Key</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((apiKey) => (
                  <tr key={apiKey.id} className="border-b">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full border font-mono text-sm">
                        {maskApiKey(apiKey.key)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(apiKey.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard(apiKey.key)}
                        className="btn btn-icon btn-ghost"
                        disabled={actionInProgress === `copy-${apiKey.key}`}
                        title="Copy API key"
                      >
                        {actionInProgress === `copy-${apiKey.key}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500" />
                        ) : (
                          <Copy className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="btn btn-icon btn-ghost text-red-500"
                        disabled={actionInProgress === `delete-${apiKey.id}`}
                        title="Delete API key"
                      >
                        {actionInProgress === `delete-${apiKey.id}` ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
                {apiKeys.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">
                      No API keys found. Generate one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <Shield className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Secure Access</h3>
          <p className="text-gray-600">Protect your API endpoints with key authentication</p>
        </div>
        <div className="card p-6">
          <RefreshCw className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Key Rotation</h3>
          <p className="text-gray-600">Regularly rotate keys for enhanced security</p>
        </div>
        <div className="card p-6">
          <Lock className="w-6 h-6 text-primary-500 mb-3" />
          <h3 className="text-lg font-semibold mb-2">Access Control</h3>
          <p className="text-gray-600">Manage permissions and access levels</p>
        </div>
      </div>

      {notification.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}
    </motion.div>
  );
};

export default ApiKeys;
