import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, CheckCircle, Upload, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  getCampaignGroups,
  getApprovedSenderIds,
  sendInstantMessage,
  getMessageLogs,
  getWorkspaceGroups,
  generateMessage,
  getContacts,
  getGroupContacts,
} from '../services/api';

// Define interfaces for type safety
interface Campaign {
  campaign_id: string;
  workspace_id: string;
  name: string;
  description: string;
  launch_date: string;
  created_by: string;
  created_at: string;
}

interface Group {
  group_id: string;
  name: string;
  workspace_id?: string;
}

interface Contact {
  contact_id: string;
  name: string;
  phone_number: string;
  email?: string;
  group_ids?: string[];
}

interface MessageLog {
  id?: string;
  message?: string;
  status?: string;
  timestamp?: string;
}

interface SenderId {
  sender_id: string;
  user_id: string;
  is_approved: boolean;
  approved_at?: string;
  name: string;
  created_at: string;
}

// Fallback sender IDs in case API fails
const FALLBACK_SENDER_IDS: SenderId[] = [
  {
    sender_id: 'default_sender',
    name: 'Default Sender',
    user_id: 'default_user',
    is_approved: true,
    created_at: new Date().toISOString(),
  },
];

// Generic Modal Component to reduce redundancy
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
  cancelText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
  cancelText = 'Cancel',
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-sm p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#00333e]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#00333e] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            {cancelText}
          </motion.button>
          {onSubmit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubmit}
              className="px-3 py-1 text-sm font-medium bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
            >
              {submitText}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [validGroups, setValidGroups] = useState<Group[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedSenderId, setSelectedSenderId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [modalState, setModalState] = useState({
    isScheduleModalOpen: false,
    isAIModalOpen: false,
    isImportModalOpen: false,
    isGroupModalOpen: false,
  });
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [sendMode, setSendMode] = useState<'contacts' | 'campaign'>('contacts');
  const [manualContacts, setManualContacts] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [uploadedContacts, setUploadedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useFallbackSenderIds, setUseFallbackSenderIds] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Cache for group contacts to avoid redundant API calls
  const contactCache = useRef<Map<string, Contact[]>>(new Map());

  // Fetch all contacts with pagination support (similar to Contacts component)
  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string) => {
      const perPage = 50;
      let allContacts: Contact[] = [];
      let totalPages = 1;

      try {
        const firstResponse = groupId
          ? await getGroupContacts(workspaceId, groupId, 1, perPage)
          : await getContacts(workspaceId, 1, perPage);
        allContacts = firstResponse.contacts || [];
        totalPages = firstResponse.total_pages || 1;

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) =>
            groupId
              ? getGroupContacts(workspaceId, groupId, i + 2, perPage)
              : getContacts(workspaceId, i + 2, perPage)
          );
          const responses = await Promise.all(pageRequests);
          allContacts = [...allContacts, ...responses.flatMap((res) => res.contacts || [])];
        }
        return allContacts;
      } catch (error: any) {
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
    },
    []
  );

  // Fetch initial data (campaigns, groups, sender IDs, message logs)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!currentWorkspaceId) {
          setError('No workspace selected.');
          return;
        }

        // Fetch approved sender IDs
        try {
          const response = await getApprovedSenderIds(currentWorkspaceId);
          let approvedSenderIds: SenderId[] = [];

          if (Array.isArray(response)) {
            approvedSenderIds = response
              .filter((sender) => sender.is_approved === true)
              .map((sender) => ({
                sender_id: sender.sender_id,
                user_id: sender.user_id,
                is_approved: sender.is_approved,
                approved_at: sender.approved_at,
                name: sender.name || sender.sender_id,
                created_at: sender.created_at || new Date().toISOString(),
              }));
          } else if (response?.data && Array.isArray(response.data)) {
            approvedSenderIds = response.data
              .filter((sender) => sender.is_approved === true)
              .map((sender: any) => ({
                sender_id: sender.sender_id,
                user_id: sender.user_id,
                is_approved: sender.is_approved,
                approved_at: sender.approved_at,
                name: sender.name || sender.sender_id,
                created_at: sender.created_at,
              }));
          } else if (
            response &&
            typeof response === 'object' &&
            response.sender_id &&
            response.is_approved === true
          ) {
            approvedSenderIds = [
              {
                sender_id: response.sender_id,
                user_id: response.user_id,
                is_approved: response.is_approved,
                approved_at: response.approved_at,
                name: response.name || response.sender_id,
                created_at: response.created_at,
              },
            ];
          } else {
            throw new Error('Invalid sender IDs response format');
          }

          setSenderIds(approvedSenderIds);
          setUseFallbackSenderIds(false);

          if (approvedSenderIds.length > 0) {
            setSelectedSenderId(approvedSenderIds[0].sender_id);
          } else {
            setSelectedSenderId('');
            setError('No approved sender IDs available');
          }
        } catch (senderIdError) {
          setSenderIds(FALLBACK_SENDER_IDS);
          setUseFallbackSenderIds(true);
          setSelectedSenderId(FALLBACK_SENDER_IDS[0].sender_id);
          setError('Warning: Using fallback sender IDs due to API error');
        }

        // Fetch campaigns
        const campaignsData = await getCampaigns();
        const formattedCampaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.data || [];
        setCampaigns(
          formattedCampaigns.filter((campaign: Campaign) => campaign.workspace_id === currentWorkspaceId)
        );

        // Fetch workspace groups
        const workspaceGroups = await getWorkspaceGroups(currentWorkspaceId);
        setValidGroups(Array.isArray(workspaceGroups) ? workspaceGroups : workspaceGroups?.data || []);

        // Fetch message logs
        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        if (!useFallbackSenderIds) {
          setError(null);
        }
      } catch (err: any) {
        const message = err.message || 'Failed to fetch data.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspaceId]);

  // Refresh campaign groups when the selected campaign changes
  useEffect(() => {
    const fetchCampaignGroups = async () => {
      if (!selectedCampaignId) return;
      try {
        const groups = await getCampaignGroups(selectedCampaignId);
        const formattedGroups = Array.isArray(groups) ? groups : groups?.data || [];
        const validCampaignGroups = formattedGroups.filter((group: Group) =>
          validGroups.some((validGroup: Group) => validGroup.group_id === group.group_id)
        );
        setCampaignGroups((prev) => ({
          ...prev,
          [selectedCampaignId]: validCampaignGroups,
        }));
      } catch (error) {
        setCampaignGroups((prev) => ({
          ...prev,
          [selectedCampaignId]: [],
        }));
        setError('Failed to fetch groups for the selected campaign.');
      }
    };
    fetchCampaignGroups();
  }, [selectedCampaignId, validGroups]);

  // Consolidated function to fetch recipients from groups with caching and validation
  const fetchRecipientsFromGroups = useCallback(
    async (groupIds: string[]): Promise<string[]> => {
      if (!currentWorkspaceId) throw new Error('Workspace ID is null.');

      const recipientPhones: string[] = [];
      const failedGroups: string[] = [];

      for (const groupId of groupIds) {
        // Check cache first
        if (contactCache.current.has(groupId)) {
          const cachedContacts = contactCache.current.get(groupId)!;
          const phoneNumbers = cachedContacts
            .map((contact: Contact) => contact.phone_number)
            .filter((phone): phone is string => {
              const trimmedPhone = phone?.trim();
              return !!trimmedPhone && /^\+?\d{10,15}$/.test(trimmedPhone); // Basic phone number validation
            });
          recipientPhones.push(...phoneNumbers);
          continue;
        }

        try {
          console.log(`Fetching contacts for group ${groupId} using fetchAllContacts`);
          const groupContacts = await fetchAllContacts(currentWorkspaceId, groupId);

          if (!Array.isArray(groupContacts)) {
            console.warn(`fetchAllContacts for group ${groupId} did not return an array. Received:`, groupContacts);
            failedGroups.push(groupId);
            continue;
          }

          // Cache the contacts
          contactCache.current.set(groupId, groupContacts);

          const phoneNumbers = groupContacts
            .map((contact: Contact) => contact.phone_number)
            .filter((phone): phone is string => {
              const trimmedPhone = phone?.trim();
              return !!trimmedPhone && /^\+?\d{10,15}$/.test(trimmedPhone); // Basic phone number validation
            });
          recipientPhones.push(...phoneNumbers);
          console.log(`Found ${phoneNumbers.length} contacts in group ${groupId}`);
        } catch (error: any) {
          console.error(`Failed to fetch contacts for group ${groupId}:`, error.message || error);
          failedGroups.push(groupId);
        }
      }

      if (failedGroups.length > 0) {
        throw new Error(`Failed to fetch contacts for groups: ${failedGroups.join(', ')}`);
      }

      return [...new Set(recipientPhones)]; // Deduplicate phone numbers
    },
    [currentWorkspaceId, fetchAllContacts]
  );

  // Get recipients for campaign mode
  const getCampaignRecipients = useCallback(async (): Promise<string[]> => {
    const selectedCampaign = campaigns.find((c) => c.campaign_id === selectedCampaignId);
    if (!selectedCampaign) {
      throw new Error('Selected campaign not found.');
    }

    const groups = campaignGroups[selectedCampaignId] || [];
    if (groups.length === 0) {
      throw new Error(`No groups assigned to campaign '${selectedCampaign.name}'. Please assign groups first.`);
    }

    const groupIds = groups
      .filter((group) => group.group_id)
      .map((group) => group.group_id);
    return fetchRecipientsFromGroups(groupIds);
  }, [campaigns, selectedCampaignId, campaignGroups, fetchRecipientsFromGroups]);

  // Get recipients for contacts mode
  const getContactRecipients = useCallback(async (): Promise<string[]> => {
    let recipientPhones: string[] = [];

    // Process manual contacts with validation
    if (manualContacts.trim()) {
      const manualPhones = manualContacts
        .split(/[\n,]+/)
        .map((phone) => phone.trim())
        .filter((phone): phone is string => {
          return !!phone && /^\+?\d{10,15}$/.test(phone); // Basic phone number validation
        });
      if (manualPhones.length === 0 && manualContacts.trim()) {
        throw new Error('No valid phone numbers provided in manual contacts.');
      }
      recipientPhones.push(...manualPhones);
      console.log('Added manual contacts:', manualPhones);
    }

    // Process selected groups
    if (selectedGroups.length > 0) {
      const groupPhones = await fetchRecipientsFromGroups(selectedGroups);
      recipientPhones.push(...groupPhones);
    }

    return [...new Set(recipientPhones)]; // Deduplicate phone numbers
  }, [manualContacts, selectedGroups, fetchRecipientsFromGroups]);

  // Generate AI message using the API endpoint
  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please provide prompts to generate SMS.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Generate an SMS message based on the prompts: ${keywords}`;
      console.log('Calling generateMessage with prompt:', prompt);

      const generatedMessage = await generateMessage(prompt);
      console.log('Generated message:', generatedMessage);

      setMessage(generatedMessage);
      setModalState((prev) => ({ ...prev, isAIModalOpen: false }));
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to generate AI message. Please try again.';
      console.error('Error generating AI message:', err);
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload for contacts
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const phoneNumbers = text
        .split(/[\n,]+/)
        .map((phone) => phone.trim())
        .filter((phone): phone is string => {
          return !!phone && /^\+?\d{10,15}$/.test(phone); // Basic phone number validation
        });
      setUploadedContacts(phoneNumbers);
      setManualContacts((prev) => (prev ? `${prev}\n${phoneNumbers.join('\n')}` : phoneNumbers.join('\n')));
      setModalState((prev) => ({ ...prev, isImportModalOpen: false }));
    };
    reader.readAsText(file);
  };

  // Handle group selection toggle
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  // Handle sending SMS
  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }
    if (!selectedSenderId) {
      setError('Please select a sender ID.');
      return;
    }
    if (sendMode === 'campaign' && !selectedCampaignId) {
      setError('Please select a campaign.');
      return;
    }
    if (sendMode === 'contacts' && !manualContacts.trim() && selectedGroups.length === 0) {
      setError('Please enter at least one contact phone number or select a group.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const recipientPhones = sendMode === 'campaign' ? await getCampaignRecipients() : await getContactRecipients();

      if (recipientPhones.length === 0) {
        throw new Error('No valid recipients found. Please ensure there are contacts available.');
      }

      await sendInstantMessage(currentWorkspaceId, {
        recipients: recipientPhones,
        content: message,
        sender_id: selectedSenderId,
      });

      // Clear cache after sending SMS to ensure fresh data on next fetch
      contactCache.current.clear();

      setMessage('');
      setSchedule('');
      setIsSchedulingEnabled(false);
      setSelectedCampaignId('');
      setManualContacts('');
      setSelectedGroups([]);
      setUploadedContacts([]);
      setKeywords('');

      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      const logsData = await getMessageLogs();
      setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS. Please check the recipients and try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Success Notification */}
      {showSuccessNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CheckCircle className="w-10 h-10" />
            </motion.div>
            <span className="text-lg font-semibold text-center">SMS Sent Successfully!</span>
            <p className="text-sm text-green-100 text-center">
              Your message has been sent to all recipients.
            </p>
          </div>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <MessageSquare className="w-6 h-6 text-[#00333e]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#00333e]">Send SMS</h1>
      </motion.div>

      {/* Warning and Error Messages */}
      {useFallbackSenderIds && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 border border-yellow-200 text-yellow-600 p-4 rounded-lg"
        >
          <p className="font-semibold text-sm">Warning</p>
          <p className="text-sm">Using fallback sender IDs due to API error.</p>
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
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
      {!isLoading && (
        <div className="space-y-6">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            {/* Tabs for Send Mode */}
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setSendMode('contacts')}
                className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
                  sendMode === 'contacts'
                    ? 'border-b-2 border-[#00333e] text-[#00333e]'
                    : 'text-gray-500 hover:text-[#00333e]'
                }`}
              >
                Instant SMS
              </button>
              <button
                onClick={() => setSendMode('campaign')}
                className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
                  sendMode === 'campaign'
                    ? 'border-b-2 border-[#00333e] text-[#00333e]'
                    : 'text-gray-500 hover:text-[#00333e]'
                }`}
              >
                Campaign SMS
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSendSMS} className="space-y-4">
              {/* Sender ID */}
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-1">Sender ID</label>
                <select
                  className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select Sender ID
                  </option>
                  {senderIds.length > 0 ? (
                    senderIds.map((sender) => (
                      <option key={sender.sender_id} value={sender.sender_id}>
                        {sender.name} ({sender.sender_id})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>
                      No approved sender IDs
                    </option>
                  )}
                </select>
              </div>

              {/* Campaign Mode */}
              {sendMode === 'campaign' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign</label>
                    <select
                      className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select a campaign
                      </option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.campaign_id} value={campaign.campaign_id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#00333e] mb-1">Recipient Groups</label>
                    <div className="text-sm text-gray-600">
                      {campaignGroups[selectedCampaignId]?.length > 0 ? (
                        campaignGroups[selectedCampaignId].map((group) => (
                          <span
                            key={group.group_id}
                            className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2 mb-2"
                          >
                            {group.name}
                          </span>
                        ))
                      ) : (
                        <span>No groups assigned.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSchedulingEnabled}
                        onChange={(e) => {
                          setIsSchedulingEnabled(e.target.checked);
                          if (e.target.checked) {
                            setModalState((prev) => ({ ...prev, isScheduleModalOpen: true }));
                          } else {
                            setSchedule('');
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-[#00333e]">Schedule Message</span>
                    </label>
                    {isSchedulingEnabled && schedule && (
                      <p className="text-sm text-gray-600 mt-1">
                        Scheduled for: {new Date(schedule).toLocaleString()}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Contacts Mode */}
              {sendMode === 'contacts' && (
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-1">Contacts</label>
                  <textarea
                    className="w-full min-h-[80px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    placeholder="Enter phone numbers (e.g., +255788344348, one per line or comma-separated)"
                    value={manualContacts}
                    onChange={(e) => setManualContacts(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setModalState((prev) => ({ ...prev, isGroupModalOpen: true }))}
                      className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] transition-colors"
                    >
                      Select Groups
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setModalState((prev) => ({ ...prev, isImportModalOpen: true }))}
                      className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] transition-colors"
                    >
                      Import Contacts
                    </motion.button>
                  </div>
                  {/* Display selected groups */}
                  {selectedGroups.length > 0 && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-[#00333e] mb-1">
                        Selected Groups
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroups.map((groupId) => {
                          const group = validGroups.find((g) => g.group_id === groupId);
                          return group ? (
                            <span
                              key={groupId}
                              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg"
                            >
                              {group.name}
                              <button
                                onClick={() => toggleGroupSelection(groupId)}
                                className="text-gray-500 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[#00333e]">Message</label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setModalState((prev) => ({ ...prev, isAIModalOpen: true }))}
                    className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] transition-colors flex items-center gap-1"
                  >
                    <Bot className="w-4 h-4" />
                    Generate with AI
                  </motion.button>
                </div>
                <textarea
                  className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <div className="mt-1 flex justify-between text-sm text-gray-500">
                  <span>{message.length} characters</span>
                  <span>{Math.ceil(message.length / 160)} message(s)</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSending || senderIds.length === 0}
                  className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-colors disabled:bg-[#00333e]/50"
                >
                  <Send className="w-5 h-5" />
                  {isSending ? 'Sending...' : 'Send SMS'}
                </motion.button>
              </div>
            </form>
          </motion.div>

          {/* AI Modal */}
          <Modal
            isOpen={modalState.isAIModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isAIModalOpen: false }))}
            title="Generate AI Message"
            onSubmit={generateAIMessage}
            submitText={isGenerating ? 'Generating...' : 'Generate'}
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Prompt</label>
            <input
              type="text"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              placeholder="Write a prompt to generate SMS with AI"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </Modal>

          {/* Import Contacts Modal */}
          <Modal
            isOpen={modalState.isImportModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isImportModalOpen: false }))}
            title="Import Contacts"
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Upload File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV or TXT file with phone numbers (one per line or comma-separated).
            </p>
          </Modal>

          {/* Select Groups Modal */}
          <Modal
            isOpen={modalState.isGroupModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isGroupModalOpen: false }))}
            title="Select Contact Groups"
          >
            <div className="max-h-48 overflow-y-auto">
              {validGroups.length > 0 ? (
                validGroups.map((group) => (
                  <label key={group.group_id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      value={group.group_id}
                      checked={selectedGroups.includes(group.group_id)}
                      onChange={() => toggleGroupSelection(group.group_id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-[#00333e]">{group.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-sm text-gray-500">No groups available.</p>
              )}
            </div>
          </Modal>

          {/* Schedule Modal (Campaign Mode Only) */}
          <Modal
            isOpen={modalState.isScheduleModalOpen}
            onClose={() => {
              setModalState((prev) => ({ ...prev, isScheduleModalOpen: false }));
              setIsSchedulingEnabled(false);
              setSchedule('');
            }}
            title="Schedule Message"
            onSubmit={() => setModalState((prev) => ({ ...prev, isScheduleModalOpen: false }))}
            submitText="Confirm"
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Select Date and Time</label>
            <input
              type="datetime-local"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              required
            />
          </Modal>

          {/* SMS Logs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-[#00333e] mb-4">Sent SMS Logs</h2>
            {messageLogs.length === 0 ? (
              <p className="text-gray-500 text-sm">No SMS logs available.</p>
            ) : (
              <div className="space-y-3">
                {messageLogs.map((log) => (
                  <motion.div
                    key={log.id || log.timestamp}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <p className="text-sm text-[#00333e]">
                      <span className="font-medium">Message:</span> {log.message || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Status:</span> {log.status || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Timestamp:</span>{' '}
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Total Groups</h3>
                  <p className="text-gray-600 text-sm">{validGroups.length} groups</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Campaigns</h3>
                  <p className="text-gray-600 text-sm">{campaigns.length} campaigns</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="bg-white rounded-xl shadow-md p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <BarChart2 className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Sender IDs</h3>
                  <p className="text-gray-600 text-sm">{senderIds.length} approved</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SendSMS;