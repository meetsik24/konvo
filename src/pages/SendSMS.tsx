import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Users, Calendar, MessageSquare, Send, Bot } from 'lucide-react';
import PhonePreview from '../modals/PhonePreview';
import { useWorkspace } from './WorkspaceContext';
import Modal from '../modals/Modal';
import {
  getApprovedSenderIds,
  getCampaigns,
  getCampaignGroups,
  sendInstantMessage,
  generateMessage,
  getWorkspaceGroups,
  getGroupContacts,
} from '../services/api';

interface Campaign { campaign_id: string; workspace_id: string; name: string; status: 'active' | 'completed'; }
interface Group { group_id: string; name: string; }
interface SenderId { sender_id: string; name: string; is_approved: boolean; }
interface Contact { contact_id: string; phone_number: string; }
interface UploadedRow { [key: string]: string; }

const SendSMS = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [sendMode, setSendMode] = useState<'instant' | 'campaign' | 'file'>('instant');
  const [formData, setFormData] = useState({
    senderId: '',
    message: '',
    manualContacts: '',
    campaignName: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    frequency: '',
    template: '',
  });
  const [charCount, setCharCount] = useState(0);
  const [smsCount, setSmsCount] = useState(1);
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignGroups, setCampaignGroups] = useState<{ [key: string]: Group[] }>({});
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedData, setUploadedData] = useState<UploadedRow[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [phoneColumn, setPhoneColumn] = useState<string>(''); // Phone column selection
  const [defaultCountryCode, setDefaultCountryCode] = useState<string>('+255'); // Default country code
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [recipientCount, setRecipientCount] = useState(0);
  const [messagePreview, setMessagePreview] = useState('');
  const [invalidPhones, setInvalidPhones] = useState<string[]>([]); // Track invalid phone numbers
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [modalState, setModalState] = useState({
    isAIModalOpen: false,
    isGroupModalOpen: false,
    isCreateCampaignOpen: false,
  });

  useEffect(() => {
    const count = formData.message.length;
    setCharCount(count);
    setSmsCount(Math.ceil(count / 160) || 1);
  }, [formData.message]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (!currentWorkspaceId) throw new Error('No workspace selected.');
        const senderResponse = await getApprovedSenderIds(currentWorkspaceId);
        setSenderIds(senderResponse);
        if (senderResponse.length) setFormData(prev => ({ ...prev, senderId: senderResponse[0].sender_id }));
        const campaignsData = await getCampaigns();
        setCampaigns(campaignsData);
        const groupsData = await getWorkspaceGroups(currentWorkspaceId);
        setGroups(groupsData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  useEffect(() => {
    const fetchCampaignGroups = async () => {
      if (!selectedCampaignId) {
        setCampaignGroups({});
        return;
      }
      try {
        const groupsData = await getCampaignGroups(selectedCampaignId);
        setCampaignGroups(prev => ({ ...prev, [selectedCampaignId]: groupsData }));
      } catch (err) {
        setError('Failed to fetch campaign groups.');
      }
    };
    fetchCampaignGroups();
  }, [selectedCampaignId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const normalizePhone = (phone: string, defaultCountryCode: string = '+255'): string => {
    if (!phone || typeof phone !== 'string') return '';

    // Clean the input (remove spaces, dashes, parentheses, etc.)
    let cleaned = phone.trim().replace(/[\s()-]/g, '');

    // Handle common prefixes
    if (cleaned.startsWith('00')) {
      cleaned = '+' + cleaned.slice(2);
    } else if (cleaned.startsWith('255') && !cleaned.startsWith('+255')) {
      cleaned = '+255' + cleaned.slice(3);
    } else if (cleaned.startsWith('0')) {
      cleaned = defaultCountryCode + cleaned.slice(1);
    } else if (/^\d{9,14}$/.test(cleaned)) {
      cleaned = defaultCountryCode + cleaned;
    } else if (!cleaned.startsWith('+')) {
      return '';
    }

    // Validate: must start with + followed by 9–15 digits
    if (!/^\+\d{9,15}$/.test(cleaned)) {
      console.warn(`Invalid phone number format: ${phone} → ${cleaned}`);
      return '';
    }

    return cleaned;
  };

  const parseFileRecipients = (file: File): Promise<UploadedRow[]> => {
    return new Promise((resolve, reject) => {
      if (file.size > 5 * 1024 * 1024) {
        reject(new Error('File size exceeds 5MB limit.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text.trim()) {
          reject(new Error('File is empty.'));
          return;
        }
        // Try multiple delimiters
        const delimiters = [',', ';', '\t'];
        let headers: string[] = [];
        let rows: string[][] = [];
        let validDelimiter = '';
        for (const delimiter of delimiters) {
          const lines = text.split('\n').filter(line => line.trim());
          const testHeaders = lines[0].split(delimiter).map(h => h.trim());
          if (testHeaders.length >= 1) {
            headers = testHeaders;
            validDelimiter = delimiter;
            rows = lines.slice(1).map(row => row.split(delimiter).map(col => col.trim()));
            break;
          }
        }
        if (!headers.length) {
          reject(new Error('CSV must have at least one column.'));
          return;
        }
        // Find phone column dynamically
        const phoneColIndex = headers.findIndex(h => /phone|mobile|number/i.test(h));
        if (phoneColIndex === -1) {
          reject(new Error('No phone number column found (e.g., phone, mobile, phone_number).'));
          return;
        }
        setPhoneColumn(headers[phoneColIndex]);
        const parsedRows = rows.map(row => {
          const obj: UploadedRow = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        if (parsedRows.length > 10000) {
          reject(new Error('File exceeds 10,000 rows.'));
          return;
        }
        if (parsedRows.length === 0) {
          reject(new Error('No valid data found in file.'));
          return;
        }
        const invalidNumbers: string[] = [];
        const validRows = parsedRows.filter(row => {
          const phone = row[headers[phoneColIndex]];
          const normalized = normalizePhone(phone, defaultCountryCode);
          if (!normalized && phone) {
            invalidNumbers.push(phone);
          }
          return normalized;
        });
        setInvalidPhones(invalidNumbers);
        if (!validRows.length) {
          reject(new Error(`No valid phone numbers found in the ${headers[phoneColIndex]} column. Invalid numbers: ${invalidNumbers.join(', ')}`));
          return;
        }
        setAvailableColumns(headers);
        resolve(validRows);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setInvalidPhones([]);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.txt')) {
        setUploadedFile(file);
        try {
          const data = await parseFileRecipients(file);
          setUploadedData(data);
          if (invalidPhones.length) {
            setError(`Warning: ${invalidPhones.length} invalid phone numbers skipped (e.g., ${invalidPhones.slice(0, 3).join(', ')}).`);
          }
        } catch (err: any) {
          setError(err.message || 'Failed to parse file.');
        }
      } else {
        setError('Please upload a CSV or TXT file.');
      }
    }
  };

  const insertPlaceholder = (column: string) => {
    const placeholder = `{${column}}`;
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = formData.message.slice(0, start) + placeholder + formData.message.slice(end);
      setFormData(prev => ({ ...prev, message: newValue }));
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + placeholder.length;
        textarea.focus();
      }, 0);
    }
  };

  const applyPlaceholders = (message: string, row: UploadedRow) => {
    let result = message;
    availableColumns.forEach(column => {
      const placeholder = `{${column}}`;
      result = result.replace(new RegExp(placeholder, 'gi'), row[column] || '');
    });
    return result;
  };

  const isFormValid = () => {
    if (!formData.senderId || !formData.message.trim()) return false;
    if (sendMode === 'instant' && !formData.manualContacts.trim() && !selectedGroups.length) return false;
    if (sendMode === 'campaign' && !selectedCampaignId) return false;
    if (sendMode === 'file' && (!uploadedData.length || !phoneColumn)) return false;
    return true;
  };

  const prepareSendSMS = async () => {
    setError(null);
    setInvalidPhones([]);
    if (!isFormValid()) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      let recipients: string[] = [];
      let previewMessage = formData.message;

      if (sendMode === 'instant') {
        if (formData.manualContacts.trim()) {
          const manualPhones = formData.manualContacts
            .split(/[\n,]+/)
            .map(phone => normalizePhone(phone, defaultCountryCode))
            .filter(p => p);
          const invalid = formData.manualContacts
            .split(/[\n,]+/)
            .filter((phone, i) => phone.trim() && !manualPhones.includes(normalizePhone(phone, defaultCountryCode)));
          if (invalid.length) setInvalidPhones(invalid);
          recipients = manualPhones;
        }
        if (selectedGroups.length) {
          const groupPhones = await fetchRecipients(selectedGroups);
          recipients.push(...groupPhones.map(phone => normalizePhone(phone, defaultCountryCode)).filter(p => p));
        }
      } else if (sendMode === 'campaign') {
        const groups = campaignGroups[selectedCampaignId] || [];
        if (!groups.length) throw new Error('No groups assigned to campaign.');
        recipients = await fetchRecipients(groups.map(g => g.group_id));
      } else if (sendMode === 'file') {
        recipients = uploadedData
          .map(row => normalizePhone(row[phoneColumn] || '', defaultCountryCode))
          .filter(phone => phone);
        if (recipients.length && uploadedData.length) {
          previewMessage = applyPlaceholders(formData.message, uploadedData[0]);
        }
      }

      if (!recipients.length) {
        throw new Error(`No valid recipients found in ${sendMode === 'file' ? `"${phoneColumn}" column` : 'selected groups or contacts'}. ${invalidPhones.length ? `Invalid numbers: ${invalidPhones.slice(0, 3).join(', ')}` : ''}`);
      }
      setRecipientCount(recipients.length);
      setMessagePreview(previewMessage);
      setIsConfirmModalOpen(true);
      if (invalidPhones.length) {
        setError(`Warning: ${invalidPhones.length} invalid phone numbers skipped (e.g., ${invalidPhones.slice(0, 3).join(', ')}).`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to prepare SMS.');
    }
  };

  const handleSendSMS = async () => {
    setIsSending(true);
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected.');
      let recipients: string[] = [];
      let personalizedMessages: { phone: string; content: string }[] = [];

      if (sendMode === 'instant') {
        if (formData.manualContacts.trim()) {
          recipients = formData.manualContacts
            .split(/[\n,]+/)
            .map(phone => normalizePhone(phone, defaultCountryCode))
            .filter(p => p);
        }
        if (selectedGroups.length) {
          const groupPhones = await fetchRecipients(selectedGroups);
          recipients.push(...groupPhones.map(phone => normalizePhone(phone, defaultCountryCode)).filter(p => p));
        }
      } else if (sendMode === 'campaign') {
        const groups = campaignGroups[selectedCampaignId] || [];
        if (!groups.length) throw new Error('No groups assigned to campaign.');
        recipients = await fetchRecipients(groups.map(g => g.group_id));
      } else if (sendMode === 'file') {
        recipients = uploadedData
          .map(row => normalizePhone(row[phoneColumn] || '', defaultCountryCode))
          .filter(phone => phone);
        if (recipients.length) {
          personalizedMessages = uploadedData
            .map(row => ({
              phone: normalizePhone(row[phoneColumn] || '', defaultCountryCode),
              content: applyPlaceholders(formData.message, row),
            }))
            .filter(msg => msg.phone && recipients.includes(msg.phone));
        }
      }

      if (!recipients.length) {
        throw new Error(`No valid recipients found in ${sendMode === 'file' ? `"${phoneColumn}" column` : 'selected groups or contacts'}. ${invalidPhones.length ? `Invalid numbers: ${invalidPhones.slice(0, 3).join(', ')}` : ''}`);
      }

      if (sendMode === 'file' && personalizedMessages.length) {
        const errors: string[] = [];
        await Promise.all(
          personalizedMessages.map(async (msg, index) => {
            try {
              await sendInstantMessage(currentWorkspaceId, {
                recipients: [msg.phone],
                content: msg.content,
                sender_id: formData.senderId,
              });
            } catch (err: any) {
              errors.push(`Failed to send to ${msg.phone}: ${err.message || 'Unknown error'}`);
            }
          })
        );
        if (errors.length) {
          throw new Error(`Some messages failed to send: ${errors.join('; ')}`);
        }
      } else {
        await sendInstantMessage(currentWorkspaceId, {
          recipients,
          content: formData.message,
          sender_id: formData.senderId,
        });
      }

      setFormData({
        senderId: senderIds[0]?.sender_id || '',
        message: '',
        manualContacts: '',
        campaignName: '',
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        frequency: '',
        template: '',
      });
      setSelectedGroups([]);
      setSelectedCampaignId('');
      setUploadedFile(null);
      setUploadedData([]);
      setAvailableColumns([]);
      setPhoneColumn('');
      setInvalidPhones([]);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
      setIsConfirmModalOpen(false);
    }
  };

  const generateAIMessage = async () => {
    if (!keywords.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setIsGenerating(true);
    try {
      const generatedMessage = await generateMessage(`Generate an SMS message based on: ${keywords}`);
      setFormData(prev => ({ ...prev, message: generatedMessage }));
      setModal('isAIModalOpen', false);
      setKeywords('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  const handleCreateCampaign = async () => {
    if (!formData.campaignName || !selectedGroups.length) {
      setError('Please enter a campaign name and select at least one group.');
      return;
    }
    try {
      const newCampaign = { campaign_id: Date.now().toString(), workspace_id: currentWorkspaceId!, name: formData.campaignName, status: 'active' };
      setCampaigns(prev => [...prev, newCampaign]);
      setSelectedCampaignId(newCampaign.campaign_id);
      setModal('isCreateCampaignOpen', false);
      setFormData(prev => ({ ...prev, campaignName: '' }));
      setSelectedGroups([]);
    } catch (err) {
      setError('Failed to create campaign.');
    }
  };

  const fetchRecipients = async (groupIds: string[]): Promise<string[]> => {
    const recipientPhones: string[] = [];
    for (const groupId of groupIds) {
      try {
        const contacts = await getGroupContacts(currentWorkspaceId!, groupId, 1, 50);
        const phones = (contacts?.contacts || [])
          .map((c: Contact) => normalizePhone(c.phone_number, defaultCountryCode))
          .filter((p: string) => p);
        recipientPhones.push(...phones);
      } catch (err) {
        console.error(`Failed to fetch contacts for group ${groupId}:`, err);
      }
    }
    return [...new Set(recipientPhones)];
  };

  const setModal = (modal: keyof typeof modalState, isOpen: boolean) => {
    setModalState(prev => ({
      isAIModalOpen: false,
      isGroupModalOpen: false,
      isCreateCampaignOpen: false,
      [modal]: isOpen,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <svg className="animate-spin h-6 w-6 text-[#004d66]" viewBox="0 0 24 24" aria-label="Loading">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        <p className="ml-3 text-[#004d66] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-2xl font-semibold text-[#004d66] mb-8">Send SMS</h1>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="border border-red-200 bg-red-50 p-3 text-red-700 text-sm font-medium rounded-md text-center mb-6"
        >
          {error}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-6 border-b border-gray-300 mb-6"
      >
        {['instant', 'campaign', 'file'].map((mode, index) => (
          <button
            key={mode}
            className={`py-2 px-4 text-sm font-medium ${
              sendMode === mode ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600 hover:text-[#FDD70D]'
            }`}
            onClick={() => setSendMode(mode as 'instant' | 'campaign' | 'file')}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              {mode === 'instant' ? 'Instant SMS' : mode === 'campaign' ? 'Campaigns' : 'File Upload'}
            </motion.span>
          </button>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-md p-6 border border-gray-200"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Sender ID</label>
              <select
                value={formData.senderId}
                onChange={(e) => handleInputChange('senderId', e.target.value)}
                className="w-full text-sm py-3 pl-4 pr-4 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                required
              >
                <option value="" className="text-[#004d66]">Select Sender ID</option>
                {senderIds.map(sender => (
                  <option
                    key={sender.sender_id}
                    value={sender.sender_id}
                    className="text-[#004d66]"
                  >
                    {sender.name} ({sender.sender_id})
                  </option>
                ))}
              </select>
            </div>

            {sendMode === 'instant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-4"
              >
                <label className="text-sm font-medium text-gray-600">Contacts</label>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Default Country Code</label>
                  <input
                    type="text"
                    value={defaultCountryCode}
                    onChange={(e) => setDefaultCountryCode(e.target.value)}
                    placeholder="e.g., +255"
                    className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-3">
                  <textarea
                    value={formData.manualContacts}
                    onChange={(e) => handleInputChange('manualContacts', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors resize-none"
                    placeholder="Enter phone numbers (one per line or comma-separated)"
                  />
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      type="button"
                      onClick={() => setModal('isGroupModalOpen', true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#FDD70D] flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Select Group
                    </motion.button>
                  </div>
                </div>
                {selectedGroups.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap gap-2"
                  >
                    {selectedGroups.map(groupId => {
                      const group = groups.find(g => g.group_id === groupId);
                      return (
                        <span
                          key={groupId}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-[#004d66] rounded-full text-sm font-medium"
                        >
                          {group?.name}
                          <button
                            type="button"
                            onClick={() => toggleGroupSelection(groupId)}
                            className="text-[#004d66] hover:text-[#FDD70D]"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}

            {sendMode === 'campaign' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Campaign Action</label>
                  <div className="flex gap-3">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      type="button"
                      onClick={() => setModal('isCreateCampaignOpen', true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#FDD70D] text-sm font-medium transition-colors"
                    >
                      Create New Campaign
                    </motion.button>
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-1/2 text-sm py-3 pl-4 pr-4 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                    >
                      <option value="" className="text-[#004d66]">Select Existing Campaign</option>
                      {campaigns.map(campaign => (
                        <option
                          key={campaign.campaign_id}
                          value={campaign.campaign_id}
                          className="text-[#004d66]"
                        >
                          {campaign.name} ({campaign.status})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedCampaignId && campaignGroups[selectedCampaignId] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-600">Target Groups</label>
                    <div className="flex flex-wrap gap-2">
                      {campaignGroups[selectedCampaignId].map(group => (
                        <span
                          key={group.group_id}
                          className="inline-flex items-center px-3 py-1 bg-gray-100 text-[#004d66] rounded-full text-sm font-medium"
                        >
                          <Users className="w-5 h-5 mr-1" />
                          {group.name}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#004d66]" /> Start Date & Time
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      />
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="space-y-2"
                  >
                    <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#004d66]" /> End Date & Time
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      />
                    </div>
                  </motion.div>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#004d66]" /> Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => handleInputChange('frequency', e.target.value)}
                    className="w-full text-sm py-3 pl-4 pr-4 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                  >
                    <option value="" className="text-[#004d66]">Select frequency</option>
                    <option value="once" className="text-[#004d66]">Send Once</option>
                    <option value="daily" className="text-[#004d66]">Daily</option>
                    <option value="weekly" className="text-[#004d66]">Weekly</option>
                    <option value="monthly" className="text-[#004d66]">Monthly</option>
                  </select>
                </motion.div>
              </motion.div>
            )}

            {sendMode === 'file' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-6"
              >
                <div
                  className={`relative border-2 border-dashed rounded-md p-6 text-center ${
                    uploadedFile
                      ? 'border-[#004d66] bg-gray-100'
                      : 'border-gray-200 hover:border-[#004d66] hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {uploadedFile ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-[#004d66]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#004d66] mb-2">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600 mb-3">File uploaded successfully!</p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-6 h-6 text-[#004d66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#004d66] mb-2">Upload File</p>
                        <p className="text-sm text-gray-600">Drag and drop your CSV/TXT file here</p>
                        <p className="text-sm text-gray-600 mt-1">or click to browse</p>
                      </div>
                    </motion.div>
                  )}
                </div>
                {uploadedData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                    className="bg-white border border-gray-200 p-4 rounded-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-[#004d66]" />
                      <h3 className="text-lg font-medium text-[#004d66]">File Preview</h3>
                    </div>
                    <div className="space-y-2 mb-3">
                      <label className="text-sm font-medium text-gray-600">Phone Number Column</label>
                      <select
                        value={phoneColumn}
                        onChange={(e) => setPhoneColumn(e.target.value)}
                        className="w-full text-sm py-2 pl-4 pr-4 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      >
                        <option value="" className="text-[#004d66]">Select phone column</option>
                        {availableColumns.map(col => (
                          <option key={col} value={col} className="text-[#004d66]">
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2 mb-3">
                      <label className="text-sm font-medium text-gray-600">Default Country Code</label>
                      <input
                        type="text"
                        value={defaultCountryCode}
                        onChange={(e) => setDefaultCountryCode(e.target.value)}
                        placeholder="e.g., +255"
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                      />
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            {availableColumns.map(column => (
                              <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {column}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {uploadedData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              {availableColumns.map(column => (
                                <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">
                                  {row[column]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-between text-sm text-[#004d66]">
                      <span>Showing {Math.min(5, uploadedData.length)} of {uploadedData.length} contacts</span>
                      <span className="text-[#FDD70D]">✓ File validated successfully</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="space-y-2"
            >
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-600">Message</label>
                <div className="flex gap-2">
                  {sendMode === 'file' && availableColumns.length > 0 && (
                    <select
                      onChange={(e) => insertPlaceholder(e.target.value)}
                      className="text-sm py-2 pl-4 pr-4 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
                    >
                      <option value="" className="text-[#004d66]">Insert Placeholder</option>
                      {availableColumns.map(col => (
                        <option key={col} value={col} className="text-[#004d66]">
                          {col}
                        </option>
                      ))}
                    </select>
                  )}
                  <motion.button
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    type="button"
                    onClick={() => setModal('isAIModalOpen', true)}
                    className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#FDD70D] flex items-center gap-2 text-sm font-medium transition-colors"
                  >
                    <Bot className="w-5 h-5" />
                    AI Assist
                  </motion.button>
                </div>
              </div>
              <textarea
                ref={textareaRef}
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors resize-none"
                placeholder={sendMode === 'file' ? "Type your message here... (e.g., Hi {name}, your balance is {amount}!)" : "Type your message here..."}
                required
              />
              <div className="flex justify-end gap-3 text-sm text-[#004d66]">
                <span>{smsCount} SMS</span>
                <span>{charCount}/160</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="flex justify-center"
            >
              <button
                type="button"
                disabled={isSending || !isFormValid()}
                onClick={prepareSendSMS}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md text-sm font-medium hover:bg-[#FDD70D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {sendMode === 'instant' ? 'Sending...' : sendMode === 'campaign' ? 'Launching...' : 'Sending to All...'}
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {sendMode === 'instant' ? 'Send SMS Now' : sendMode === 'campaign' ? 'Launch Campaign' : 'Send to All Contacts'}
                  </>
                )}
              </button>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-md p-6 border border-gray-200 h-[600px] flex items-center justify-center"
        >
          <div className="w-full max-w-[280px] h-[504px] aspect-[9/16] bg-gray-900 rounded-[36px] border-4 border-gray-800 shadow-xl overflow-hidden relative">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1/3 h-4 bg-gray-800 rounded-full"></div>
            <div className="w-full h-full bg-white pt-8 pb-4 px-4">
              <PhonePreview data={{
                senderName: formData.senderId || 'Briq Solutions',
                message: sendMode === 'file' && uploadedData.length ? applyPlaceholders(formData.message, uploadedData[0]) : formData.message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }} />
            </div>
          </div>
        </motion.div>
      </div>

      <Modal
        isOpen={modalState.isAIModalOpen}
        onClose={() => setModal('isAIModalOpen', false)}
        title="Generate AI Message"
        onSubmit={generateAIMessage}
        submitText={isGenerating ? 'Generating...' : 'Generate'}
        isLoading={isGenerating}
        className="font-inter"
        titleClassName="text-[#004d66] text-lg font-semibold"
        buttonClassName="bg-[#004d66] text-white hover:bg-[#FDD70D] transition-colors rounded-md px-4 py-2 text-sm font-medium"
        closeButtonClassName="text-[#004d66] hover:text-[#FDD70D]"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-[#004d66]">Enter a prompt</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., promotional message for summer sale"
            className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
          />
        </motion.div>
      </Modal>

      <Modal
        isOpen={modalState.isGroupModalOpen}
        onClose={() => setModal('isGroupModalOpen', false)}
        title="Select Groups"
        className="font-inter"
        titleClassName="text-[#004d66] text-lg font-semibold"
        buttonClassName="bg-[#004d66] text-white hover:bg-[#FDD70D] transition-colors rounded-md px-4 py-2 text-sm font-medium"
        closeButtonClassName="text-[#004d66] hover:text-[#FDD70D]"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 max-h-48 overflow-y-auto"
        >
          {groups.length ? (
            groups.map((group, index) => (
              <motion.label
                key={group.group_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1) }}
                className="flex items-center gap-2 p-3 hover:bg-gray-50 rounded-md text-[#004d66] text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.group_id)}
                  onChange={() => toggleGroupSelection(group.group_id)}
                  className="w-4 h-4 text-[#004d66] rounded border-gray-200 focus:ring-[#FDD70D]"
                />
                <span>{group.name}</span>
              </motion.label>
            ))
          ) : (
            <p className="text-[#004d66] text-sm text-center py-3">No groups available.</p>
          )}
        </motion.div>
      </Modal>

      <Modal
        isOpen={modalState.isCreateCampaignOpen}
        onClose={() => setModal('isCreateCampaignOpen', false)}
        title="Create Campaign"
        onSubmit={handleCreateCampaign}
        submitText="Create"
        className="font-inter"
        titleClassName="text-[#004d66] text-lg font-semibold"
        buttonClassName="bg-[#004d66] text-white hover:bg-[#FDD70D] transition-colors rounded-md px-4 py-2 text-sm font-medium"
        closeButtonClassName="text-[#004d66] hover:text-[#FDD70D]"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#004d66]">Campaign Name</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => handleInputChange('campaignName', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FDD70D] hover:border-[#004d66] transition-colors"
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#004d66]">Select Groups</label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {groups.map((group, index) => (
                <motion.label
                  key={group.group_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (index + 1) }}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md text-[#004d66] text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedGroups.includes(group.group_id)}
                    onChange={() => toggleGroupSelection(group.group_id)}
                    className="w-4 h-4 text-[#004d66] rounded border-gray-200 focus:ring-[#FDD70D]"
                  />
                  <span>{group.name}</span>
                </motion.label>
              ))}
            </div>
          </div>
        </motion.div>
      </Modal>

  <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm SMS Send"
        onSubmit={handleSendSMS}
        submitText="Confirm Send"
        isLoading={isSending}
        className="font-inter"
        titleClassName="text-[#00333e] text-lg font-semibold"
        buttonClassName="bg-[#00333e] text-white hover:bg-[#FDD70D] hover:text-[#004d66] transition-colors rounded-md px-4 py-2 text-sm font-medium"
        closeButtonClassName="text-[#004d66] hover:text-[#FDD70D]"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4 text-[#004d66]"
        >
          <p className="text-sm">
            You are about to send <strong>{smsCount * recipientCount}</strong> SMS messages to <strong>{recipientCount}</strong> recipients.
          </p>
          <div className="bg-gray-100 p-4 rounded-md border border-gray-200">
            <p className="text-sm font-medium text-[#004d66]">Message Preview:</p>
            <p className="text-sm text-[#004d66] mt-2 break-words">{messagePreview}</p>
          </div>
          <p className="text-sm">Please confirm to proceed with sending.</p>
        </motion.div>
      </Modal>
    </div>
  );
};

export default SendSMS;
export { SendSMS };