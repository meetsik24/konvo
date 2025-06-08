import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Upload, X, Bot } from 'lucide-react';
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

// Define interfaces
interface Campaign {
  campaign_id: string;
  workspace_id: string;
  name: string;
  description: string;
  launch_date: string;
}

interface Group {
  group_id: string;
  name: string;
}

interface Contact {
  contact_id: string;
  phone_number: string;
}

interface MessageLog {
  id?: string;
  message?: string;
  status?: string;
  timestamp?: string;
}

interface SenderId {
  sender_id: string;
  name: string;
  is_approved: boolean;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitText = 'Submit',
}) => {
  if (!isOpen) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className="bg-white rounded-lg p-4 max-w-sm w-full border border-gray-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#00333e]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#00333e]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          {onSubmit && (
            <button
              onClick={onSubmit}
              className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
            >
              {submitText}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [sendMode, setSendMode] = useState<'contacts' | 'campaign'>('contacts');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [selectedSenderId, setSelectedSenderId] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [manualContacts, setManualContacts] = useState('');
  const [message, setMessage] = useState('');
  const [keywords, setKeywords] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [modalState, setModalState] = useState({
    isAIModalOpen: false,
    isGroupModalOpen: false,
    isImportModalOpen: false,
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!currentWorkspaceId) throw new Error('No workspace selected.');

        // Sender IDs
        const senderResponse = await getApprovedSenderIds(currentWorkspaceId);
        const approvedSenderIds = Array.isArray(senderResponse)
          ? senderResponse.filter((s) => s.is_approved)
          : senderResponse?.data?.filter((s: SenderId) => s.is_approved) || [];
        setSenderIds(approvedSenderIds);
        if (approvedSenderIds.length) setSelectedSenderId(approvedSenderIds[0].sender_id);

        // Campaigns
        const campaignsData = await getCampaigns();
        const formattedCampaigns = Array.isArray(campaignsData)
          ? campaignsData
          : campaignsData?.data || [];
        setCampaigns(formattedCampaigns.filter((c: Campaign) => c.campaign_id));

        // Groups
        const groupsData = await getWorkspaceGroups(currentWorkspaceId);
        setGroups(Array.isArray(groupsData) ? groupsData : groupsData?.data || []);

        // Logs
        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  // Fetch campaign groups
  useEffect(() => {
    const fetchCampaignGroups = async () => {
      if (!selectedCampaignId) return;
      try {
        const groupsData = await getCampaignGroups(selectedCampaignId);
        const formattedGroups = Array.isArray(groupsData)
          ? groupsData
          : groupsData?.data || [];
        setCampaignGroups((prev) => ({
          ...prev,
          [selectedCampaignId]: formattedGroups,
        }));
      } catch (err) {
        setError('Failed to fetch campaign groups.');
      }
    };
    fetchCampaignGroups();
  }, [selectedCampaignId]);

  // Inline recipient fetching
  const fetchRecipients = async (groupIds: string[]): Promise<string[]> => {
    const recipientPhones: string[] = [];
    for (const groupId of groupIds) {
      try {
        const contacts = await getGroupContacts(currentWorkspaceId, groupId, 1, 50);
        const phones = (contacts?.contacts || [])
          .map((c: Contact) => c.phone_number)
          .filter((p: string) => p && /^\+?\d{10,15}$/.test(p.trim()));
        recipientPhones.push(...phones);
      } catch (err) {
        console.error(`Failed to fetch contacts for group ${groupId}:`, err);
      }
    }
    return [...new Set(recipientPhones)];
  };

  // Handle form submission
  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected.');
      if (!selectedSenderId) throw new Error('Please select a sender ID.');
      if (!message.trim()) throw new Error('Please enter a message.');
      
      let recipients: string[] = [];
      if (sendMode === 'campaign') {
        if (!selectedCampaignId) throw new Error('Please select a campaign.');
        const campaignGroups = campaignGroups[selectedCampaignId] || [];
        if (!campaignGroups.length) throw new Error('No groups assigned to campaign.');
        recipients = await fetchRecipients(campaignGroups.map((g) => g.group_id));
      } else {
        if (!manualContacts.trim() && !selectedGroups.length) {
          throw new Error('Please enter contacts or select groups.');
        }
        if (manualContacts.trim()) {
          const manualPhones = manualContacts
            .split(/[\n,]+/)
            .map((p) => p.trim())
            .filter((p) => p && /^\+?\d{10,15}$/.test(p));
          recipients.push(...manualPhones);
        }
        if (selectedGroups.length) {
          const groupPhones = await fetchRecipients(selectedGroups);
          recipients.push(...groupPhones);
        }
      }
      
      if (!recipients.length) throw new Error('No valid recipients found.');
      
      await sendInstantMessage(currentWorkspaceId, {
        recipients,
        content: message,
        sender_id: selectedSenderId,
      });
      
      setMessage('');
      setManualContacts('');
      setSelectedGroups([]);
      setSelectedCampaignId('');
      setMessageLogs((prev) => [
        { id: Date.now().toString(), message, status: 'sent', timestamp: new Date().toISOString() },
        ...prev,
      ]);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
    }
  };

  // Generate AI message
  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsGenerating(true);
    try {
      const generatedMessage = await generateMessage(`Generate an SMS message based on: ${keywords}`);
      setMessage(generatedMessage);
      setModalState((prev) => ({ ...prev, isAIModalOpen: false }));
    } catch (err: any) {
      setError(err.message || 'Failed to generate message.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const phones = text
        .split(/[\n,]+/)
        .map((p) => p.trim())
        .filter((p) => p && /^\+?\d{10,15}$/.test(p));
      setManualContacts(phones.join('\n'));
      setModalState((prev) => ({ ...prev, isImportModalOpen: false }));
    };
    reader.readAsText(file);
  };

  // Toggle group selection
  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-6 h-6 text-[#00333e]" />
        <h1 className="text-2xl font-bold text-[#00333e]">Send SMS</h1>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00333e]"></div>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-6">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <div className="flex border-b border-gray-200 mb-4">
              <button
                onClick={() => setSendMode('contacts')}
                className={`flex-1 py-2 text-sm font-medium ${
                  sendMode === 'contacts' ? 'border-b-2 border-[#00333e] text-[#00333e]' : 'text-gray-500'
                }`}
              >
                Instant SMS
              </button>
              <button
                onClick={() => setSendMode('campaign')}
                className={`flex-1 py-2 text-sm font-medium ${
                  sendMode === 'campaign' ? 'border-b-2 border-[#00333e] text-[#00333e]' : 'text-gray-500'
                }`}
              >
                Campaign SMS
              </button>
            </div>
            <form onSubmit={handleSendSMS} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#00333e] mb-1">Sender ID</label>
                <select
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#00333e]"
                  required
                >
                  <option value="">Select Sender ID</option>
                  {senderIds.map((sender) => (
                    <option key={sender.sender_id} value={sender.sender_id}>
                      {sender.name}
                    </option>
                  ))}
                </select>
              </div>
              {sendMode === 'campaign' && (
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign</label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#00333e]"
                    required
                  >
                    <option value="">Select Campaign</option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.campaign_id} value={campaign.campaign_id}>
                        {campaign.name}
                      </option>
                    ))}
                  </select>
                  {selectedCampaignId && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-[#00333e] mb-1">Groups</label>
                      <div className="flex flex-wrap gap-2">
                        {campaignGroups[selectedCampaignId]?.map((group) => (
                          <span
                            key={group.group_id}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                          >
                            {group.name}
                          </span>
                        )) || <span className="text-sm text-gray-500">No groups assigned.</span>}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {sendMode === 'contacts' && (
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-1">Contacts</label>
                  <textarea
                    value={manualContacts}
                    onChange={(e) => setManualContacts(e.target.value)}
                    placeholder="Enter phone numbers (one per line or comma-separated)"
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#00333e] h-20"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setModalState((prev) => ({ ...prev, isGroupModalOpen: true }))}
                      className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Select Groups
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalState((prev) => ({ ...prev, isImportModalOpen: true }))}
                      className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Import Contacts
                    </button>
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-[#00333e] mb-1">Selected Groups</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedGroups.map((groupId) => {
                          const group = groups.find((g) => g.group_id === groupId);
                          return group ? (
                            <span
                              key={groupId}
                              className="inline-flex items-center bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                            >
                              {group.name}
                              <button
                                onClick={() => toggleGroupSelection(groupId)}
                                className="ml-1 text-gray-500 hover:text-red-500"
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
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[#00333e]">Message</label>
                  <button
                    type="button"
                    onClick={() => setModalState((prev) => ({ ...prev, isAIModalOpen: true }))}
                    className="flex items-center gap-1 text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200"
                  >
                    <Bot className="w-4 h-4" /> AI Generate
                  </button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#00333e] h-24"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">{message.length} characters</p>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSending}
                  className={`flex items-center gap-2 px-4 py-2 text-sm bg-[#00333e] text-white rounded-lg ${
                    isSending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002a36]'
                  }`}
                >
                  <Send className="w-5 h-5" /> {isSending ? 'Sending...' : 'Send SMS'}
                </button>
              </div>
            </form>
          </div>

          {/* Modals */}
          <Modal
            isOpen={modalState.isAIModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isAIModalOpen: false }))}
            title="Generate AI Message"
            onSubmit={generateAIMessage}
            submitText={isGenerating ? 'Generating...' : 'Generate'}
          >
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="Enter prompt for AI message"
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#00333e]"
            />
          </Modal>
          <Modal
            isOpen={modalState.isGroupModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isGroupModalOpen: false }))}
            title="Select Groups"
          >
            <div className="max-h-48 overflow-y-auto">
              {groups.length ? (
                groups.map((group) => (
                  <label key={group.group_id} className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
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
          <Modal
            isOpen={modalState.isImportModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isImportModalOpen: false }))}
            title="Import Contacts"
          >
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="w-full p-2 border rounded-lg text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Upload CSV/TXT with phone numbers (one per line or comma-separated).</p>
          </Modal>

          {/* Logs */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold text-[#00333e] mb-4">SMS Logs</h2>
            {messageLogs.length ? (
              <div className="space-y-2">
                {messageLogs.map((log) => (
                  <div key={log.id || log.timestamp} className="p-2 border rounded-lg text-sm">
                    <p><strong>Message:</strong> {log.message || 'N/A'}</p>
                    <p><strong>Status:</strong> {log.status || 'N/A'}</p>
                    <p><strong>Time:</strong> {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No logs available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SendSMS;