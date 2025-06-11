import React, { useState, useEffect } from 'react';
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

interface Campaign { campaign_id: string; workspace_id: string; name: string; }
interface Group { group_id: string; name: string; }
interface SenderId { sender_id: string; name: string; is_approved: boolean; }
interface Contact { contact_id: string; phone_number: string; }
interface UploadedRow { [key: string]: string; }
interface ColumnMapping { [key: string]: 'name' | 'phone_number' | 'email' | ''; }

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
      if (!selectedCampaignId) return;
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

  const parseFileRecipients = (file: File): Promise<UploadedRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').map(row => {
          const columns = row.split(',').map(col => col.trim());
          const obj: UploadedRow = {};
          columns.forEach((col, index) => {
            obj[`column${index + 1}`] = col;
          });
          return obj;
        });
        resolve(rows);
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsText(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.txt')) {
        setUploadedFile(file);
        try {
          const data = await parseFileRecipients(file);
          setUploadedData(data);
          setStep(2); // Move to mapping step
          setError(null);
        } catch (err: any) {
          setError(err.message || 'Failed to parse file.');
        }
      } else {
        setError('Please upload a CSV, Excel, or TXT file.');
      }
    }
  };

  const handleColumnMapping = (column: string, value: 'name' | 'phone_number' | 'email' | '') => {
    setColumnMappings(prev => ({ ...prev, [column]: value }));
  };

  const handleConfirmMapping = () => {
    const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
    if (!phoneColumn) {
      setError('Please map a phone number column.');
      return;
    }
    const mappedContacts = uploadedData.map(row => {
      const phone = row[phoneColumn];
      const name = columnMappings[Object.keys(row)[0]] === 'name' ? row[Object.keys(row)[0]] : '';
      return { phone_number: phone, name };
    }).filter(contact => contact.phone_number && /^\+?\d{10,15}$/.test(contact.phone_number));
    setParsedContacts(mappedContacts.map(c => c.phone_number));
    setFormData(prev => ({ ...prev, message: applyPlaceholders(prev.message, mappedContacts[0]?.name || '') }));
    setStep(1); // Return to upload step after mapping
  };

  const applyPlaceholders = (message: string, name: string) => {
    return message.replace(/{name}/g, name);
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSending(true);
    try {
      if (!currentWorkspaceId) throw new Error('No workspace selected.');
      if (!formData.senderId) throw new Error('Please select a sender ID.');
      if (!formData.message.trim()) throw new Error('Please enter a message.');

      let recipients: string[] = [];
      let personalizedMessages: { phone: string; content: string }[] = [];

      if (sendMode === 'instant') {
        if (formData.manualContacts.trim()) {
          recipients = formData.manualContacts
            .split(/[\n,]+/)
            .map((p) => p.trim())
            .filter((p) => p && /^\+?\d{10,15}$/.test(p));
        }
        if (selectedGroups.length) {
          const groupPhones = await fetchRecipients(selectedGroups);
          recipients.push(...groupPhones);
        }
      } else if (sendMode === 'campaign') {
        if (!selectedCampaignId) throw new Error('Please select a campaign.');
        const groups = campaignGroups[selectedCampaignId] || [];
        if (!groups.length) throw new Error('No groups assigned to campaign.');
        recipients = await fetchRecipients(groups.map(g => g.group_id));
      } else if (sendMode === 'file') {
        if (!parsedContacts.length) throw new Error('No valid recipients found in file.');
        const nameColumn = Object.entries(columnMappings).find(([_, value]) => value === 'name')?.[0];
        const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
        personalizedMessages = uploadedData.map(row => ({
          phone: row[phoneColumn!],
          content: applyPlaceholders(formData.message, nameColumn ? row[nameColumn] : ''),
        })).filter(msg => msg.phone && /^\+?\d{10,15}$/.test(msg.phone));
        recipients = personalizedMessages.map(msg => msg.phone);
      }

      if (!recipients.length) throw new Error('No valid recipients found.');
      if (sendMode === 'file' && personalizedMessages.length) {
        await Promise.all(personalizedMessages.map(msg =>
          sendInstantMessage(currentWorkspaceId, {
            recipients: [msg.phone],
            content: msg.content,
            sender_id: formData.senderId,
          })
        ));
      } else {
        await sendInstantMessage(currentWorkspaceId, {
          recipients,
          content: formData.message,
          sender_id: formData.senderId,
        });
      }

      setFormData(prev => ({ ...prev, message: '', manualContacts: '', campaignName: '', startDate: '', startTime: '', endDate: '', endTime: '', frequency: '', template: '' }));
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
      setModalState(prev => ({ ...prev, isAIModalOpen: false }));
      setKeywords('');
    } catch (err: any) {
      setError(err.message || 'Failed to generate message.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFileRecipients(e.target.files[0])
        .then((phones) => {
          setFormData(prev => ({ ...prev, manualContacts: phones.join('\n') }));
          setModalState(prev => ({ ...prev, isImportModalOpen: false }));
        })
        .catch((err) => setError(err.message));
    }
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups(prev => prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00333e]" />
        <p className="ml-2 text-[#00333e] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-white p-4">
      {error && (
        <div className="border border-gray-200 bg-white p-3 text-[#00333e] text-xs text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-[#00333e] text-center">Send SMS</h1>
        <p className="text-[#00333e] text-xs text-center">Send messages instantly, create campaigns, or upload files</p>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left Panel */}
          <div className="flex-1">
            {/* Mode Selection */}
            <div className="grid grid-cols-3 gap-2 mb-4 border-b border-gray-200">
              {['instant', 'campaign', 'file'].map((mode) => {
                const IconComponent = mode === 'instant' ? MessageSquare : mode === 'campaign' ? Calendar : FileText;
                const isActive = sendMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setSendMode(mode as 'instant' | 'campaign' | 'file')}
                    className={`p-2 flex items-center justify-center gap-1 text-xs font-medium rounded ${
                      isActive
                        ? 'bg-gray-100 text-[#00333e] border-b-2 border-[#00333e]'
                        : 'text-[#00333e] hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="capitalize">{mode.replace('instant', 'Instant SMS')}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Content */}
            <div className="space-y-4">
              {/* Sender ID */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#00333e]">Sender ID</label>
                <select
                  value={formData.senderId}
                  onChange={(e) => handleInputChange('senderId', e.target.value)}
                  className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                  required
                >
                  <option value="">Select Sender ID</option>
                  {senderIds.map(sender => (
                    <option key={sender.sender_id} value={sender.sender_id}>
                      {sender.name} ({sender.sender_id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode-Specific Fields */}
              {sendMode === 'instant' && (
                <div className="space-y-4">
                  <label className="block text-xs font-medium text-[#00333e]">Contacts</label>
                  <div className="flex flex-col lg:flex-row gap-2">
                    <textarea
                      value={formData.manualContacts}
                      onChange={(e) => handleInputChange('manualContacts', e.target.value)}
                      rows={4}
                      className="flex-1 w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white resize-none"
                      placeholder="Enter phone numbers (one per line or comma-separated)"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setModalState(prev => ({ ...prev, isGroupModalOpen: true }))}
                        className="p-2 bg-gray-100 text-[#00333e] rounded hover:bg-gray-200 flex items-center gap-1 text-xs font-medium"
                      >
                        <Users className="w-4 h-4" />
                        <span>Select Group</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModalState(prev => ({ ...prev, isImportModalOpen: true }))}
                        className="p-2 bg-gray-100 text-[#00333e] rounded hover:bg-gray-200 flex items-center gap-1 text-xs font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Upload</span>
                      </button>
                    </div>
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedGroups.map(groupId => {
                        const group = groups.find(g => g.group_id === groupId);
                        return (
                          <span
                            key={groupId}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-[#00333e] rounded-full text-xs font-medium"
                          >
                            {group?.name}
                            <button
                              type="button"
                              onClick={() => toggleGroupSelection(groupId)}
                              className="text-[#00333e] hover:text-gray-700"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {sendMode === 'campaign' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#00333e]">Campaign Name</label>
                    <input
                      type="text"
                      value={formData.campaignName}
                      onChange={(e) => handleInputChange('campaignName', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                      placeholder="Enter campaign name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#00333e]">Select Campaign</label>
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                      required
                    >
                      <option value="">Select a campaign</option>
                      {campaigns.map(campaign => (
                        <option key={campaign.campaign_id} value={campaign.campaign_id}>
                          {campaign.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedCampaignId && campaignGroups[selectedCampaignId] && (
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#00333e]">Target Groups</label>
                      <div className="flex flex-wrap gap-2">
                        {campaignGroups[selectedCampaignId].map(group => (
                          <span
                            key={group.group_id}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 text-[#00333e] rounded-full text-xs font-medium"
                          >
                            <Users className="w-3 h-3 mr-1" />
                            {group.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#00333e] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Start Date & Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                        />
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => handleInputChange('startTime', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#00333e] flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> End Date & Time
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                        />
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => handleInputChange('endTime', e.target.value)}
                          className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs font-medium text-[#00333e] flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => handleInputChange('frequency', e.target.value)}
                      className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
                    >
                      <option value="">Select frequency</option>
                      <option value="once">Send Once</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
              )}

              {sendMode === 'file' && (
                <div className="space-y-4">
                  {step === 1 && (
                    <div
                      className={`relative border-2 border-dashed rounded p-4 text-center ${
                        uploadedFile
                          ? 'border-[#00333e] bg-gray-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls,.txt"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {uploadedFile ? (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-[#00333e]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#00333e] mb-1">{uploadedFile.name}</p>
                            <p className="text-xs text-[#00333e]">File uploaded successfully!</p>
                            <button
                              onClick={() => setStep(2)}
                              className="mt-2 px-3 py-1 bg-[#00333e] text-white rounded text-xs hover:bg-gray-800"
                            >
                              Map Columns
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <Upload className="w-6 h-6 text-[#00333e]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#00333e] mb-1">Upload File</p>
                            <p className="text-xs text-[#00333e]">Drag and drop your file here</p>
                            <p className="text-xs text-[#00333e] mt-1">or click to browse</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {step === 2 && uploadedData.length > 0 && (
                    <div>
                      <div className="overflow-x-auto max-h-[300px] sm:max-h-[400px] border border-gray-200 rounded-lg">
                        <table className="w-full text-left text-gray-700">
                          <thead className="sticky top-0 bg-gray-100">
                            <tr>
                              {Object.keys(uploadedData[0]).map((column) => (
                                <th key={column} className="p-2 sm:p-3 min-w-[120px]">
                                  <select
                                    value={columnMappings[column] || ''}
                                    onChange={(e) => handleColumnMapping(column, e.target.value as 'name' | 'phone_number' | 'email' | '')}
                                    className="w-full text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                                  >
                                    <option value="">Select...</option>
                                    <option value="name">Name</option>
                                    <option value="phone_number">Phone Number</option>
                                    <option value="email">Email</option>
                                  </select>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {uploadedData.map((row, index) => (
                              <tr key={index} className="border-b border-gray-200">
                                {Object.values(row).map((value, i) => (
                                  <td
                                    key={i}
                                    className="p-2 sm:p-3 text-xs sm:text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis"
                                  >
                                    {value}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 flex justify-end gap-2">
                        <button
                          onClick={() => { setStep(1); setUploadedFile(null); setUploadedData([]); }}
                          className="px-3 py-1 bg-gray-200 text-[#00333e] rounded text-xs hover:bg-gray-300"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleConfirmMapping}
                          className="px-3 py-1 bg-[#00333e] text-white rounded text-xs hover:bg-gray-800"
                        >
                          Confirm Mapping
                        </button>
                      </div>
                    </div>
                  )}

                  {parsedContacts.length > 0 && step === 1 && (
                    <div className="bg-white border border-gray-200 p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <Users className="w-4 h-4 text-[#00333e]" />
                        <h3 className="text-sm font-medium text-[#00333e]">File Preview</h3>
                      </div>
                      <table className="w-full text-xs text-[#00333e]">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="pb-1 text-left">Phone Number</th>
                            <th className="pb-1 text-left">Name</th>
                            <th className="pb-1 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadedData.slice(0, 5).map((row, index) => {
                            const phoneColumn = Object.entries(columnMappings).find(([_, value]) => value === 'phone_number')?.[0];
                            const nameColumn = Object.entries(columnMappings).find(([_, value]) => value === 'name')?.[0];
                            return (
                              <tr key={index} className="border-b border-gray-200 last:border-0">
                                <td className="py-1">{phoneColumn ? row[phoneColumn] : ''}</td>
                                <td className="py-1">{nameColumn ? row[nameColumn] : ''}</td>
                                <td className="py-1 text-[#fddf0d]">Valid</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      <div className="mt-2 flex justify-between text-xs text-[#00333e]">
                        <span>Showing {Math.min(5, uploadedData.length)} of {uploadedData.length} contacts</span>
                        <span>✓ File validated successfully</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Message Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-[#00333e]">Message</label>
                  <button
                    type="button"
                    onClick={() => setModalState(prev => ({ ...prev, isAIModalOpen: true }))}
                    className="p-2 bg-gray-100 text-[#00333e] rounded hover:bg-gray-200 flex items-center gap-1 text-xs font-medium"
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Assist</span>
                  </button>
                </div>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  rows={6}
                  className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white resize-none"
                  placeholder="Type your message here... (e.g., Hi {name}, your balance is updated!)"
                  required
                />
                <div className="flex justify-end gap-2 text-xs text-[#00333e]">
                  <span>{smsCount} SMS</span>
                  <span>{charCount}/160</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={isSending}
                  onClick={handleSendSMS}
                  className={`w-full p-2 bg-[#00333e] text-white rounded hover:bg-gray-800 transition-colors duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 ${
                    isSending ? 'bg-gray-500' : ''
                  }`}
                >
                  {isSending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {sendMode === 'instant' ? 'Sending...' : sendMode === 'campaign' ? 'Launching...' : 'Sending to All...'}
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {sendMode === 'instant' ? 'Send SMS Now' : sendMode === 'campaign' ? 'Launch Campaign' : 'Send to All Contacts'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Panel - Phone Preview */}
          <div className="w-full lg:w-96 h-[600px]  border-gray-200 p-4 flex items-center justify-center">
            <PhonePreview data={{
              senderName: formData.senderId || 'Briq Solutions',
              message: formData.message || 'You have received 50,000 TZs from BriqPay. Your new balance is 75,000. Keep Using Briq',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }} />
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalState.isAIModalOpen}
        onClose={() => setModalState(prev => ({ ...prev, isAIModalOpen: false }))}
        title="Generate AI Message"
        onSubmit={generateAIMessage}
        submitText={isGenerating ? 'Generating...' : 'Generate'}
        isLoading={isGenerating}
      >
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#00333e]">Enter a prompt</label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="e.g., promotional message for summer sale"
            className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
          />
        </div>
      </Modal>
      <Modal
        isOpen={modalState.isGroupModalOpen}
        onClose={() => setModalState(prev => ({ ...prev, isGroupModalOpen: false }))}
        title="Select Groups"
      >
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {groups.length ? (
            groups.map((group) => (
              <label key={group.group_id} className="flex items-center gap-1 p-2 hover:bg-gray-50 rounded text-[#00333e] text-xs">
                <input
                  type="checkbox"
                  checked={selectedGroups.includes(group.group_id)}
                  onChange={() => toggleGroupSelection(group.group_id)}
                  className="w-4 h-4 text-[#00333e] rounded"
                />
                <span>{group.name}</span>
              </label>
            ))
          ) : (
            <p className="text-[#00333e] text-xs text-center py-2">No groups available.</p>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={modalState.isImportModalOpen}
        onClose={() => setModalState(prev => ({ ...prev, isImportModalOpen: false }))}
        title="Import Contacts"
      >
        <div className="space-y-2">
          <label className="block text-xs font-medium text-[#00333e]">Upload CSV/TXT file</label>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileImport}
            className="w-full p-2 border border-gray-200 rounded text-[#00333e] text-sm bg-white"
          />
          <p className="text-xs text-[#00333e]">Upload CSV/TXT with phone numbers (one per line or comma-separated).</p>
        </div>
      </Modal>
    </div>
  );
};

export default SendSMS;