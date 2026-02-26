import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, Plus, Check, XCircle, Clock } from 'lucide-react';
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
  purpose?: string;
  use_cases?: string;
}

const SenderID: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId, isAdmin } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [newSenderId, setNewSenderId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<{ request_id: string; status: 'approved' | 'rejected' } | null>(null);
  const [charCount, setCharCount] = useState(0);
  const maxCharLimit = 11;
  const availableUseCases = ['OTP', 'Transactional SMS', 'Promotions'];

  useEffect(() => {
    const fetchSenderIds = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      setIsLoading(true);
      try {
        const [approvedResponse, requestsResponse] = await Promise.all([
          getApprovedSenderIds(currentWorkspaceId),
          isAdmin && isAdminView
            ? getAdminSenderRequests(currentWorkspaceId)
            : getUserSenderRequests(currentWorkspaceId),
        ]);
        const formattedApproved: SenderId[] = Array.isArray(approvedResponse)
          ? approvedResponse.map((item: SenderId) => ({
              ...item,
              is_approved: true,
              status: 'approved',
            }))
          : [];
        const formattedRequests: SenderId[] = Array.isArray(requestsResponse)
          ? requestsResponse.map((req: SenderId) => ({
              request_id: req.request_id || '',
              user_id: req.user_id || '',
              sender_id: req.sender_id || req.name || '',
              name: req.name || req.sender_id || '',
              status: req.status || 'pending',
              is_approved: req.status === 'approved',
              purpose: req.purpose || 'Mocked purpose',
              use_cases: req.use_cases || 'Transactional SMS',
            }))
          : [];

        const uniqueSenderIds = [...formattedApproved, ...formattedRequests].reduce((acc, current) => {
          if (!acc.find((item) => item.sender_id === current.sender_id)) {
            acc.push(current);
          }
          return acc;
        }, [] as SenderId[]);

        if (isAdmin && isAdminView) {
          setSenderIds(uniqueSenderIds.filter((id) => id.status === 'pending'));
        } else {
          setSenderIds(uniqueSenderIds.filter((id) => id.user_id === (workspace?.user_id || '') || id.status === 'approved'));
        }

        updateWorkspace(currentWorkspaceId, { senderIds: uniqueSenderIds });
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch sender IDs:', error);
        setError(error?.response?.data?.message || 'No active sender IDs available.');
        setSenderIds([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSenderIds();
  }, [currentWorkspaceId, isAdmin, isAdminView, workspace?.user_id, updateWorkspace]);

  const handleInputChange = (value: string) => {
    const trimmedValue = value.trimStart();
    setNewSenderId(trimmedValue);
    setCharCount(trimmedValue.length);
    if (trimmedValue.length > maxCharLimit) {
      setError(`Sender ID exceeds ${maxCharLimit} character limit.`);
    } else if (trimmedValue.length > 0) {
      setError(null);
    }
  };

  const handleUseCaseChange = (useCase: string) => {
    setUseCases((prev) =>
      prev.includes(useCase)
        ? prev.filter((item) => item !== useCase)
        : [...prev, useCase]
    );
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
    if (!purpose.trim()) {
      setError('Purpose description cannot be empty.');
      return;
    }
    if (useCases.length === 0) {
      setError('At least one use case must be selected.');
      return;
    }
    if (senderIds.some((id) => id.sender_id === newSenderId.trim() && id.status !== 'rejected')) {
      setError('Sender ID already exists or is pending.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestSenderId(currentWorkspaceId, {
        sender_id: newSenderId.trim(),
        purpose,
        use_cases: useCases.join(','),
      });
      const newRequest: SenderId = {
        request_id: response.request_id,
        user_id: response.user_id || workspace?.user_id || 'user_001',
        sender_id: newSenderId.trim(),
        name: newSenderId.trim(),
        status: 'pending',
        is_approved: false,
        requested_at: new Date().toISOString(),
        purpose,
        use_cases: useCases.join(','),
      };
      const updatedSenderIds = [...senderIds, newRequest];
      setSenderIds(updatedSenderIds);
      setNewSenderId('');
      setPurpose('');
      setUseCases([]);
      setCharCount(0);
      setError(null);
      setSuccessMessage(
        `Sender ID "${newSenderId}" requested successfully. Approval may take up to 3 working days.`
      );
      updateWorkspace(currentWorkspaceId, { senderIds: updatedSenderIds });
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to request sender ID.');
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
      setError(error?.response?.data?.message || 'Failed to review sender ID request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#f5f5f5] min-h-screen p-6 font-inter">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <IdCard className="w-8 h-8 text-[#004d66]" />
          <h1 className="text-2xl font-semibold text-[#004d66]">Sender IDs</h1>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="bg-gray-200 text-[#004d66] hover:bg-[#FDD70D] hover:text-[#004d66] transition-colors rounded-md px-4 py-2 text-sm font-medium"
          >
            {isAdminView ? 'User View' : 'Admin View'}
          </button>
        )}
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-red-200 bg-red-50 pрати-3 text-red-700 text-sm font-medium rounded-md mb-6"
        >
          {error}
        </motion.div>
      )}

      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-green-200 bg-green-50 p-3 text-green-700 text-sm font-medium rounded-md mb-6"
        >
          {successMessage}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-md border border-gray-200 w-full lg:w-1/3"
        >
          <h2 className="text-lg font-semibold text-[#004d66] mb-4">My Sender IDs</h2>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <svg className="animate-spin h-6 w-6 text-[#004d66]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <p className="ml-3 text-[#004d66] text-sm">Loading...</p>
            </div>
          ) : senderIds.length === 0 ? (
            <p className="text-gray-500 text-sm">No sender IDs available.</p>
          ) : (
            <div className="space-y-3">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.request_id || senderId.sender_id}
                  className="flex items-center justify-between p-2 border-b border-gray-200"
                >
                  <span className="text-sm font-medium text-[#004d66]">{senderId.sender_id}</span>
                  <div className="flex items-center gap-2">
                    {senderId.status === 'approved' && <Check className="w-5 h-5 text-green-600" />}
                    {senderId.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
                    {senderId.status === 'pending' && <Clock className="w-5 h-5 text-[#004d66]" />}
                    {isAdminView && senderId.status === 'pending' && (
                      <>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'approved' })}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'rejected' })}
                          className="text-red-600 hover:text-red-800"
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
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-md border border-gray-200 w-full lg:w-2/3"
        >
          <h2 className="text-lg font-semibold text-[#004d66] mb-4">Request New Sender ID</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004d66] mb-1 block">Sender ID</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full text-sm py-2 px-3 border border-gray-200 rounded-md text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                  placeholder="Enter sender ID (e.g., CompanyName)"
                  value={newSenderId}
                  onChange={(e) => handleInputChange(e.target.value)}
                  maxLength={maxCharLimit}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  {charCount}/{maxCharLimit}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#004d66] mb-1 block">Purpose</label>
              <textarea
                className="w-full text-sm py-2 px-3 border border-gray-200 rounded-md text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors resize-none"
                placeholder="Describe the purpose of the sender ID"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={4}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-[#004d66] mb-1 block">Use Cases</label>
              <div className="flex flex-wrap gap-4">
                {availableUseCases.map((useCase) => (
                  <label key={useCase} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useCases.includes(useCase)}
                      onChange={() => handleUseCaseChange(useCase)}
                      className="w-4 h-4 text-[#004d66] border-gray-200 focus:ring-[#FDD70D] rounded"
                    />
                    <span className="text-sm text-[#004d66]">{useCase}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleRequestSenderId}
              disabled={charCount > maxCharLimit || charCount === 0 || !purpose.trim() || useCases.length === 0}
              className={`flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white hover:bg-[#FDD70D] hover:text-[#004d66] transition-colors rounded-md font-medium ${
                charCount > maxCharLimit || charCount === 0 || !purpose.trim() || useCases.length === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <Plus className="w-4 h-4" />
              Request Sender ID
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {reviewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 font-inter"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-md p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-[#004d66]">Confirm Review</h2>
                <button
                  onClick={() => setReviewRequest(null)}
                  className="text-[#004d66] hover:text-[#FDD70D]"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#004d66] mb-4">
                Are you sure you want to mark the sender ID "{senderIds.find((s) => s.request_id === reviewRequest.request_id)?.sender_id}" as {reviewRequest.status}?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setReviewRequest(null)}
                  className="text-sm py-2 px-4 bg-gray-200 text-[#004d66] hover:bg-[#FDD70D] hover:text-[#004d66] transition-colors rounded-md font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewSenderId(reviewRequest.request_id, reviewRequest.status)}
                  className="text-sm py-2 px-4 bg-[#00333e] text-white hover:bg-[#FDD70D] hover:text-[#004d66] transition-colors rounded-md font-medium"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SenderID;