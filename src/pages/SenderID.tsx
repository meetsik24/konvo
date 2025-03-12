import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IdCard, Plus, Check, XCircle } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  requestSenderId,
  getUserSenderRequests,
  getAdminSenderRequests,
  reviewSenderIdRequest,
  getApprovedSenderIds,
} from '../services/api';

interface SenderId {
  sender_id: string;
  user_id: string;
  is_approved: boolean;
  approved_at?: string;
  name: string;
  created_at?: string;
  request_id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requested_at?: string;
  reviewed_at?: string;
}

const SenderID: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId, isAdmin } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [senderIds, setSenderIds] = useState<SenderId[]>(workspace?.senderIds || []);
  const [newSenderId, setNewSenderId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<{ request_id: string; status: 'approved' | 'rejected' } | null>(null);

  // Sync with current workspace data
  useEffect(() => {
    setSenderIds(workspace?.senderIds || []);
    setError(null);
  }, [currentWorkspaceId, workspace]);

  // Fetch sender IDs (approved and pending)
  useEffect(() => {
    const fetchSenderIds = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      setIsLoading(true);
      try {
        // Fetch approved sender IDs
        const approvedResponse = await getApprovedSenderIds(currentWorkspaceId);
        const formattedApproved: SenderId[] = Array.isArray(approvedResponse)
          ? approvedResponse.map((item: SenderId) => ({
              ...item,
              is_approved: true,
              status: 'approved',
            }))
          : [];

        // Fetch pending requests based on user role and view
        const requestsResponse = isAdmin && isAdminView
          ? await getAdminSenderRequests(currentWorkspaceId)
          : await getUserSenderRequests(currentWorkspaceId);
        const formattedRequests: SenderId[] = Array.isArray(requestsResponse)
          ? requestsResponse.map((req: SenderId) => ({
              request_id: req.request_id || '',
              user_id: req.user_id || '',
              sender_id: req.sender_id || req.name || '',
              name: req.name || req.sender_id || '',
              status: req.status || 'pending',
              requested_at: req.requested_at,
              reviewed_at: req.reviewed_at,
              is_approved: req.status === 'approved',
              approved_at: req.reviewed_at && req.status === 'approved' ? req.reviewed_at : undefined,
              created_at: req.created_at || req.requested_at,
            }))
          : [];

        // Combine approved sender IDs and pending requests, filter based on view
        let allSenderIds = [...formattedApproved, ...formattedRequests];
        if (isAdmin && isAdminView) {
          allSenderIds = allSenderIds.filter((id) => id.status === 'pending');
        } else {
          allSenderIds = allSenderIds.filter((id) => id.user_id === (workspace?.user_id || '') || id.status === 'approved');
        }

        setSenderIds(allSenderIds);
        updateWorkspace(currentWorkspaceId, { senderIds: allSenderIds });
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch sender IDs:', error);
        setError(error?.response?.data?.message || 'Unable to fetch sender ID requests from the server.');
        setSenderIds([]); // Clear sender IDs on error, no mock data
      } finally {
        setIsLoading(false);
      }
    };
    fetchSenderIds();
  }, [currentWorkspaceId, updateWorkspace, isAdmin, isAdminView, workspace]);

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
      const newRequest: SenderId = {
        request_id: response.request_id || Date.now().toString(),
        user_id: response.user_id || workspace?.user_id || '',
        sender_id: newSenderId.trim(),
        name: newSenderId.trim(),
        status: 'pending',
        requested_at: response.requested_at || new Date().toISOString(),
        reviewed_at: response.reviewed_at,
        is_approved: false,
        created_at: response.created_at || new Date().toISOString(),
      };
      setSenderIds([...senderIds, newRequest]);
      setNewSenderId('');
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: [...senderIds, newRequest] });
    } catch (error: any) {
      console.error('Error requesting sender ID:', error);
      setError(error?.response?.data?.message || 'Failed to request sender ID. Please try again.');
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
        req.request_id === requestId
          ? {
              ...req,
              status,
              reviewed_at: new Date().toISOString(),
              is_approved: status === 'approved',
              approved_at: status === 'approved' ? new Date().toISOString() : undefined,
            }
          : req
      );
      setSenderIds(updatedRequests);
      setReviewRequest(null);
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: updatedRequests });
    } catch (error: any) {
      console.error('Error reviewing sender ID request:', error);
      setError(error?.response?.data?.message || 'Failed to review sender ID request.');
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

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading sender IDs...</p>
        </div>
      )}

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

      {!isLoading && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isAdminView ? 'Pending Sender ID Requests' : 'My Sender IDs'}
          </h2>
          {senderIds.length === 0 ? (
            <p className="text-gray-500">No sender IDs or requests available.</p>
          ) : (
            <div className="space-y-4">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.request_id || senderId.sender_id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-medium">{senderId.name}</h3>
                    <p className="text-sm text-gray-600">
                      Sender ID: {senderId.sender_id}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">
                      Status: {senderId.status || 'approved'}
                    </p>
                    {senderId.created_at && (
                      <p className="text-sm text-gray-500">
                        Created: {new Date(senderId.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {senderId.requested_at && (
                      <p className="text-sm text-gray-500">
                        Requested: {new Date(senderId.requested_at).toLocaleDateString()}
                      </p>
                    )}
                    {senderId.approved_at && (
                      <p className="text-sm text-gray-500">
                        Approved: {new Date(senderId.approved_at).toLocaleDateString()}
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
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'approved' })}
                          className="btn btn-icon btn-ghost text-green-500"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'rejected' })}
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
              Are you sure you want to mark the sender ID "{senderIds.find((s) => s.request_id === reviewRequest.request_id)?.name}" as{' '}
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