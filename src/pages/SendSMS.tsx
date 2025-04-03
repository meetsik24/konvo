import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, CheckCircle, Upload, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  getCampaignGroups,
  getContacts,
  getGroupContacts,
  getApprovedSenderIds,
  sendInstantMessage,
  getMessageLogs,
  getWorkspaceGroups,
  generateMessage, // Import the new API function
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

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [validGroups, setValidGroups] = useState<Group[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  const [selectedSenderId, setSelectedSenderId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [sendMode, setSendMode] = useState<'contacts' | 'campaign'>('contacts');
  const [manualContacts, setManualContacts] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [uploadedContacts, setUploadedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useFallbackSenderIds, setUseFallbackSenderIds] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  // Fetch data on mount or workspace change
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
        } catch {
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

        // Fetch contacts
        const contactsData = await getContacts(currentWorkspaceId);
        const formattedContacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
        setContacts(formattedContacts);

        // Fetch workspace groups
        const workspaceGroups = await getWorkspaceGroups(currentWorkspaceId);
        setValidGroups(Array.isArray(workspaceGroups) ? workspaceGroups : workspaceGroups?.data || []);

        // Fetch campaign groups
        const campaignGroupsData: { [key: string]: Group[] } = {};
        for (const campaign of formattedCampaigns) {
          try {
            const groups = await getCampaignGroups(campaign.campaign_id);
            const formattedGroups = Array.isArray(groups) ? groups : groups?.data || [];
            const validCampaignGroups = formattedGroups.filter((group: Group) =>
              validGroups.some((validGroup: Group) => validGroup.group_id === group.group_id)
            );
            campaignGroupsData[campaign.campaign_id] = validCampaignGroups;
          } catch (groupError) {
            campaignGroupsData[campaign.campaign_id] = [];
          }
        }
        setCampaignGroups(campaignGroupsData);

        // Fetch message logs
        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        if (!useFallbackSenderIds) {
          setError(null);
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch data.';
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

  // Generate AI message using the new API endpoint
  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords to generate a message.');
      return;
    }
    setIsGenerating(true);
    try {
      // Prepare the prompt from keywords
      const prompt = `Generate an SMS message based on the following keywords: ${keywords}`;
      const response = await generateMessage(prompt);

      // Assuming the API returns a JSON object with a 'message' field containing the generated SMS
      // Adjust this based on the actual API response format
      const generatedMessage = response.message || response.text || response;
      if (typeof generatedMessage !== 'string') {
        throw new Error('Invalid response format from message generation API');
      }

      setMessage(generatedMessage);
      setError(null);
      setIsAIModalOpen(false);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to generate AI message.';
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
        .filter(Boolean);
      setUploadedContacts(phoneNumbers);
      setManualContacts((prev) => (prev ? `${prev}\n${phoneNumbers.join('\n')}` : phoneNumbers.join('\n')));
      setIsImportModalOpen(false);
    };
    reader.readAsText(file);
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

      setMessage('');
      setSchedule('');
      setIsSchedulingEnabled(false);
      setSelectedCampaignId('');
      setManualContacts('');
      setSelectedGroups([]);
      setUploadedContacts([]);
      setKeywords('');
      setError(null);

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

  // Get recipients for campaign mode
  const getCampaignRecipients = async (): Promise<string[]> => {
    const selectedCampaign = campaigns.find((c) => c.campaign_id === selectedCampaignId);
    if (!selectedCampaign) {
      throw new Error('Selected campaign not found.');
    }
    const groups = campaignGroups[selectedCampaignId] || [];
    if (groups.length === 0) {
      throw new Error('No groups assigned to this campaign.');
    }

    const recipientPhones: string[] = [];
    for (const group of groups) {
      if (!group.group_id) continue;
      if (!currentWorkspaceId) throw new Error('Workspace ID is null.');
      try {
        const groupContacts = await getGroupContacts(currentWorkspaceId, group.group_id);
        const contacts = Array.isArray(groupContacts) ? groupContacts : [];
        const phoneNumbers = contacts.map((contact: Contact) => contact.phone_number).filter(Boolean);
        recipientPhones.push(...phoneNumbers);
      } catch (error) {
        console.error(`Failed to fetch contacts for group ${group.group_id}:`, error);
      }
    }

    return [...new Set(recipientPhones)];
  };

  // Get recipients for contacts mode
  const getContactRecipients = async (): Promise<string[]> => {
    const recipientPhones: string[] = [];

    if (manualContacts.trim()) {
      const manualPhones = manualContacts
        .split(/[\n,]+/)
        .map((phone) => phone.trim())
        .filter(Boolean);
      recipientPhones.push(...manualPhones);
    }

    for (const groupId of selectedGroups) {
      if (!currentWorkspaceId) throw new Error('Workspace ID is null.');
      try {
        const groupContacts = await getGroupContacts(currentWorkspaceId, groupId);
        const contacts = Array.isArray(groupContacts) ? groupContacts : [];
        const phoneNumbers = contacts.map((contact: Contact) => contact.phone_number).filter(Boolean);
        recipientPhones.push(...phoneNumbers);
      } catch (error) {
        console.error(`Failed to fetch contacts for group ${groupId}:`, error);
      }
    }

    return [...new Set(recipientPhones)];
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
          <p className="text-sm">Ops!! Network issues! Please try again after some time!</p>
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
                <label className="block text-sm font-medium text-[#00333e] mb-1">
                  Sender ID
                </label>
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
                    <label className="block text-sm font-medium text-[#00333e] mb-1">
                      Campaign
                    </label>
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
                    <label className="block text-sm font-medium text-[#00333e] mb-1">
                      Recipient Groups
                    </label>
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
                            setIsScheduleModalOpen(true);
                          } else {
                            setSchedule('');
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-[#00333e]">
                        Schedule Message
                      </span>
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
                  <label className="block text-sm font-medium text-[#00333e] mb-1">
                    Contacts
                  </label>
                  <textarea
                    className="w-full min-h-[80px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    placeholder="Enter phone numbers (e.g., 255788344348)"
                    value={manualContacts}
                    onChange={(e) => setManualContacts(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsGroupModalOpen(true)}
                      className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] transition-colors"
                    >
                      Select Groups
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => setIsImportModalOpen(true)}
                      className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] transition-colors"
                    >
                      Import Contacts
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Message Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-[#00333e]">
                    Message
                  </label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setIsAIModalOpen(true)}
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
          {isAIModalOpen && (
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
                  <h3 className="text-lg font-bold text-[#00333e]">Generate AI Message</h3>
                  <button
                    onClick={() => setIsAIModalOpen(false)}
                    className="text-gray-500 hover:text-[#00333e] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#00333e] mb-1">
                    Keywords
                  </label>
                  <input
                    type="text"
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    placeholder="Enter keywords (e.g., sale, discount)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAIModalOpen(false)}
                    className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateAIMessage}
                    disabled={isGenerating}
                    className="px-3 py-1 text-sm font-medium bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] disabled:bg-[#00333e]/50"
                  >
                    {isGenerating ? 'Generating...' : 'Generate'}
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Import Contacts Modal */}
          {isImportModalOpen && (
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
                  <h3 className="text-lg font-bold text-[#00333e]">Import Contacts</h3>
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="text-gray-500 hover:text-[#00333e] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#00333e] mb-1">
                    Upload File
                  </label>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload a CSV or TXT file with phone numbers (one per line or comma-separated).
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Select Groups Modal */}
          {isGroupModalOpen && (
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
                  <h3 className="text-lg font-bold text-[#00333e]">Select Contact Groups</h3>
                  <button
                    onClick={() => setIsGroupModalOpen(false)}
                    className="text-gray-500 hover:text-[#00333e] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4 max-h-48 overflow-y-auto">
                  {validGroups.length > 0 ? (
                    validGroups.map((group) => (
                      <label key={group.group_id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          value={group.group_id}
                          checked={selectedGroups.includes(group.group_id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedGroups([...selectedGroups, group.group_id]);
                            } else {
                              setSelectedGroups(selectedGroups.filter((id) => id !== group.group_id));
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-[#00333e]">{group.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No groups available.</p>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsGroupModalOpen(false)}
                    className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Schedule Modal (Campaign Mode Only) */}
          {isScheduleModalOpen && (
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
                  <h3 className="text-lg font-bold text-[#00333e]">Schedule Message</h3>
                  <button
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="text-gray-500 hover:text-[#00333e] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-[#00333e] mb-1">
                    Select Date and Time
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setIsScheduleModalOpen(false);
                      setIsSchedulingEnabled(false);
                      setSchedule('');
                    }}
                    className="px-3 py-1 text-sm font-medium text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsScheduleModalOpen(false)}
                    className="px-3 py-1 text-sm font-medium bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}

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
                  <h3 className="text-lg font-semibold text-[#00333e]">
                    Total Recipients
                  </h3>
                  <p className="text-gray-600 text-sm">{contacts.length} contacts</p>
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
                  <h3 className="text-lg font-semibold text-[#00333e]">
                    Campaigns
                  </h3>
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
                  <h3 className="text-lg font-semibold text-[#00333e]">
                    Sender IDs
                  </h3>
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