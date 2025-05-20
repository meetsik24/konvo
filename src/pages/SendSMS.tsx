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
import Papa from 'papaparse';

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

interface UploadedContact {
  name?: string;
  phone_number?: string;
  message?: string;
  [key: string]: any; // Allow for additional CSV columns
}

const FALLBACK_SENDER_IDS: SenderId[] = [
  {
    sender_id: 'default_sender',
    name: 'Default Sender',
    user_id: 'default_user',
    is_approved: true,
    created_at: new Date().toISOString(),
  },
];

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
        className="bg-white border border-gray-200 rounded-2xl shadow-xl w-full max-w-lg p-4"
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
    isFileModalOpen: false,
  });
  const [isSchedulingEnabled, setIsSchedulingEnabled] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [sendMode, setSendMode] = useState<'contacts' | 'campaign' | 'file'>('contacts');
  const [manualContacts, setManualContacts] = useState('');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [uploadedContacts, setUploadedContacts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [useFallbackSenderIds, setUseFallbackSenderIds] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [useAllContacts, setUseAllContacts] = useState(false);
  const [uploadedData, setUploadedData] = useState<UploadedContact[]>([]);
  const [columnMappings, setColumnMappings] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(1);
  const [campaignName, setCampaignName] = useState('');
  const [availablePlaceholders, setAvailablePlaceholders] = useState<string[]>([]);
  const [selectedPlaceholders, setSelectedPlaceholders] = useState<string[]>([]);

  const contactCache = useRef<Map<string, Contact[]>>(new Map());
  const allContactsCache = useRef<Contact[] | null>(null);

  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string) => {
      const perPage = 50;
      let allContacts: Contact[] = [];
      let totalPages = 1;

      try {
        const firstResponse = groupId
          ? await getGroupContacts(workspaceId, groupId, 1, perPage)
          : await getContacts(workspaceId, 1, perPage);

        if (!firstResponse || typeof firstResponse !== 'object') {
          throw new Error('Invalid response from API: Response is not an object');
        }

        allContacts = firstResponse.contacts || [];
        totalPages = firstResponse.total_pages || 1;

        if (!Array.isArray(allContacts)) {
          throw new Error('Invalid response from API: Contacts field is not an array');
        }

        if (totalPages > 1) {
          const pageRequests = Array.from({ length: totalPages - 1 }, (_, i) =>
            groupId
              ? getGroupContacts(workspaceId, groupId, i + 2, perPage)
              : getContacts(workspaceId, i + 2, perPage)
          );
          const responses = await Promise.all(pageRequests);
          const additionalContacts = responses.flatMap((res) => res.contacts || []);
          allContacts = [...allContacts, ...additionalContacts];
        }

        return allContacts;
      } catch (error: any) {
        console.error('Error in fetchAllContacts:', error);
        throw new Error(`Failed to fetch contacts: ${error.message}`);
      }
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!currentWorkspaceId) {
          setError('No workspace selected.');
          return;
        }

        const response = await getApprovedSenderIds(currentWorkspaceId);
        let approvedSenderIds: SenderId[] = [];
        if (Array.isArray(response)) {
          approvedSenderIds = response.filter((sender) => sender.is_approved).map((sender) => ({
            sender_id: sender.sender_id,
            user_id: sender.user_id,
            is_approved: sender.is_approved,
            approved_at: sender.approved_at,
            name: sender.name || sender.sender_id,
            created_at: sender.created_at || new Date().toISOString(),
          }));
        } else if (response?.data && Array.isArray(response.data)) {
          approvedSenderIds = response.data.filter((sender: any) => sender.is_approved).map((sender: any) => ({
            sender_id: sender.sender_id,
            user_id: sender.user_id,
            is_approved: sender.is_approved,
            approved_at: sender.approved_at,
            name: sender.name || sender.sender_id,
            created_at: sender.created_at,
          }));
        } else if (response && typeof response === 'object' && response.is_approved) {
          approvedSenderIds = [{
            sender_id: response.sender_id,
            user_id: response.user_id,
            is_approved: response.is_approved,
            approved_at: response.approved_at,
            name: response.name || response.sender_id,
            created_at: response.created_at,
          }];
        } else {
          throw new Error('Invalid sender IDs response format');
        }

        setSenderIds(approvedSenderIds);
        setUseFallbackSenderIds(false);
        setSelectedSenderId(approvedSenderIds[0]?.sender_id || '');

        const campaignsData = await getCampaigns();
        setCampaigns(Array.isArray(campaignsData) ? campaignsData : campaignsData?.data || []);

        const workspaceGroups = await getWorkspaceGroups(currentWorkspaceId);
        setValidGroups(Array.isArray(workspaceGroups) ? workspaceGroups : workspaceGroups?.data || []);

        const logsData = await getMessageLogs();
        setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);

        if (!useFallbackSenderIds) setError(null);
      } catch (err: any) {
        setSenderIds(FALLBACK_SENDER_IDS);
        setUseFallbackSenderIds(true);
        setSelectedSenderId(FALLBACK_SENDER_IDS[0].sender_id);
        setError('Warning: Using fallback sender IDs due to API error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspaceId]);

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

  const fetchRecipientsFromGroups = useCallback(
    async (groupIds: string[]): Promise<string[]> => {
      if (!currentWorkspaceId) throw new Error('Workspace ID is null.');

      const recipientPhones: string[] = [];
      for (const groupId of groupIds) {
        if (contactCache.current.has(groupId)) {
          const phoneNumbers = contactCache.current.get(groupId)!
            .map((contact: Contact) => contact.phone_number)
            .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone.trim()));
          recipientPhones.push(...phoneNumbers);
          continue;
        }

        try {
          const groupContacts = await fetchAllContacts(currentWorkspaceId, groupId);
          contactCache.current.set(groupId, groupContacts);
          const phoneNumbers = groupContacts
            .map((contact: Contact) => contact.phone_number)
            .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone.trim()));
          recipientPhones.push(...phoneNumbers);
        } catch (error: any) {
          console.error(`Failed to fetch contacts for group ${groupId}:`, error.message);
        }
      }

      return [...new Set(recipientPhones)];
    },
    [currentWorkspaceId, fetchAllContacts]
  );

  const fetchAllWorkspaceContacts = useCallback(async (): Promise<string[]> => {
    if (!currentWorkspaceId) throw new Error('Workspace ID is null.');

    if (allContactsCache.current) {
      const phoneNumbers = allContactsCache.current
        .map((contact: Contact) => contact.phone_number)
        .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone.trim()));
      return [...new Set(phoneNumbers)];
    }

    try {
      const allContacts = await fetchAllContacts(currentWorkspaceId);
      allContactsCache.current = allContacts;
      const phoneNumbers = allContacts
        .map((contact: Contact) => contact.phone_number)
        .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone.trim()));
      return [...new Set(phoneNumbers)];
    } catch (error: any) {
      console.error('Failed to fetch all contacts:', error.message);
      throw new Error('Failed to fetch all contacts: ' + error.message);
    }
  }, [currentWorkspaceId, fetchAllContacts]);

  const getCampaignRecipients = useCallback(async (): Promise<string[]> => {
    const groups = campaignGroups[selectedCampaignId] || [];
    if (groups.length === 0) throw new Error(`No groups assigned to campaign '${selectedCampaignId}'.`);
    const groupIds = groups.map((group) => group.group_id);
    return fetchRecipientsFromGroups(groupIds);
  }, [selectedCampaignId, campaignGroups, fetchRecipientsFromGroups]);

  const getContactRecipients = useCallback(async (): Promise<string[]> => {
    let recipientPhones: string[] = [];

    if (useAllContacts) {
      const allPhones = await fetchAllWorkspaceContacts();
      recipientPhones.push(...allPhones);
      return [...new Set(recipientPhones)];
    }

    if (manualContacts.trim()) {
      const manualPhones = manualContacts
        .split(/[\n,]+/)
        .map((phone) => phone.trim())
        .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone));
      recipientPhones.push(...manualPhones);
    }

    if (selectedGroups.length > 0) {
      const groupPhones = await fetchRecipientsFromGroups(selectedGroups);
      recipientPhones.push(...groupPhones);
    }

    if (uploadedContacts.length > 0) {
      recipientPhones.push(...uploadedContacts);
    }

    return [...new Set(recipientPhones)];
  }, [manualContacts, selectedGroups, uploadedContacts, useAllContacts, fetchRecipientsFromGroups, fetchAllWorkspaceContacts]);

  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please provide prompts to generate SMS.');
      return;
    }

    setIsGenerating(true);
    try {
      const prompt = `Generate an SMS message based on the prompts: ${keywords}`;
      const generatedMessage = await generateMessage(prompt);
      setMessage(generatedMessage);
      setModalState((prev) => ({ ...prev, isAIModalOpen: false }));
    } catch (err: any) {
      setError(err.message || 'Failed to generate AI message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data as UploadedContact[];
        setUploadedData(data);
        if (data.length > 0) {
          const columns = Object.keys(data[0]);
          setAvailablePlaceholders(columns);
        }
        setStep(2);
      },
      error: (error) => {
        setError(`Failed to parse file: ${error.message}`);
      },
    });
  };

  const handleColumnMapping = (column: string, field: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [column]: field,
    }));
  };

  const togglePlaceholderSelection = (placeholder: string) => {
    setSelectedPlaceholders((prev) =>
      prev.includes(placeholder) ? prev.filter((p) => p !== placeholder) : [...prev, placeholder]
    );
  };

  const handleSendFileSMS = async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }
    if (!selectedSenderId) {
      setError('Please select a sender ID.');
      return;
    }
    if (!campaignName.trim()) {
      setError('Please enter a campaign name.');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message.');
      return;
    }

    const validData = uploadedData
      .map((row) => {
        const phone_number = columnMappings['phone_number'] ? row[columnMappings['phone_number']] : '';
        return { ...row, phone_number };
      })
      .filter((row) => row.phone_number && /^\+?\d{10,15}$/.test(row.phone_number.trim()));

    if (validData.length === 0) {
      setError('No valid data to send. Please map the phone number field and ensure valid phone numbers.');
      return;
    }

    setIsSending(true);
    try {
      for (const contact of validData) {
        let personalizedMessage = message;
        selectedPlaceholders.forEach((placeholder) => {
          const value = contact[placeholder] || '';
          personalizedMessage = personalizedMessage.replace(`{${placeholder}}`, value);
        });

        await sendInstantMessage(currentWorkspaceId, {
          recipients: [contact.phone_number],
          content: personalizedMessage,
          sender_id: selectedSenderId,
        });
      }

      contactCache.current.clear();
      allContactsCache.current = null;

      setUploadedData([]);
      setColumnMappings({});
      setStep(1);
      setCampaignName('');
      setMessage('');
      setAvailablePlaceholders([]);
      setSelectedPlaceholders([]);
      setModalState((prev) => ({ ...prev, isFileModalOpen: false }));
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      const logsData = await getMessageLogs();
      setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const toggleAllContacts = () => {
    setUseAllContacts((prev) => !prev);
    if (!useAllContacts) {
      setManualContacts('');
      setSelectedGroups([]);
      setUploadedContacts([]);
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
    if (
      sendMode === 'contacts' &&
      !useAllContacts &&
      !manualContacts.trim() &&
      selectedGroups.length === 0
    ) {
      setError('Please enter at least one contact phone number, select a group, or choose "All Contacts".');
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
        throw new Error('No valid recipients found.');
      }

      await sendInstantMessage(currentWorkspaceId, {
        recipients: recipientPhones,
        content: message,
        sender_id: selectedSenderId,
      });

      contactCache.current.clear();
      allContactsCache.current = null;

      setMessage('');
      setSchedule('');
      setIsSchedulingEnabled(false);
      setSelectedCampaignId('');
      setManualContacts('');
      setSelectedGroups([]);
      setUploadedContacts([]);
      setKeywords('');
      setUseAllContacts(false);

      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);

      const logsData = await getMessageLogs();
      setMessageLogs(Array.isArray(logsData) ? logsData : logsData?.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-4"
      >
        <MessageSquare className="w-6 h-6 text-[#00333e]" />
        <h1 className="text-xl sm:text-2xl font-bold text-[#00333e]">Send SMS</h1>
      </motion.div>

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

      {!isLoading && (
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
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
              <button
                onClick={() => setSendMode('file')}
                className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
                  sendMode === 'file'
                    ? 'border-b-2 border-[#00333e] text-[#00333e]'
                    : 'text-gray-500 hover:text-[#00333e]'
                }`}
              >
                File SMS
              </button>
            </div>

            <form onSubmit={sendMode === 'file' ? handleSendFileSMS : handleSendSMS} className="space-y-4">
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
                  {senderIds.map((sender) => (
                    <option key={sender.sender_id} value={sender.sender_id}>
                      {sender.name} ({sender.sender_id})
                    </option>
                  ))}
                </select>
              </div>

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
                      {campaignGroups[selectedCampaignId]?.length > 0
                        ? campaignGroups[selectedCampaignId].map((group) => (
                            <span
                              key={group.group_id}
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded mr-2 mb-2"
                            >
                              {group.name}
                            </span>
                          ))
                        : 'No groups assigned.'}
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSchedulingEnabled}
                        onChange={(e) => {
                          setIsSchedulingEnabled(e.target.checked);
                          if (e.target.checked) setModalState((prev) => ({ ...prev, isScheduleModalOpen: true }));
                          else setSchedule('');
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

              {sendMode === 'contacts' && (
                <div>
                  <label className="block text-sm font-medium text-[#00333e] mb-1">Contacts</label>
                  <div className="mb-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={useAllContacts}
                        onChange={toggleAllContacts}
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-[#00333e]">Send to All Contacts</span>
                    </label>
                    {useAllContacts && (
                      <p className="text-sm text-gray-600 mt-1">
                        This will send the SMS to all contacts in the workspace.
                      </p>
                    )}
                  </div>
                  {!useAllContacts && (
                    <>
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
                    </>
                  )}
                </div>
              )}

              {sendMode === 'file' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign Name</label>
                    <input
                      type="text"
                      className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                      placeholder="Enter campaign name"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalState((prev) => ({ ...prev, isFileModalOpen: true }))}
                    className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    Upload File
                  </button>
                </div>
              )}

              {(sendMode === 'contacts' || sendMode === 'campaign') && (
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
                    required={sendMode !== 'file'}
                  />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>{message.length} characters</span>
                    <span>{Math.ceil(message.length / 160)} message(s)</span>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSending || senderIds.length === 0 || (sendMode === 'campaign' && !selectedCampaignId) || (sendMode === 'contacts' && !useAllContacts && !manualContacts.trim() && selectedGroups.length === 0) || (sendMode === 'file' && step !== 3)}
                  className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-colors disabled:bg-[#00333e]/50"
                >
                  <Send className="w-5 h-5" />
                  {isSending ? 'Sending...' : sendMode === 'file' ? 'Send SMS' : 'Send SMS'}
                </motion.button>
              </div>
            </form>
          </motion.div>

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

          <Modal
            isOpen={modalState.isImportModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isImportModalOpen: false }))}
            title="Import Contacts"
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Upload File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  const phoneNumbers = text
                    .split(/[\n,]+/)
                    .map((phone) => phone.trim())
                    .filter((phone): phone is string => !!phone && /^\+?\d{10,15}$/.test(phone));
                  setUploadedContacts(phoneNumbers);
                  setManualContacts((prev) => (prev ? `${prev}\n${phoneNumbers.join('\n')}` : phoneNumbers.join('\n')));
                  setModalState((prev) => ({ ...prev, isImportModalOpen: false }));
                };
                reader.readAsText(file);
              }}
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
            />
            <p className="text-sm text-gray-500 mt-1">
              Upload a CSV or TXT file with phone numbers (one per line or comma-separated).
            </p>
          </Modal>

          <Modal
            isOpen={modalState.isGroupModalOpen}
            onClose={() => setModalState((prev) => ({ ...prev, isGroupModalOpen: false }))}
            title="Select Contact Groups"
          >
            <div className="max-h-48 overflow-y-auto">
              {validGroups.map((group) => (
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
              ))}
            </div>
          </Modal>

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

          <Modal
            isOpen={modalState.isFileModalOpen}
            onClose={() => {
              setModalState((prev) => ({ ...prev, isFileModalOpen: false }));
              setStep(1);
              setUploadedData([]);
              setColumnMappings({});
              setAvailablePlaceholders([]);
              setSelectedPlaceholders([]);
              setMessage('');
            }}
            title="Upload File for SMS"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4 overflow-x-auto">
                {['Upload File', 'Preview Contacts', 'Send Message'].map((label, index) => (
                  <div key={label} className="flex items-center min-w-[100px]">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        step >= index + 1 ? 'bg-[#00333e] text-white' : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span
                      className={`ml-2 text-sm ${step >= index + 1 ? 'text-[#00333e]' : 'text-gray-400'} truncate`}
                    >
                      {label}
                    </span>
                    {index < 2 && <div className="w-6 h-1 bg-gray-300 mx-1" />}
                  </div>
                ))}
              </div>

              {step === 1 && (
                <div className="text-center">
                  <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-600 mb-2 text-sm">Drag and drop a CSV file here, or click to select</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] cursor-pointer"
                  >
                    Upload CSV File
                  </label>
                  <p className="text-gray-500 mt-2 text-sm">(Format: name, phone_number, message, etc.)</p>
                </div>
              )}

              {step === 2 && uploadedData.length > 0 && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">Map Columns and Select Placeholders</p>
                  <div className="overflow-x-auto max-h-[300px] border border-gray-200 rounded-lg mb-4">
                    <table className="w-full text-left text-gray-700">
                      <thead className="sticky top-0 bg-gray-100">
                        <tr>
                          {Object.keys(uploadedData[0]).map((column) => (
                            <th key={column} className="p-2 min-w-[120px]">
                              <select
                                value={columnMappings[column] || ''}
                                onChange={(e) => handleColumnMapping(column, e.target.value)}
                                className="w-full text-sm py-1 px-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                              >
                                <option value="">Select...</option>
                                <option value="phone_number">Phone Number</option>
                                <option value="name">Name</option>
                                <option value="message">Message</option>
                                {Object.keys(uploadedData[0])
                                  .filter((col) => col !== column)
                                  .map((col) => (
                                    <option key={col} value={col}>
                                      {col}
                                    </option>
                                  ))}
                              </select>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uploadedData.slice(0, 5).map((row, index) => (
                          <tr key={index} className="border-b border-gray-200">
                            {Object.values(row).map((value, i) => (
                              <td key={i} className="p-2 text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis">
                                {value}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Showing first 5 rows. Total rows: {uploadedData.length}</p>
                  <p className="text-sm text-gray-700 mb-2">Select Placeholders for Message</p>
                  <div className="flex flex-wrap gap-2">
                    {availablePlaceholders.map((placeholder) => (
                      <label key={placeholder} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={selectedPlaceholders.includes(placeholder)}
                          onChange={() => togglePlaceholderSelection(placeholder)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-[#00333e]">{placeholder}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="text-sm text-gray-700 mb-2">Compose Message with Placeholders</p>
                  <textarea
                    className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    placeholder="Type your message (e.g., Hello {name}, your number is {phone_number})"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                  <p className="text-sm text-gray-600 mt-2">
                    Available placeholders: {selectedPlaceholders.map((p) => `{${p}}`).join(', ')}
                  </p>
                  <p className="text-sm text-gray-600">
                    Preview (first contact):{' '}
                    {uploadedData.length > 0
                      ? selectedPlaceholders.reduce(
                          (msg, placeholder) =>
                            msg.replace(`{${placeholder}}`, uploadedData[0][placeholder] || ''),
                          message
                        )
                      : 'No preview available'}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              {step > 1 && (
                <button
                  onClick={() => setStep(step - 1)}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
              )}
              {step < 3 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
                  disabled={step === 2 && (!columnMappings['phone_number'] || selectedPlaceholders.length === 0)}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                  disabled={isSending}
                >
                  {isSending ? 'Sending...' : 'Send SMS'}
                </button>
              )}
            </div>
          </Modal>

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Total Groups</h3>
                  <p className="text-gray-600 text-sm">{validGroups.length} groups</p>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-[#00333e]" />
                <div>
                  <h3 className="text-lg font-semibold text-[#00333e]">Campaigns</h3>
                  <p className="text-gray-600 text-sm">{campaigns.length} campaigns</p>
                </div>
              </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
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