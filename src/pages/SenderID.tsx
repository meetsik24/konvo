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
  const [charCount, setCharCount] = useState(0);
  const maxCharLimit = 11;

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
              is_approved: req.status === 'approved',
            }))
          : [];

        // Combine approved sender IDs and pending requests, filter based on view
        let allSenderIds = [...formattedApproved, ...formattedRequests];
        if (isAdmin && isAdminView) {
          allSenderIds = allSenderIds.filter((id) => id.status === 'pending');
        } else {
          allSenderIds = allSenderIds.filter((id) => id.user_id === (workspace?.user_id || '') || id.status === 'approved');
        }

        // Update state with fetched sender IDs
        setSenderIds(allSenderIds);
        // Update workspace with the new sender IDs
        updateWorkspace(currentWorkspaceId, { senderIds: allSenderIds });
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch sender IDs:', error);
        setError(error?.response?.data?.message || 'Opps!! You dont have any active sender id for now!');
        setSenderIds([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSenderIds();
  }, [currentWorkspaceId, isAdmin, isAdminView, workspace?.user_id, updateWorkspace]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trimStart(); // Prevent leading spaces
    setNewSenderId(trimmedValue);
    setCharCount(trimmedValue.length);
    
    if (trimmedValue.length > maxCharLimit) {
      setError(`Sender ID exceeds ${maxCharLimit} character limit.`);
    } else if (trimmedValue.length > 0) {
      setError(null);
    }
  };

  const handleRequestSenderId = async () => {
    if (!newSenderId.trim()) {
      setError('Sender ID name cannot be empty.');
      return;
    }
    if (newSenderId.length > maxCharLimit) {
      setError(`Sender ID exceeds ${maxCharLimit} character limit.`);
      return;
    }
    setIsLoading(true);
    try {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      const response = await requestSenderId(currentWorkspaceId, { sender_id: newSenderId.trim() });
      const newRequest: SenderId = {
        request_id: response.request_id || Date.now().toString(),
        user_id: response.user_id || workspace?.user_id || '',
        sender_id: newSenderId.trim(),
        name: newSenderId.trim(),
        status: 'pending',
        is_approved: false,
      };
      const updatedSenderIds = [...senderIds, newRequest];
      setSenderIds(updatedSenderIds);
      setNewSenderId('');
      setCharCount(0);
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: updatedSenderIds });
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
      const updatedSenderIds = senderIds.map((req) =>
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
      setSenderIds(updatedSenderIds);
      setReviewRequest(null);
      setError(null);
      updateWorkspace(currentWorkspaceId, { senderIds: updatedSenderIds });
    } catch (error: any) {
      console.error('Error reviewing sender ID request:', error);
      setError(error?.response?.data?.message || 'Failed to review sender ID request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 sm:space-y-6 px-4 sm:px-6"
    >
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
        <IdCard className="w-6 h-6 sm:w-8 sm:h-8 text-[#00333e]" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#00333e]">Sender IDs</h1>
        {isAdmin && (
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="ml-auto text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#005a6e] text-white rounded-lg hover:bg-[#00333e] transition-colors duration-200"
          >
            {isAdminView ? 'User View' : 'Admin View'}
          </button>
        )}
      </div>

      {error && <div className="text-red-400 mb-3 sm:mb-4 text-xs sm:text-sm">{error}</div>}

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#fddf0d] mx-auto" />
          <p className="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-sm">Loading sender IDs...</p>
        </div>
      )}

      {!isLoading && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#00333e]">Request New Sender ID</h2>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className={`w-full text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 border ${
                  charCount > maxCharLimit ? 'border-red-400' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d] focus:border-transparent`}
                placeholder="Enter sender ID name (e.g., CompanyName)"
                value={newSenderId}
                onChange={(e) => handleInputChange(e.target.value)}
                maxLength={maxCharLimit}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">
                {charCount}/{maxCharLimit}
              </div>
            </div>
            <button
              onClick={handleRequestSenderId}
              disabled={charCount > maxCharLimit || charCount === 0}
              className={`flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-colors duration-200 ${
                charCount > maxCharLimit || charCount === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00333e] text-white hover:bg-[#005a6e]'
              }`}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              Request
            </button>
          </div>
          {charCount > 0 && charCount <= maxCharLimit && (
            <p className="text-green-500 text-xs sm:text-sm mt-2">Sender ID is available (within {maxCharLimit} characters).</p>
          )}
          {charCount > maxCharLimit && (
            <p className="text-red-500 text-xs sm:text-sm mt-2">
              Sender ID is not available. It exceeds the {maxCharLimit} character limit.
            </p>
          )}
        </div>
      )}

      {!isLoading && (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md w-full">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-[#00333e]">
            {isAdminView ? 'Pending Sender ID Requests' : 'My Sender IDs'}
          </h2>
          {senderIds.length === 0 ? (
            <p className="text-gray-500 text-xs sm:text-sm">No sender IDs or requests available.</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.request_id || senderId.sender_id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50"
                >
                  <div className="mb-2 sm:mb-0">
                    <h3 className="font-medium text-sm sm:text-base text-[#00333e]">{senderId.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Sender ID: {senderId.sender_id}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 capitalize">
                      Status: {senderId.status || 'approved'}
                    </p>
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    {isAdminView && senderId.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'approved' })}
                          className="p-2 rounded-full text-green-500 hover:bg-green-100 transition-colors duration-200"
                        >
                          <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'rejected' })}
                          className="p-2 rounded-full text-red-500 hover:bg-red-100 transition-colors duration-200"
                        >
                          <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
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
          <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-[#00333e]">Confirm Review</h2>
              <button onClick={() => setReviewRequest(null)} className="text-gray-500 hover:text-gray-700">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Are you sure you want to mark the sender ID "{senderIds.find((s) => s.request_id === reviewRequest.request_id)?.name}" as{' '}
              {reviewRequest.status}?
            </p>
            <div className="flex justify-end gap-2 sm:gap-3 mt-3 sm:mt-4">
              <button
                onClick={() => setReviewRequest(null)}
                className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReviewSenderId(reviewRequest.request_id, reviewRequest.status)}
                className="text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 bg-[#00333e] text-white rounded-lg hover:bg-[#005a6e] transition-colors duration-200"
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