import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Upload, Users, Calendar, MessageSquare, FileText, Send, Bot } from 'lucide-react';
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
interface ColumnMapping { [key: string]: 'name' | 'phone_number' | 'email' | 'message' | ''; }

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
  const [parsedContacts, setParsedContacts] = useState<string[]>([]);
  const [uploadedData, setUploadedData] = useState<UploadedRow[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping>({});
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [keywords, setKeywords] = useState('');
  const [modalState, setModalState] = useState({
    isAIModalOpen: false,
    isGroupModalOpen: false,
    isImportModalOpen: false,
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

  const normalizePhone = (phone: string): string => {
    if (!phone || !/^\+?\d{10,15}$/.test(phone.trim())) return '';
    let normalized = phone.trim();
    if (!normalized.startsWith('+')) {
      normalized = '+' + normalized.replace(/^0/, '');
    }
    return normalized.replace(/[^0-9+]/g, '');
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
        const rows = text.split('\n').map(row => {
          const columns = row.split(',').map(col => col.trim());
          const obj: UploadedRow = {};
          columns.forEach((col, index) => {
            obj[`column${index + 1}`] = col;
          });
          return obj;
        });
        if (rows.length > 10000) {
          reject(new Error('File exceeds 10,000 rows.'));
          return;
        }
        if (rows.length === 0 || Object.keys(rows[0]).length === 0) {
          reject(new Error('No valid data found in file.'));
          return;
        }
        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.txt')) {
        setUploadedFile(file);
        try {
          const data = await parseFileRecipients(file);
          setUploadedData(data);
          setStep(2);
        } catch (err: any) {
          setError(err.message || 'Failed to parse file.');
        }
      } else {
        setError('Please upload a CSV, Excel, or TXT file.');
      }
    }
  };

  const handleColumnMapping = (column: string, value: 'name' | 'phone_number' | 'email' | 'message' | '') => {
    setColumnMappings(prev => ({ ...prev, [column]: value }));
  };

  const handleConfirmMapping = () => {
    const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
    const messageColumn = Object.entries(columnMappings).find(([_, value]) => value === 'message')?.[0];
    if (!phoneColumn) {
      setError('Please map a phone number column.');
      return;
    }
    const mappedContacts = uploadedData
      .map(row => {
        const phone = normalizePhone(row[phoneColumn] || '');
        const name = columnMappings[Object.keys(row)[0]] === 'name' ? row[Object.keys(row)[0]] : '';
        const message = messageColumn ? row[messageColumn] : formData.message;
        return { phone_number: phone, name, message };
      })
      .filter(contact => contact.phone_number);
    if (!mappedContacts.length) {
      setError('No valid contacts found in the uploaded file.');
      return;
    }
    setParsedContacts(mappedContacts.map(c => c.phone_number));
    setFormData(prev => ({
      ...prev,
      message: applyPlaceholders(mappedContacts[0]?.message || prev.message, mappedContacts[0]?.name || ''),
    }));
    setStep(1);
  };

  const applyPlaceholders = (message: string, name: string) => {
    return message.replace(/{name}/g, name || 'Customer');
  };

  const isFormValid = () => {
    if (!formData.senderId || !formData.message.trim()) return false;
    if (sendMode === 'instant' && !formData.manualContacts.trim() && !selectedGroups.length) return false;
    if (sendMode === 'campaign' && !selectedCampaignId) return false;
    if (sendMode === 'file' && !parsedContacts.length) return false;
    return true;
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isFormValid()) {
      setError('Please fill in all required fields.');
      return;
    }
    setIsSending(true);
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected.');
      let recipients: string[] = [];
      let personalizedMessages: { phone: string; content: string }[] = [];

      if (sendMode === 'instant') {
        if (formData.manualContacts.trim()) {
          recipients = formData.manualContacts
            .split(/[\n,]+/)
            .map(normalizePhone)
            .filter(p => p);
        }
        if (selectedGroups.length) {
          const groupPhones = await fetchRecipients(selectedGroups);
          recipients.push(...groupPhones.map(normalizePhone).filter(p => p));
        }
      } else if (sendMode === 'campaign') {
        const groups = campaignGroups[selectedCampaignId] || [];
        if (!groups.length) throw new Error('No groups assigned to campaign.');
        recipients = await fetchRecipients(groups.map(g => g.group_id));
      } else if (sendMode === 'file') {
        const nameColumn = Object.entries(columnMappings).find(([_, value]) => value === 'name')?.[0];
        const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
        const messageColumn = Object.entries(columnMappings).find(([_, value]) => value === 'message')?.[0];
        personalizedMessages = uploadedData
          .map(row => ({
            phone: normalizePhone(row[phoneColumn!] || ''),
            content: applyPlaceholders(messageColumn ? row[messageColumn] : formData.message, nameColumn ? row[nameColumn] : ''),
          }))
          .filter(msg => msg.phone);
        recipients = personalizedMessages.map(msg => msg.phone);
      }

      if (!recipients.length) throw new Error('No valid recipients found.');
      if (sendMode === 'file' && personalizedMessages.length) {
        await Promise.all(
          personalizedMessages.map(msg =>
            sendInstantMessage(currentWorkspaceId, {
              recipients: [msg.phone],
              content: msg.content,
              sender_id: formData.senderId,
            })
          )
        );
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
      setParsedContacts([]);
      setUploadedData([]);
      setColumnMappings({});
      setStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to send SMS.');
    } finally {
      setIsSending(false);
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

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      parseFileRecipients(e.target.files[0])
        .then((phones) => {
          setFormData(prev => ({ ...prev, manualContacts: phones.map(row => normalizePhone(row.column1)).filter(p => p).join('\n') }));
          setModal('isImportModalOpen', false);
        })
        .catch((err) => setError(err.message));
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
          .map((c: Contact) => c.phone_number)
          .filter((p: string) => p && /^\+?\d{10,15}$/.test(p.trim()));
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
      isImportModalOpen: false,
      isCreateCampaignOpen: false,
      [modal]: isOpen,
    }));
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center items-center h-48"
      >
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#004d66]" />
        <p className="ml-2 text-[#004d66] text-sm font-medium font-inter">Loading...</p>
      </motion.div>
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
              sendMode === mode ? 'border-b-2 border-[#004d66] text-[#004d66]' : 'text-gray-600 hover:text-[#f4a261]'
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
              <div className="relative">
                <select
                  value={formData.senderId}
                  onChange={(e) => handleInputChange('senderId', e.target.value)}
                  className="w-full text-sm py-3 pl-4 pr-10 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
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
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-4 h-4 text-[#004d66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {sendMode === 'instant' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-4"
              >
                <label className="text-sm font-medium text-gray-600">Contacts</label>
                <div className="flex flex-col gap-3">
                  <textarea
                    value={formData.manualContacts}
                    onChange={(e) => handleInputChange('manualContacts', e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors resize-none"
                    placeholder="Enter phone numbers (one per line or comma-separated)"
                  />
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      type="button"
                      onClick={() => setModal('isGroupModalOpen', true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#f4a261] flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Users className="w-5 h-5" />
                      Select Group
                    </motion.button>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      type="button"
                      onClick={() => setModal('isImportModalOpen', true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#f4a261] flex items-center gap-2 text-sm font-medium transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                      Upload
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
                            className="text-[#004d66] hover:text-[#f4a261]"
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
                      className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#f4a261] text-sm font-medium transition-colors"
                    >
                      Create New Campaign
                    </motion.button>
                    <div className="relative w-1/2">
                      <select
                        value={selectedCampaignId}
                        onChange={(e) => setSelectedCampaignId(e.target.value)}
                        className="w-full text-sm py-3 pl-4 pr-10 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
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
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-[#004d66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
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
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
                      />
                      <input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
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
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
                      />
                      <input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                        className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
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
                  <div className="relative">
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="w-full text-sm py-3 pl-4 pr-10 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
                    >
                      <option value="" className="text-[#004d66]">Select frequency</option>
                      <option value="once" className="text-[#004d66]">Send Once</option>
                      <option value="daily" className="text-[#004d66]">Daily</option>
                      <option value="weekly" className="text-[#004d66]">Weekly</option>
                      <option value="monthly" className="text-[#004d66]">Monthly</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-[#004d66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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
                {step === 1 && (
                  <div
                    className={`relative border-2 border-dashed rounded-md p-6 text-center ${
                      uploadedFile
                        ? 'border-[#004d66] bg-gray-100'
                        : 'border-gray-200 hover:border-[#004d66] hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="file"
                      accept=".csv,.xlsx,.xls,.txt"
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
                          <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.45 }}
                            onClick={() => setStep(2)}
                            className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md text-sm font-medium hover:bg-[#f4a261] transition-colors"
                          >
                            Map Columns
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <Upload className="w-6 h-6 text-[#004d66]" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#004d66] mb-2">Upload File</p>
                          <p className="text-sm text-gray-600">Drag and drop your file here</p>
                          <p className="text-sm text-gray-600 mt-1">or click to browse</p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {step === 2 && uploadedData.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px] border border-gray-200 rounded-md">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="sticky top-0 bg-gray-100">
                          <tr>
                            {Object.keys(uploadedData[0]).map((column) => (
                              <th key={column} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <div className="relative">
                                  <select
                                    value={columnMappings[column] || ''}
                                    onChange={(e) => handleColumnMapping(column, e.target.value as 'name' | 'phone_number' | 'email' | 'message' | '')}
                                    className="w-full text-sm py-2 pl-4 pr-10 border border-gray-200 rounded-md bg-white text-[#004d66] focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
                                  >
                                    <option value="" className="text-[#004d66]">Select...</option>
                                    <option value="name" className="text-[#004d66]">Name</option>
                                    <option value="phone_number" className="text-[#004d66]">Phone Number</option>
                                    <option value="email" className="text-[#004d66]">Email</option>
                                    <option value="message" className="text-[#004d66]">Message</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg className="w-4 h-4 text-[#004d66]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {uploadedData.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              {Object.values(row).map((value, i) => (
                                <td
                                  key={i}
                                  className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]"
                                >
                                  {value}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.45 }}
                        onClick={() => { setStep(1); setUploadedFile(null); setUploadedData([]); }}
                        className="px-4 py-2 bg-gray-200 text-[#004d66] rounded-md text-sm font-medium hover:bg-gray-300 transition-colors"
                      >
                        Back
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={handleConfirmMapping}
                        className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md text-sm font-medium hover:bg-[#f4a261] transition-colors"
                      >
                        Confirm Mapping
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {parsedContacts.length > 0 && step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white border border-gray-200 p-4 rounded-md"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-5 h-5 text-[#004d66]" />
                      <h3 className="text-lg font-medium text-[#004d66]">File Preview</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {uploadedData.slice(0, 5).map((row, index) => {
                            const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
                            const nameColumn = Object.entries(columnMappings).find(([_, value]) => value === 'name')?.[0];
                            const messageColumn = Object.entries(columnMappings).find(([_, value]) => value === 'message')?.[0];
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{phoneColumn ? normalizePhone(row[phoneColumn]) : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{nameColumn ? row[nameColumn] : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#004d66]">{messageColumn ? row[messageColumn] : ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#f4a261]">{phoneColumn && normalizePhone(row[phoneColumn]) ? 'Valid' : 'Invalid'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-between text-sm text-[#004d66]">
                      <span>Showing {Math.min(5, uploadedData.length)} of {uploadedData.length} contacts</span>
                      <span className="text-[#f4a261]">✓ File validated successfully</span>
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
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  type="button"
                  onClick={() => setModal('isAIModalOpen', true)}
                  className="px-4 py-2 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md hover:bg-[#f4a261] flex items-center gap-2 text-sm font-medium transition-colors"
                >
                  <Bot className="w-5 h-5" />
                  AI Assist
                </motion.button>
              </div>
              <textarea
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                rows={6}
                className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors resize-none"
                placeholder="Type your message here... (e.g., Hi {name}, your balance is updated!)"
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
                type="submit"
                disabled={isSending || !isFormValid()}
                onClick={handleSendSMS}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#004d66] to-[#004d66] text-white rounded-md text-sm font-medium hover:bg-[#f4a261] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          className="rounded-md p-6 border-gray-200 h-[600px] flex items-center justify-center"
        >
          <PhonePreview data={{
            senderName: formData.senderId || 'Briq Solutions',
            message: formData.message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }} />
        </motion.div>
      </div>

      <Modal
        isOpen={modalState.isAIModalOpen}
        onClose={() => setModal('isAIModalOpen', false)}
        title="Generate AI Message"
        onSubmit={generateAIMessage}
        submitText={isGenerating ? 'Generating...' : 'Generate'}
        isLoading={isGenerating}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-gray-600">Enter a prompt</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., promotional message for summer sale"
            className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
          />
        </motion.div>
      </Modal>

      <Modal
        isOpen={modalState.isGroupModalOpen}
        onClose={() => setModal('isGroupModalOpen', false)}
        title="Select Groups"
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
                  className="w-4 h-4 text-[#004d66] rounded border-gray-200 focus:ring-[#f4a261]"
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
        isOpen={modalState.isImportModalOpen}
        onClose={() => setModal('isImportModalOpen', false)}
        title="Import Contacts"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <label className="text-sm font-medium text-gray-600">Upload CSV/TXT file</label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileImport}
            className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
          />
          <p className="text-sm text-gray-600">Upload CSV/TXT with phone numbers (one per line or comma-separated).</p>
        </motion.div>
      </Modal>

      <Modal
        isOpen={modalState.isCreateCampaignOpen}
        onClose={() => setModal('isCreateCampaignOpen', false)}
        title="Create Campaign"
        onSubmit={handleCreateCampaign}
        submitText="Create"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Campaign Name</label>
            <input
              type="text"
              value={formData.campaignName}
              onChange={(e) => handleInputChange('campaignName', e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-md text-[#004d66] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#f4a261] hover:border-[#004d66] transition-colors"
              placeholder="Enter campaign name"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Select Groups</label>
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
                    className="w-4 h-4 text-[#004d66] rounded border-gray-200 focus:ring-[#f4a261]"
                  />
                  <span>{group.name}</span>
                </motion.label>
              ))}
            </div>
          </div>
        </motion.div>
      </Modal>
    </div>
  );
};

export default SendSMS;
export { SendSMS };