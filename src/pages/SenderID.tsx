// SenderID.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IdCard, Plus, Trash2, Edit2, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext'; // Adjust path
import { getSenderId } from '../services/api'; // Adjust path

interface SenderID {
  id: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

const SenderID: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [senderIds, setSenderIds] = useState<SenderID[]>(workspace?.senderIds || []);
  const [newSenderId, setNewSenderId] = useState('');
  const [editingSenderId, setEditingSenderId] = useState<SenderID | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync with current workspace data
  useEffect(() => {
    setSenderIds(workspace?.senderIds || []);
    setError(null); // Reset error on workspace switch
  }, [currentWorkspaceId, workspace]);

  // Fetch sender IDs if not cached
  useEffect(() => {
    const fetchSenderIds = async () => {
      if (senderIds.length > 0) return; // Skip if already loaded
      setIsLoading(true);
      try {
        const ids = await getSenderId();
        const formattedIds = ids.map((id: string, index: number) => ({
          id: Date.now().toString() + index, // Assuming API returns names only; adjust if it returns full objects
          name: id,
          status: 'approved', // Default status; adjust based on API response
        }));
        setSenderIds(formattedIds);
        setError(null);
        if (currentWorkspaceId) {
          updateWorkspace(currentWorkspaceId, { senderIds: formattedIds });
        }
      } catch (error) {
        console.error('Failed to fetch sender IDs:', error);
        setError('Unable to fetch sender IDs from the server. Using fallback data.');
        // Fallback data
        const fallbackIds = [
          { id: '1', name: 'CompanyA', status: 'approved' },
          { id: '2', name: 'Support', status: 'pending' },
        ];
        setSenderIds(fallbackIds);
        if (currentWorkspaceId) {
          updateWorkspace(currentWorkspaceId, { senderIds: fallbackIds });
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchSenderIds();
  }, [currentWorkspaceId, updateWorkspace, senderIds.length]);

  // Persist changes to workspace
  useEffect(() => {
    if (currentWorkspaceId) {
      updateWorkspace(currentWorkspaceId, { senderIds });
    }
  }, [senderIds, currentWorkspaceId, updateWorkspace]);

  const handleAddSenderId = () => {
    if (!newSenderId.trim()) {
      setError('Sender ID name cannot be empty.');
      return;
    }
    try {
      const senderId: SenderID = {
        id: Date.now().toString(),
        name: newSenderId.trim(),
        status: 'pending', // New sender IDs start as pending
      };
      setSenderIds([...senderIds, senderId]);
      setNewSenderId('');
      setError(null);
    } catch (error) {
      console.error('Error adding sender ID:', error);
      setError('Failed to add sender ID.');
    }
  };

  const handleEditSenderId = (senderId: SenderID) => {
    setEditingSenderId(senderId);
  };

  const handleUpdateSenderId = () => {
    if (!editingSenderId || !editingSenderId.name.trim()) {
      setError('Sender ID name cannot be empty.');
      return;
    }
    try {
      setSenderIds(
        senderIds.map((s) =>
          s.id === editingSenderId.id ? { ...editingSenderId } : s
        )
      );
      setEditingSenderId(null);
      setError(null);
    } catch (error) {
      console.error('Error updating sender ID:', error);
      setError('Failed to update sender ID.');
    }
  };

  const handleDeleteSenderId = (id: string) => {
    if (window.confirm('Are you sure you want to delete this sender ID?')) {
      try {
        setSenderIds(senderIds.filter((s) => s.id !== id));
        setError(null);
      } catch (error) {
        console.error('Error deleting sender ID:', error);
        setError('Failed to delete sender ID.');
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3 mb-8">
        <IdCard className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Sender IDs</h1>
      </div>

      {/* Error Message */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading sender IDs...</p>
        </div>
      )}

      {/* Sender ID Form */}
      {!isLoading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingSenderId ? 'Edit Sender ID' : 'Add New Sender ID'}
          </h2>
          <div className="flex gap-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Enter sender ID name (e.g., CompanyName)"
              value={editingSenderId ? editingSenderId.name : newSenderId}
              onChange={(e) =>
                editingSenderId
                  ? setEditingSenderId({ ...editingSenderId, name: e.target.value })
                  : setNewSenderId(e.target.value)
              }
            />
            <button
              onClick={editingSenderId ? handleUpdateSenderId : handleAddSenderId}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {editingSenderId ? 'Update' : 'Add'}
            </button>
            {editingSenderId && (
              <button
                onClick={() => setEditingSenderId(null)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sender ID List */}
      {!isLoading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Current Sender IDs</h2>
          {senderIds.length === 0 ? (
            <p className="text-gray-500">No sender IDs available.</p>
          ) : (
            <div className="space-y-4">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{senderId.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      Status: {senderId.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSenderId(senderId)}
                      className="btn btn-icon btn-ghost"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSenderId(senderId.id)}
                      className="btn btn-icon btn-ghost text-red-500"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SenderID;