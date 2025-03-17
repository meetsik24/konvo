import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, CheckCircle } from 'lucide-react';
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
    created_at: new Date().toISOString()
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
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [sendMode, setSendMode] = useState<'campaign' | 'contacts'>('campaign');
  const [manualContacts, setManualContacts] = useState('');
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

        console.log(`Fetching data for workspace ID: ${currentWorkspaceId}`);

        // Fetch approved sender IDs
        try {
          console.log(`Fetching sender IDs for workspace: ${currentWorkspaceId}`);
          const response = await getApprovedSenderIds(currentWorkspaceId);
          console.log('Sender IDs API response:', response);

          let approvedSenderIds: SenderId[] = [];

          // Handle array response
          if (Array.isArray(response)) {
            approvedSenderIds = response
              .filter(sender => sender.is_approved === true)
              .map((sender) => ({
                sender_id: sender.sender_id,
                user_id: sender.user_id,
                is_approved: sender.is_approved,
                approved_at: sender.approved_at,
                name: sender.name || sender.sender_id,
                created_at: sender.created_at,
              }));
          }
          // Handle nested data array response
          else if (response?.data && Array.isArray(response.data)) {
            approvedSenderIds = response.data
              .filter(sender => sender.is_approved === true)
              .map((sender: any) => ({
                sender_id: sender.sender_id,
                user_id: sender.user_id,
                is_approved: sender.is_approved,
                approved_at: sender.approved_at,
                name: sender.name || sender.sender_id,
                created_at: sender.created_at,
              }));
          }
          // Handle single object response
          else if (response && typeof response === 'object' && response.sender_id && response.is_approved === true) {
            approvedSenderIds = [{
              sender_id: response.sender_id,
              user_id: response.user_id,
              is_approved: response.is_approved,
              approved_at: response.approved_at,
              name: response.name || response.sender_id,
              created_at: response.created_at,
            }];
          } else {
            console.error('Unexpected sender IDs response format:', response);
            throw new Error('Invalid sender IDs response format');
          }

          console.log('Processed Approved Sender IDs:', approvedSenderIds);
          setSenderIds(approvedSenderIds);
          setUseFallbackSenderIds(false);

          if (approvedSenderIds.length > 0) {
            setSelectedSenderId(approvedSenderIds[0].sender_id);
          } else {
            setSelectedSenderId('');
            setError('No approved sender IDs available');
          }
        } catch (senderIdError) {
          console.error('Failed to fetch sender IDs, using fallback data:', senderIdError);
          setSenderIds(FALLBACK_SENDER_IDS);
          setUseFallbackSenderIds(true);
          setSelectedSenderId(FALLBACK_SENDER_IDS[0].sender_id);
          setError('Warning: Using fallback sender IDs due to API error');
        }

        // Fetch campaigns
        const campaignsData = await getCampaigns();
        console.log('Campaigns Data:', campaignsData);
        const formattedCampaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.data || [];
        setCampaigns(formattedCampaigns.filter((campaign: Campaign) => campaign.workspace_id === currentWorkspaceId));

        // Fetch contacts
        const contactsData = await getContacts(currentWorkspaceId);
        console.log('Contacts Data:', contactsData);
        const formattedContacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
        setContacts(formattedContacts);

        // Fetch workspace groups to validate campaign groups
        const workspaceGroups = await getWorkspaceGroups(currentWorkspaceId);
        console.log('Workspace Groups:', workspaceGroups);
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
            console.error(`Failed to fetch groups for campaign ${campaign.campaign_id}:`, groupError);
            campaignGroupsData[campaign.campaign_id] = [];
          }
        }
        setCampaignGroups(campaignGroupsData);
        console.log('Campaign Groups Data:', campaignGroupsData);

        // Fetch message logs
        const logsData = await getMessageLogs();
        console.log('Message Logs Data:', logsData);
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        if (!useFallbackSenderIds) {
          setError(null);
        }
      } catch (err: any) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch data.';
        console.error('Fetch error:', message);
        console.error('Error details:', err);
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
        console.log(`Refreshed groups for campaign ${selectedCampaignId}:`, validCampaignGroups);
        setCampaignGroups((prev) => ({
          ...prev,
          [selectedCampaignId]: validCampaignGroups,
        }));
      } catch (error) {
        console.error(`Failed to refresh groups for campaign ${selectedCampaignId}:`, error);
        setCampaignGroups((prev) => ({
          ...prev,
          [selectedCampaignId]: [],
        }));
        setError('Failed to fetch groups for the selected campaign.');
      }
    };
    fetchCampaignGroups();
  }, [selectedCampaignId, validGroups]);

  // Generate AI message
  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please enter keywords to generate a message.');
      return;
    }
    setIsGenerating(true);
    try {
      const keywordsArray = keywords.split(',').map((k) => k.trim()).filter(Boolean);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const aiMessage = `Hello! This is regarding ${keywordsArray.join(' and ')}. How can we assist you today?`;
      setMessage(aiMessage);
      setError(null);
    } catch (err) {
      setError('Failed to generate AI message.');
    } finally {
      setIsGenerating(false);
    }
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
    if (sendMode === 'contacts' && !manualContacts.trim()) {
      setError('Please enter at least one contact phone number.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    setIsSending(true);
    try {
      const recipientPhones = sendMode === 'campaign' ? await getCampaignRecipients() : getManualRecipients();

      if (recipientPhones.length === 0) {
        throw new Error('No valid recipients found. Please ensure the campaign has associated groups with contacts.');
      }

      console.log('Sending message to:', recipientPhones);
      console.log('Using sender ID:', selectedSenderId);
      console.log('Message:', message);
      if (sendMode === 'campaign') {
        console.log('Schedule:', schedule || 'Immediate');
      }

      await sendInstantMessage(currentWorkspaceId, {
        recipients: recipientPhones,
        content: message,
        sender_id: selectedSenderId,
      });

      setMessage('');
      setSchedule('');
      setSelectedCampaignId('');
      setManualContacts('');
      setKeywords('');
      setError(null);

      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      const logsData = await getMessageLogs();
      setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
    } catch (err: any) {
      console.error('Send SMS error:', err);
      setError(err.message || 'Failed to send SMS. Please check the campaign groups and try again.');
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

    console.log(`Processing groups for campaign ${selectedCampaignId}:`, groups);

    const recipientPhones: string[] = [];
    for (const group of groups) {
      if (!group.group_id) {
        console.warn(`Skipping group with missing group_id:`, group);
        continue;
      }
      if (!currentWorkspaceId) {
        throw new Error('Workspace ID is null.');
      }
      try {
        const groupContacts = await getGroupContacts(currentWorkspaceId, group.group_id);
        const contacts = Array.isArray(groupContacts) ? groupContacts : groupContacts?.data || [];
        const phoneNumbers = contacts.map((contact: Contact) => contact.phone_number).filter(Boolean);
        recipientPhones.push(...phoneNumbers);
        console.log(`Found ${phoneNumbers.length} contacts in group ${group.group_id}`);
      } catch (error) {
        console.error(`Failed to fetch contacts for group ${group.group_id}:`, error);
      }
    }

    const uniquePhones = [...new Set(recipientPhones)];
    console.log(`Found ${uniquePhones.length} unique recipients for campaign ${selectedCampaignId}`);
    return uniquePhones;
  };

  // Get recipients for manual contacts mode
  const getManualRecipients = (): string[] => {
    const phones = manualContacts
      .split(/[\n,]+/)
      .map((phone) => phone.trim())
      .filter(Boolean);
    console.log(`Manual recipients:`, phones);
    return phones;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 p-6 relative"
    >
      {showSuccessNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
          className="fixed inset-0 flex items-center justify-center z-50"
        >
          <div className="bg-green-500 text-white p-8 rounded-xl shadow-2xl flex flex-col items-center gap-4 w-96">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <CheckCircle className="w-16 h-16" />
            </motion.div>
            <span className="text-2xl font-semibold">SMS Sent Successfully!</span>
            <p className="text-sm text-green-100">Your message has been sent to all recipients.</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Send SMS</h1>
      </div>

      {useFallbackSenderIds && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
          <p className="font-bold">Warning</p>
          <p>Using fallback sender IDs due to API error. Some features may be limited.</p>
        </div>
      )}

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading data...</p>
        </div>
      )}

      {!isLoading && (
        <>
          <div className="card p-8">
            <h2 className="text-lg font-semibold mb-4">Send SMS</h2>
            <form onSubmit={handleSendSMS} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Mode</label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="campaign"
                      checked={sendMode === 'campaign'}
                      onChange={() => setSendMode('campaign')}
                      className="mr-2"
                    />
                    Send via Campaign
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="contacts"
                      checked={sendMode === 'contacts'}
                      onChange={() => setSendMode('contacts')}
                      className="mr-2"
                    />
                    Send to Contacts
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Sender ID</label>
                <select
                  className="input w-full"
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a sender ID</option>
                  {senderIds.length > 0 ? (
                    senderIds.map((sender) => (
                      <option key={sender.sender_id} value={sender.sender_id}>
                        {sender.name} ({sender.sender_id})
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>No approved sender IDs available</option>
                  )}
                </select>
                {senderIds.length === 0 && !useFallbackSenderIds && (
                  <p className="text-sm text-amber-600 mt-1">
                    You need to request and get approval for a Sender ID before sending messages.
                  </p>
                )}
              </div>

              {sendMode === 'campaign' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
                    <select
                      className="input w-full"
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      required={sendMode === 'campaign'}
                    >
                      <option value="" disabled>Select a campaign</option>
                      {campaigns.map((campaign) => (
                        <option key={campaign.campaign_id} value={campaign.campaign_id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipient Groups</label>
                    <div className="text-sm text-gray-600">
                      {campaignGroups[selectedCampaignId]?.length > 0 ? (
                        campaignGroups[selectedCampaignId].map((group) => (
                          <span
                            key={group.group_id}
                            className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 mb-2"
                          >
                            {group.name}
                          </span>
                        ))
                      ) : (
                        <span>No groups assigned to this campaign.</span>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enter Contacts</label>
                  <textarea
                    className="input min-h-[120px] w-full"
                    placeholder="Enter phone numbers (comma-separated or one per line, e.g., +1234567890, +0987654321)"
                    value={manualContacts}
                    onChange={(e) => setManualContacts(e.target.value)}
                    required={sendMode === 'contacts'}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Example: +1234567890, +0987654321 or one number per line.
                  </p>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">Message</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="input max-w-[200px]"
                      placeholder="Enter keywords"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={generateAIMessage}
                      disabled={isGenerating}
                      className="btn btn-sm btn-secondary flex items-center gap-2"
                    >
                      <Bot className="w-4 h-4" />
                      {isGenerating ? 'Generating...' : 'Generate AI Message'}
                    </button>
                  </div>
                </div>
                <textarea
                  className="input min-h-[120px] w-full"
                  placeholder="Type your SMS message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                <div className="mt-2 flex justify-between text-sm text-gray-500">
                  <span>{message.length} characters</span>
                  <span>{Math.ceil(message.length / 160)} message(s)</span>
                </div>
              </div>

              {sendMode === 'campaign' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    className="input w-full"
                    value={schedule}
                    onChange={(e) => setSchedule(e.target.value)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={isSending || senderIds.length === 0}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  {isSending ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </form>
          </div>

          <div className="card p-8">
            <h2 className="text-lg font-semibold mb-4">Sent SMS Logs</h2>
            {messageLogs.length === 0 ? (
              <p className="text-gray-500">No SMS logs available.</p>
            ) : (
              <div className="space-y-4">
                {messageLogs.map((log) => (
                  <div key={log.id || log.timestamp} className="p-4 border rounded-lg">
                    <p className="text-sm text-gray-600">Message: {log.message || 'N/A'}</p>
                    <p className="text-sm text-gray-500">Status: {log.status || 'N/A'}</p>
                    <p className="text-sm text-gray-500">
                      Timestamp: {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <Users className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Total Recipients</h3>
              <p className="text-gray-600">{contacts.length} contacts</p>
            </div>
            <div className="card p-6">
              <Clock className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Campaigns Available</h3>
              <p className="text-gray-600">{campaigns.length} campaigns</p>
            </div>
            <div className="card p-6">
              <BarChart2 className="w-6 h-6 text-primary-500 mb-3" />
              <h3 className="text-lg font-semibold mb-2">Sender IDs</h3>
              <p className="text-gray-600">{senderIds.length} approved available</p>
              {senderIds.length > 0 && (
                <div className="mt-2 space-y-2">
                  {senderIds.map((sender) => (
                    <div key={sender.sender_id} className="text-sm">
                      <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2 mb-1">
                        {sender.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SendSMS;