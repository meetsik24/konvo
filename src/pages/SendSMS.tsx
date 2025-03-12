import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, RefreshCw } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  getCampaignGroups,
  getContacts,
  getGroupContacts,
  sendInstantMessage,
  getMessageLogs,
} from '../services/api';
import { useApprovedSenderIds } from './useApprovedSenderIds';
import { fetchSenderIds } from './senderIdService';

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
  approved_at?: string;
  name: string;
  created_at?: string;
  request_id?: string;
  status?: 'pending' | 'approved' | 'rejected';
  requested_at?: string;
  reviewed_at?: string;
}

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [contacts, setContacts] = useState<Contact[]>([]);
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

  // Fetch sender IDs and use the hook
  const { senderIds, formattedOptions, isLoading: senderIdsLoading, error: senderIdsError, refresh } = useApprovedSenderIds(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      setIsLoading(true);
      try {
        console.log('Fetching data for workspace:', currentWorkspaceId);

        // Fetch sender IDs
        const fetchedSenderIds = await fetchSenderIds(currentWorkspaceId, false, false); // Assuming non-admin view for SendSMS
        refresh(fetchedSenderIds);

        // Fetch other data
        const campaignsData = await getCampaigns(currentWorkspaceId);
        const formattedCampaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.data || [];
        setCampaigns(formattedCampaigns);

        const contactsData = await getContacts(currentWorkspaceId);
        const formattedContacts = Array.isArray(contactsData) ? contactsData : contactsData?.data || [];
        setContacts(formattedContacts);

        const campaignGroupsData: { [key: string]: Group[] } = {};
        for (const campaign of formattedCampaigns) {
          const groups = await getCampaignGroups(campaign.campaign_id);
          campaignGroupsData[campaign.campaign_id] = Array.isArray(groups) ? groups : groups?.data || [];
        }
        setCampaignGroups(campaignGroupsData);

        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        setError(null);
      } catch (err) {
        const message = err.response?.data?.message || err.message || 'Failed to fetch data.';
        console.error('Fetch error:', message);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspaceId, refresh]);

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
      const recipientPhones = sendMode === 'campaign'
        ? await getCampaignRecipients()
        : getManualRecipients();

      if (recipientPhones.length === 0) {
        throw new Error('No valid recipients found.');
      }

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
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
    }
  };

  const getCampaignRecipients = async (): Promise<string[]> => {
    const selectedCampaign = campaigns.find((c) => c.campaign_id === selectedCampaignId);
    if (!selectedCampaign) {
      throw new Error('Selected campaign not found.');
    }
    const groups = campaignGroups[selectedCampaignId] || [];
    const recipientPhones: string[] = [];
    for (const group of groups) {
      const groupContacts = await getGroupContacts(currentWorkspaceId, group.group_id);
      recipientPhones.push(...groupContacts.map((contact: Contact) => contact.phone_number));
    }
    return [...new Set(recipientPhones)];
  };

  const getManualRecipients = (): string[] => {
    return manualContacts
      .split(/[\n,]+/)
      .map((phone) => phone.trim())
      .filter(Boolean);
  };

  const refreshSenderIds = async () => {
    setIsLoading(true);
    try {
      const fetchedSenderIds = await fetchSenderIds(currentWorkspaceId, false, false); // Assuming non-admin view
      refresh(fetchedSenderIds);
    } catch (err) {
      setError(err.message || 'Failed to refresh sender IDs.');
    } finally {
      setIsLoading(false);
    }
  };

  const isOverallLoading = isLoading || senderIdsLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Send SMS</h1>
      </div>
      {(error || senderIdsError) && <div className="text-red-500 mb-4">{error || senderIdsError}</div>}
      {isOverallLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading data...</p>
        </div>
      )}
      {!isOverallLoading && (
        <>
          <div className="card p-8">
            <h2 className="text-lg font-semibold mb-4">Send SMS</h2>
            <div className="mb-4">
              <button
                onClick={refreshSenderIds}
                className="btn btn-sm btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Sender IDs
              </button>
            </div>
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
                  {formattedOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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
              <p className="text-gray-600">{senderIds.length} available</p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default SendSMS;