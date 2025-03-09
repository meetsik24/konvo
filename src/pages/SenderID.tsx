import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IdCard, Plus, Check, XCircle } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext'; // Adjust path
import {
  requestSenderId,
  getUserSenderRequests,
  getAdminSenderRequests,
  reviewSenderIdRequest,
} from '../services/api'; // Adjust path

interface SenderIDRequest {
  request_id: string;
  user_id: string;
  sender_id: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at?: string;
  reviewed_at?: string;
}

const SenderID: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId, isAdmin } = useWorkspace(); // Assuming isAdmin is available
  const workspace = getCurrentWorkspace();
  const [senderIds, setSenderIds] = useState<SenderIDRequest[]>(workspace?.senderIds || []);
  const [newSenderId, setNewSenderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false); // Toggle between user and admin view
  const [reviewRequest, setReviewRequest] = useState<{ request_id: string; status: 'approved' | 'rejected' } | null>(null);

  // Sync with current workspace data
  useEffect(() => {
    setSenderIds(workspace?.senderIds || []);
    setError(null); // Reset error on workspace switch
  }, [currentWorkspaceId, workspace]);

  // Fetch sender ID requests based on user role
  useEffect(() => {
    const fetchSenderIds = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      setIsLoading(true);
      try {
        const requests = isAdmin && isAdminView
          ? await getAdminSenderRequests(currentWorkspaceId)
          : await getUserSenderRequests(currentWorkspaceId);
        const formattedRequests = requests.map((req: any) => ({
          request_id: req.request_id || req.id || Date.now().toString(), // Adjust based on API response
          user_id: req.user_id || '', // Adjust based on API response
          sender_id: req.sender_id || req.name || '', // Adjust based on API response
          status: req.status || 'pending', // Adjust based on API response
          requested_at: req.requested_at,
          reviewed_at: req.reviewed_at,
        }));
        setSenderIds(formattedRequests);
        updateWorkspace(currentWorkspaceId, { senderIds: formattedRequests });
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch sender IDs:', error);
        setError('Unable to fetch sender ID requests from the server.');
        const fallbackIds = [
          { request_id: '1', user_id: 'user1', sender_id: 'CompanyA', status: 'approved', requested_at: new Date().toISOString() },
          { request_id: '2', user_id: 'user2', sender_id: 'Support', status: 'pending', requested_at: new Date().toISOString() },
        ];
        setSenderIds(fallbackIds);
        updateWorkspace(currentWorkspaceId, { senderIds: fallbackIds });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSenderIds();
  }, [currentWorkspaceId, updateWorkspace, isAdmin, isAdminView]);

  // Persist changes to workspace
  useEffect(() => {
    if (currentWorkspaceId) {
      updateWorkspace(currentWorkspaceId, { senderIds });
    }
  }, [senderIds, currentWorkspaceId, updateWorkspace]);

  const handleRequestSenderId = async () => {
    if (!newSenderId.trim()) {
      setError('Sender ID name cannot be empty.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestSenderId(currentWorkspaceId, { sender_id: newSenderId.trim() });
      const newRequest = {
        request_id: response.request_id || Date.now().toString(),
        user_id: response.user_id || '', // Assuming user_id is managed server-side
        sender_id: newSenderId.trim(),
        status: 'pending',
        requested_at: response.requested_at || new Date().toISOString(),
        reviewed_at: response.reviewed_at,
      };
      setSenderIds([...senderIds, newRequest]);
      setNewSenderId('');
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: [...senderIds, newRequest] });
    } catch (error: any) {
      console.error('Error requesting sender ID:', error);
      setError('Failed to request sender ID. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSenderId = async (requestId: string, status: 'approved' | 'rejected') => {
    if (!currentWorkspaceId || !isAdmin) return;
    setIsLoading(true);
    try {
      await reviewSenderIdRequest(currentWorkspaceId, requestId, { status });
      const updatedRequests = senderIds.map((req) =>
        req.request_id === requestId ? { ...req, status, reviewed_at: new Date().toISOString() } : req
      );
      setSenderIds(updatedRequests);
      setReviewRequest(null);
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: updatedRequests });
    } catch (error: any) {
      console.error('Error reviewing sender ID request:', error);
      setError('Failed to review sender ID request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="flex items-center gap-3 mb-8">
        <IdCard className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Sender IDs</h1>
        {isAdmin && (
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="btn btn-secondary ml-auto"
          >
            {isAdminView ? 'User View' : 'Admin View'}
          </button>
        )}
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

      {/* Sender ID Request Form */}
      {!isLoading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">Request New Sender ID</h2>
          <div className="flex gap-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Enter sender ID name (e.g., CompanyName)"
              value={newSenderId}
              onChange={(e) => setNewSenderId(e.target.value)}
            />
            <button
              onClick={handleRequestSenderId}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Request
            </button>
          </div>
        </div>
      )}

      {/* Sender ID List */}
      {!isLoading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isAdminView ? 'Pending Sender ID Requests' : 'My Sender ID Requests'}
          </h2>
          {senderIds.length === 0 ? (
            <p className="text-gray-500">No sender ID requests available.</p>
          ) : (
            <div className="space-y-4">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.request_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{senderId.sender_id}</h3>
                    <p className="text-sm text-gray-600 capitalize">
                      Status: {senderId.status}
                    </p>
                    {senderId.requested_at && (
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(senderId.requested_at).toLocaleDateString()}
                      </p>
                    )}
                    {senderId.reviewed_at && (
                      <p className="text-sm text-gray-500">
                        Reviewed: {new Date(senderId.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isAdminView && senderId.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id, status: 'approved' })}
                          className="btn btn-icon btn-ghost text-green-500"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id, status: 'rejected' })}
                          className="btn btn-icon btn-ghost text-red-500"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Confirmation Modal */}
      {reviewRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm Review</h2>
              <button onClick={() => setReviewRequest(null)}>
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <p>
              Are you sure you want to mark the sender ID "{senderIds.find((s) => s.request_id === reviewRequest.request_id)?.sender_id}" as{' '}
              {reviewRequest.status}?
            </p>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setReviewRequest(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => handleReviewSenderId(reviewRequest.request_id, reviewRequest.status)}
                className="btn btn-primary"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default SenderID;