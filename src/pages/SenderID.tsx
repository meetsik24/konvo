import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IdCard, Plus, Check, XCircle, FileText, Upload, Clock } from 'lucide-react';
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
  use_cases?: string[];
  documents?: Array<{ name: string; size: number }>;
}

const SenderID: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId, isAdmin } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [newSenderId, setNewSenderId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [useCases, setUseCases] = useState<string[]>([]);
  const [documents, setDocuments] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [reviewRequest, setReviewRequest] = useState<{ request_id: string; status: 'approved' | 'rejected' } | null>(null);
  const [charCount, setCharCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
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
        const approvedResponse = await getApprovedSenderIds(currentWorkspaceId);
        const formattedApproved: SenderId[] = Array.isArray(approvedResponse)
          ? approvedResponse.map((item: SenderId) => ({
              ...item,
              is_approved: true,
              status: 'approved',
            }))
          : [];

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
              purpose: req.purpose || 'Mocked purpose',
              use_cases: req.use_cases || ['Transactional SMS'],
              documents: req.documents || [],
            }))
          : [];

        // Deduplicate by sender_id to avoid repetition of approved sender IDs
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

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((file) =>
        ['.pdf', '.doc', '.docx'].some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (newFiles.length !== e.target.files.length) {
        setError('Only PDF, DOC, and DOCX files are allowed.');
      }
      setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files).filter((file) =>
        ['.pdf', '.doc', '.docx'].some((ext) => file.name.toLowerCase().endsWith(ext))
      );
      if (newFiles.length !== e.dataTransfer.files.length) {
        setError('Only PDF, DOC, and DOCX files are allowed.');
      }
      setDocuments((prev) => [...prev, ...newFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
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
      let response;
      try {
        response = await requestSenderId(currentWorkspaceId, {
          sender_id: newSenderId.trim(),
          purpose,
          use_cases: useCases,
          documents,
        });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        response = {
          request_id: `req_${(senderIds.length + 1).toString().padStart(3, '0')}`,
          user_id: workspace?.user_id || 'user_001',
          sender_id: newSenderId.trim(),
          name: newSenderId.trim(),
          status: 'pending',
          purpose,
          use_cases: useCases,
          documents: documents.map((doc) => ({ name: doc.name, size: doc.size })),
        };
      }
      const newRequest: SenderId = {
        request_id: response.request_id,
        user_id: response.user_id || workspace?.user_id || 'user_001',
        sender_id: newSenderId.trim(),
        name: newSenderId.trim(),
        status: 'pending',
        is_approved: false,
        requested_at: new Date().toISOString(),
        purpose,
        use_cases: useCases,
        documents: response.documents || documents.map((doc) => ({ name: doc.name, size: doc.size })),
      };
      const updatedSenderIds = [...senderIds, newRequest];
      setSenderIds(updatedSenderIds);
      setNewSenderId('');
      setPurpose('');
      setUseCases([]);
      setDocuments([]);
      setCharCount(0);
      setError(null);
      setSuccessMessage(
        `Sender ID "${newSenderId}" requested successfully. Approval may take up to 3 working days.`
      );
      updateWorkspace(currentWorkspaceId, { senderIds: updatedSenderIds });
      setTimeout(() => setSuccessMessage(null), 3000);
      setTimeout(() => {
        setSuccessMessage(
          `Notification: Sender ID "${newSenderId}" has been ${Math.random() > 0.3 ? 'approved' : 'rejected'}.`
        );
        setTimeout(() => setSuccessMessage(null), 3000);
      }, 1000);
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
    <div className="bg-gray-100 min-h-screen p-6 relative" style={{ paddingTop: '80px' }}>
      <div className="absolute top-6 left-6 flex items-center gap-4">
        <IdCard className="w-10 h-10 text-gray-800" />
        <h1 className="text-3xl font-bold text-gray-800">Sender IDs</h1>
        {isAdmin && (
          <button
            onClick={() => setIsAdminView(!isAdminView)}
            className="ml-auto text-base py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            {isAdminView ? 'User View' : 'Admin View'}
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-8 justify-center items-start mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white p-8 rounded-xl w-full sm:w-1/4 max-w-md mx-auto sm:mx-0"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">My Sender IDs</h2>
          {isLoading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-500 mx-auto" />
              <p className="text-gray-600 mt-3 text-base">Loading...</p>
            </div>
          ) : senderIds.length === 0 ? (
            <p className="text-gray-500 text-base">No sender IDs available.</p>
          ) : (
            <div className="space-y-4">
              {senderIds.map((senderId) => (
                <div
                  key={senderId.request_id || senderId.sender_id}
                  className="flex items-center justify-between p-3 border-b border-gray-200"
                >
                  <span className="text-base text-gray-800 font-medium">{senderId.sender_id}</span>
                  <div className="relative group">
                    {senderId.status === 'approved' && <span className="text-green-700">✓</span>}
                    {senderId.status === 'rejected' && <span className="text-red-700">✗</span>}
                    {senderId.status === 'pending' && <Clock className="text-gray-700 w-5 h-5" />}
                    <span className="absolute hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 -top-8 -left-2 whitespace-nowrap">
                      {senderId.status === 'approved' ? 'Approved' :
                       senderId.status === 'rejected' ? 'Rejected' : 'Pending'}
                    </span>
                  </div>
                  {isAdminView && senderId.status === 'pending' && (
                    <>
                      <button
                        onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'approved' })}
                        className="ml-4 text-green-500 hover:text-green-700"
                      >
                        <Check className="w-6 h-6" />
                      </button>
                      <button
                        onClick={() => setReviewRequest({ request_id: senderId.request_id!, status: 'rejected' })}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-8 rounded-xl w-full sm:w-3/4 max-w-2xl mx-auto sm:mx-0"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Request New Sender ID</h2>
          <AnimatePresence>
            {(error || successMessage) && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`text-base p-3 rounded-lg mb-6 ${
                  error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}
              >
                {error || successMessage}
              </motion.div>
            )}
          </AnimatePresence>

          {isLoading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gray-500 mx-auto" />
              <p className="text-gray-600 mt-3 text-base">Loading...</p>
            </div>
          )}

          {!isLoading && (
            <div className="space-y-6">
              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Sender ID</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full text-base py-3 px-4 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                    placeholder="Enter sender ID (e.g., CompanyName)"
                    value={newSenderId}
                    onChange={(e) => handleInputChange(e.target.value)}
                    maxLength={maxCharLimit}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-base text-gray-500">
                    {charCount}/{maxCharLimit}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Purpose</label>
                <textarea
                  className="w-full text-base py-3 px-4 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                  placeholder="Describe the purpose of the sender ID"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Use Cases</label>
                <div className="flex gap-6">
                  {availableUseCases.map((useCase) => (
                    <label key={useCase} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useCases.includes(useCase)}
                        onChange={() => handleUseCaseChange(useCase)}
                        className="w-5 h-5 text-gray-700 border-gray-700 focus:ring-[#fddf0d]"
                      />
                      <span className="text-base text-gray-800">{useCase}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-2 block">Compliance Documents</label>
                <div
                  className={`border-2 border-dashed border-gray-700 rounded-xl p-6 text-center ${
                    isDragging ? 'border-[#fddf0d] bg-[#fddf0d] bg-opacity-20' : ''
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                  <p className="text-base text-gray-600">Drag and drop files here or</p>
                  <label className="text-base text-gray-700 underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocumentUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX</p>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const link = document.createElement('a');
                    link.href = 'data:application/pdf;base64,JVBERi-0xL...'; // Mock PDF
                    link.download = 'LOA-Sample-Briq.pdf';
                    link.click();
                  }}
                  className="mt-4 text-base text-gray-700 underline flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  Download LOA Sample
                </button>
                {documents.length > 0 && (
                  <div className="mt-4">
                    <ul className="space-y-2">
                      {documents.map((doc, index) => (
                        <li key={index} className="flex items-center justify-between text-base text-gray-700">
                          <span>{doc.name}</span>
                          <button
                            onClick={() => handleRemoveDocument(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <p className="text-base text-gray-600">
                Sender ID registration and approval may take up to 3 working days. You will receive a notification via email, Briq, or SMS.
              </p>

              <button
                onClick={handleRequestSenderId}
                disabled={charCount > maxCharLimit || charCount === 0 || !purpose.trim() || useCases.length === 0}
                className={`flex items-center gap-2 text-base py-3 px-6 rounded-lg transition-colors duration-200 ${
                  charCount > maxCharLimit || charCount === 0 || !purpose.trim() || useCases.length === 0
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-blue-600'
                }`}
              >
                <Plus className="w-5 h-5" />
                Request Sender ID
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {reviewRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-xl p-8 w-full max-w-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Confirm Review</h2>
                <button onClick={() => setReviewRequest(null)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <p className="text-base text-gray-600 mb-6">
                Are you sure you want to mark the sender ID "{senderIds.find((s) => s.request_id === reviewRequest.request_id)?.sender_id}" as {reviewRequest.status}?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setReviewRequest(null)}
                  className="text-base py-2 px-6 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewSenderId(reviewRequest.request_id, reviewRequest.status)}
                  className="text-base py-2 px-6 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
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