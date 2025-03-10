import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  getCampaignGroups,
  getContacts,
  getGroupContacts,
  getApprovedSenderIds,
  sendInstantMessage,
  getMessageLogs,
} from '../services/api';

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
}

interface Contact {
  id: string;
  name: string;
  phone_number: string;
  email?: string;
  group_id?: string;
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
  approved_at: string;
  name: string;
  created_at: string;
}

const SendSMS: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>(workspace?.campaigns || []);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [contacts, setContacts] = useState<Contact[]>(workspace?.contacts || []);
  const [senderIds, setSenderIds] = useState<SenderId[]>(workspace?.senderIds || []);
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
  const [manualContacts, setManualContacts] = useState<string>('');

  // Sync with workspace data
  useEffect(() => {
    setCampaigns(workspace?.campaigns || []);
    setContacts(workspace?.contacts || []);
    setSenderIds(workspace?.senderIds || []);
    setError(null);
  }, [currentWorkspaceId, workspace]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      setIsLoading(true); // Added isLoading state for consistency
      try {
        // Fetch campaigns
        const campaignsData = await getCampaigns(currentWorkspaceId);
        const formattedCampaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.data || [];
        setCampaigns(formattedCampaigns);
        updateWorkspace(currentWorkspaceId, { campaigns: formattedCampaigns });

        // Fetch approved sender IDs (same logic as SenderID.tsx)
        const senderIdsData = await getApprovedSenderIds(currentWorkspaceId);
        const formattedSenderIds = Array.isArray(senderIdsData)
          ? senderIdsData.map((item: SenderId) => ({
              sender_id: item.sender_id,
              user_id: item.user_id,
              is_approved: item.is_approved,
              approved_at: item.approved_at,
              name: item.name,
              created_at: item.created_at,
            }))
          : Array.isArray(senderIdsData?.data)
          ? senderIdsData.data.map((item: SenderId) => ({
              sender_id: item.sender_id,
              user_id: item.user_id,
              is_approved: item.is_approved,
              approved_at: item.approved_at,
              name: item.name,
              created_at: item.created_at,
            }))
          : [];
        setSenderIds(formattedSenderIds);
        setSelectedSenderId(formattedSenderIds.length > 0 ? formattedSenderIds[0].sender_id : ''); // Set default only if data exists
        updateWorkspace(currentWorkspaceId, { senderIds: formattedSenderIds });

        // Fetch contacts
        const contactsData = await getContacts(currentWorkspaceId);
        const totalContacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
        setContacts(totalContacts);
        updateWorkspace(currentWorkspaceId, { contacts: totalContacts });

        // Fetch campaign groups
        const campaignGroupsData: { [key: string]: Group[] } = {};
        for (const campaign of formattedCampaigns) {
          const groups = await getCampaignGroups(campaign.campaign_id);
          campaignGroupsData[campaign.campaign_id] = Array.isArray(groups) ? groups : groups?.data || [];
        }
        setCampaignGroups(campaignGroupsData);

        // Fetch message logs
        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch data:', error.response?.data || error.message);
        setError(error?.response?.data?.message || 'Unable to fetch data from the server.');
        setSenderIds([]); // Clear sender IDs on error, consistent with SenderID.tsx
      } finally {
        setIsLoading(false); // Added isLoading state for consistency
      }
    };

    let isLoading = false; // Local state for loading indicator
    const setIsLoading = (value: boolean) => {
      isLoading = value;
    };

    fetchData();
  }, [currentWorkspaceId, updateWorkspace]);

  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      alert('Please enter some keywords to generate a message');
      return;
    }
    setIsGenerating(true);
    try {
      const keywordsArray = keywords.split(',').map((k) => k.trim()).filter((k) => k);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const aiMessage = `Hello! This is reaching out regarding ${keywordsArray.join(' and ')}. How can we assist you today with these topics?`;
      setMessage(aiMessage);
    } catch (error) {
      console.error('Error generating AI message:', error);
      setError('Failed to generate AI message.');
    } finally {
      setIsGenerating(false);
    }
  };

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
      let recipientPhones: string[] = [];

      if (sendMode === 'campaign') {
        const selectedCampaign = campaigns.find((c) => c.campaign_id === selectedCampaignId);
        if (!selectedCampaign) {
          throw new Error('Selected campaign not found.');
        }

        const groups = campaignGroups[selectedCampaignId] || [];
        for (const group of groups) {
          const groupContacts = await getGroupContacts(currentWorkspaceId, group.group_id);
          recipientPhones.push(...groupContacts.map((contact: Contact) => contact.phone_number));
        }

        if (recipientPhones.length === 0) {
          throw new Error('No recipients found for the selected campaign groups.');
        }
      } else {
        recipientPhones = manualContacts
          .split(/[\n,]+/)
          .map((phone) => phone.trim())
          .filter((phone) => phone);
        if (recipientPhones.length === 0) {
          throw new Error('No valid phone numbers provided.');
        }
      }

      recipientPhones = [...new Set(recipientPhones)];

      await sendInstantMessage(currentWorkspaceId, {
        recipients: recipientPhones,
        message,
        sender_id: selectedSenderId,
        schedule: schedule || undefined,
      });

      setMessage('');
      setSchedule('');
      setSelectedCampaignId('');
      setManualContacts('');
      setKeywords('');
      setError(null);

      const logsData = await getMessageLogs();
      setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
    } catch (error: any) {
      console.error('Error sending SMS:', error.response?.data || error.message);
      setError(error?.response?.data?.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Send SMS</h1>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
              className="input"
              value={selectedSenderId}
              onChange={(e) => setSelectedSenderId(e.target.value)}
              required
            >
              <option value="" disabled>Select a sender ID</option>
              {senderIds.map((sender) => (
                <option key={sender.sender_id} value={sender.sender_id}>
                  {sender.name} ({sender.sender_id})
                </option>
              ))}
            </select>
          </div>

          {sendMode === 'campaign' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Campaign</label>
                <select
                  className="input"
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
                      <span key={group.group_id} className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded mr-2">
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
                className="input min-h-[120px]"
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
              className="input min-h-[120px]"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
            <input
              type="datetime-local"
              className="input"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={isSending}
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
                <p className="text-sm text-gray-500">Timestamp: {new Date(log.timestamp || '').toLocaleString()}</p>
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
          <p className="text-gray-600">{senderIds.length} available</p>
        </div>
      </div>
    </motion.div>
  );
};

export default SendSMS;