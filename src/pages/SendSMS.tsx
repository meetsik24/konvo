import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, Clock, Users, BarChart2, Bot, CheckCircle, Upload, X } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext.tsx';
import {
  getApprovedSenderIds,
  sendInstantMessage,
  getMessageLogs,
  getWorkspaceGroups,
  generateMessage,
  getContacts,
  getGroupContacts,
} from '../services/api.tsx';
import Papa from 'papaparse';
import CampaignModal from './CampaignModal.tsx';

interface Campaign {
  campaign_id: string;
  name: string;
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

interface UploadedContact {
  phone_number?: string;
  [key: string]: any;
}

const FALLBACK_SENDER_IDS: SenderId[] = [
  { sender_id: 'default_sender', name: 'Default Sender', is_approved: true },
];

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onSubmit?: () => void;
  submitText?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onSubmit, submitText = 'Submit' }) => {
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
        className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-[#00333e]">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-[#00333e]">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </motion.button>
          {onSubmit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubmit}
              className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
            >
              {submitText}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const ModeTabs: React.FC<{ mode: string; setMode: (mode: 'contacts' | 'campaign' | 'file') => void }> = ({ mode, setMode }) => (
  <div className="flex border-b border-gray-200 mb-4">
    {['Instant SMS', 'Campaign SMS', 'File SMS'].map((label, i) => (
      <button
        key={label}
        onClick={() => {
          console.log(`Switching to mode: ${['contacts', 'campaign', 'file'][i]}`);
          setMode(['contacts', 'campaign', 'file'][i] as 'contacts' | 'campaign' | 'file');
        }}
        className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
          mode === ['contacts', 'campaign', 'file'][i]
            ? 'border-b-2 border-[#00333e] text-[#00333e]'
            : 'text-gray-600 hover:text-[#00333e]'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const SmsForm: React.FC<{
  mode: string;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  ui: UiState;
  setUi: React.Dispatch<React.SetStateAction<UiState>>;
  senderIds: SenderId[];
  validGroups: Group[];
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateAi: () => void;
}> = ({ mode, form, setForm, ui, setUi, senderIds, validGroups, onSubmit, onFileUpload, onGenerateAi }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-[#00333e] mb-1">Sender ID</label>
      <select
        className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
        value={form.senderId}
        onChange={(e) => {
          console.log('Selected sender ID:', e.target.value);
          setForm({ ...form, senderId: e.target.value });
        }}
        required
      >
        <option value="" disabled>Select Sender ID</option>
        {senderIds.map((sender) => (
          <option key={sender.sender_id} value={sender.sender_id}>
            {sender.name}
          </option>
        ))}
      </select>
    </div>
    {mode === 'campaign' && (
      <div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            console.log('Opening campaign modal...');
            setUi({ ...ui, modals: { ...ui.modals, campaign: true } });
          }}
          className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
        >
          <Users className="w-5 h-5" />
          Select Campaign
        </motion.button>
        {form.campaignId && (
          <p className="text-sm text-gray-600 mt-1">
            Selected: {form.campaignId} {form.schedule && `(Scheduled: ${new Date(form.schedule).toLocaleString()})`}
          </p>
        )}
      </div>
    )}
    {mode === 'contacts' && (
      <div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.useAllContacts}
              onChange={() => {
                console.log('Toggling all contacts:', !form.useAllContacts);
                setForm({
                  ...form,
                  useAllContacts: !form.useAllContacts,
                  contacts: form.useAllContacts ? 'form.contacts' : '',
                  groups: form.useAllContacts ? [] : form.groups,
                });
              }}
              className="w-4 h-4"
            />
            <span className="text-sm font-medium text-[#00333e]">Send to All Contacts</span>
          </label>
          {form.useAllContacts && (
            <p className="text-sm text-gray-600 mt-1">
              This will send the SMS to all contacts in the workspace.
            </p>
          )}
        </div>
        {!form.useAllContacts && (
          <>
            <div>
              <label className="block text-sm font-medium text-[#00333e] mb-1">Contacts</label>
              <textarea
                className="w-full min-h-[80px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
                placeholder="Enter phone numbers (e.g., +255788344348, one per line or comma-separated)"
                value={form.contacts}
                onChange={(e) => {
                  console.log('Updating contacts:', e.target.value);
                  setForm({ ...form, contacts: e.target.value });
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  console.log('Opening group modal...');
                  setUi({ ...ui, modals: { ...ui.modals, group: true } });
                }}
                className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d]"
              >
                Select Groups
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => {
                  console.log('Opening import modal...');
                  setUi({ ...ui, modals: { ...ui.modals, import: true } });
                }}
                className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d]"
              >
                Import Contacts
              </motion.button>
            </div>
            {form.groups.length > 0 && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-[#00333e] mb-1">Selected Groups</label>
                <div className="flex flex-wrap gap-2">
                  {form.groups.map((groupId) => {
                    const group = validGroups.find((g) => g.group_id === groupId);
                    return group ? (
                      <span
                        key={groupId}
                        className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded-lg"
                      >
                        {group.name}
                        <button
                          onClick={() => {
                            console.log('Removing group:', groupId);
                            setForm({ ...form, groups: form.groups.filter((id) => id !== groupId) });
                          }}
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
    {mode === 'file' && (
      <div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign Name</label>
          <input
            type="text"
            className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
            placeholder="Enter campaign name"
            value={form.campaignName}
            onChange={(e) => {
              console.log('Updating campaign name:', e.target.value);
              setForm({ ...form, campaignName: e.target.value });
            }}
            required
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            console.log('Opening file modal...');
            setUi({ ...ui, modals: { ...ui.modals, file: true } });
          }}
          className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
        >
          <Upload className="w-5 h-5" />
          Upload File
        </motion.button>
      </div>
    )}
    {(mode === 'contacts' || mode === 'campaign') && (
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-[#00333e]">Message</label>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => {
              console.log('Opening AI modal...');
              setUi({ ...ui, modals: { ...ui.modals, ai: true } });
            }}
            className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d] flex items-center gap-1"
          >
            <Bot className="w-4 h-4" />
            Generate with AI
          </motion.button>
        </div>
        <textarea
          className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
          placeholder="Type your message..."
          value={form.message}
          onChange={(e) => {
            console.log('Updating message:', e.target.value);
            setForm({ ...form, message: e.target.value });
          }}
          required={mode !== 'file'}
        />
        <div className="mt-1 flex justify-between text-sm text-gray-500">
          <span>{form.message.length} characters</span>
          <span>{Math.ceil(form.message.length / 160)} message(s)</span>
        </div>
      </div>
    )}
    <div className="flex justify-end">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={
          ui.isSending ||
          !form.senderId ||
          (mode === 'campaign' && !form.campaignId) ||
          (mode === 'contacts' && !form.useAllContacts && !form.contacts.trim() && form.groups.length === 0) ||
          (mode === 'file' && (!form.campaignName || ui.fileStep !== 3))
        }
        className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] disabled:bg-[#00333e]/50"
      >
        <Send className="w-5 h-5" />
        {ui.isSending ? 'Sending...' : 'Send SMS'}
      </motion.button>
    </div>
  </form>
);

const Logs: React.FC<{ logs: MessageLog[] }> = ({ logs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4 }}
    className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
  >
    <h2 className="text-xl font-semibold text-[#00333e] mb-4">Sent SMS Logs</h2>
    {logs.length === 0 ? (
      <p className="text-gray-500 text-sm">No SMS logs available.</p>
    ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <motion.div
            key={log.id || log.timestamp}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
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
);

const Stats: React.FC<{ groups: Group[]; campaignId: string; senderIds: SenderId[] }> = ({ groups, campaignId, senderIds }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6 }}
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
  >
    {[
      { icon: Users, label: 'Total Groups', value: groups.length },
      { icon: Clock, label: 'Campaigns', value: campaignId ? 1 : 0 },
      { icon: BarChart2, label: 'Sender IDs', value: senderIds.length },
    ].map(({ icon: Icon, label, value }, i) => (
      <motion.div
        key={i}
        whileHover={{ scale: 1.03 }}
        className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-[#00333e]" />
          <div>
            <h3 className="text-lg font-semibold text-[#00333e]">{label}</h3>
            <p className="text-gray-600 text-sm">{value} {label.toLowerCase()}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </motion.div>
);

interface FormState {
  senderId: string;
  message: string;
  contacts: string;
  groups: string[];
  campaignId: string;
  schedule: string;
  campaignName: string;
  keywords: string;
  fileData: UploadedContact[];
  fileColumns: { [key: string]: string };
  placeholders: string[];
  useAllContacts: boolean;
}

interface UiState {
  isLoading: boolean;
  error: string | null;
  success: boolean;
  modals: { ai: boolean; file: boolean; group: boolean; import: boolean; campaign: boolean };
  fileStep: number;
  isSending: boolean;
}

const SendSMS: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [mode, setMode] = useState<'contacts' | 'campaign' | 'file'>('contacts');
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [validGroups, setValidGroups] = useState<Group[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [form, setForm] = useState<FormState>({
    senderId: '',
    message: '',
    contacts: '',
    groups: [],
    campaignId: '',
    schedule: '',
    campaignName: '',
    keywords: '',
    fileData: [],
    fileColumns: {},
    placeholders: [],
    useAllContacts: false,
  });
  const [ui, setUi] = useState<UiState>({
    isLoading: false,
    error: null,
    success: false,
    modals: { ai: false, file: false, group: false, import: false, campaign: false },
    fileStep: 1,
    isSending: false,
  });
  const contactCache = useRef<Map<string, Contact[]>>(new Map());
  const allContactsCache = useRef<Contact[]>([]);

  const fetchAllContacts = useCallback(
    async (workspaceId: string, groupId?: string) => {
      const perPage = 50;
      let items: Contact[] = [];
      let totalPages = 1;
      try {
        console.log(`Fetching contacts for ${groupId || 'all'}...`);
        const response = await (groupId
          ? getGroupContacts(workspaceId, groupId, 1, perPage)
          : getContacts(workspaceId, 1, perPage));
        items = response.contacts || [];
        totalPages = response.total_pages || 1;
        console.log(`Fetched ${items.length} contacts, total pages: ${totalPages}`);
        if (totalPages > 1) {
          const requests = Array.from({ length: totalPages - 1 }, (_, i) =>
            groupId
              ? getGroupContacts(workspaceId, groupId, i + 2, perPage)
              : getContacts(workspaceId, i + 2, perPage)
          );
          const responses = await Promise.all(requests);
          items = [...items, ...responses.flatMap((res) => res.contacts || [])];
        }
        return items;
      } catch (error) {
        console.error('Contact fetch error:', error);
        throw new Error('Failed to fetch contacts');
      }
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      setUi((prev) => ({ ...prev, isLoading: true }));
      try {
        if (!currentWorkspaceId) {
          setUi((prev) => ({ ...prev, error: 'No workspace selected.', isLoading: false }));
          return;
        }
        console.log('Fetching initial data...');
        const [senderIdsRes, groupsRes, logsRes] = await Promise.all([
          getApprovedSenderIds().catch(() => FALLBACK_SENDER_IDS),
          getWorkspaceGroups().then((data) => (data && (Array.isArray(data) ? data : data.data || [])) || []),
          getMessageLogs().then((data) => (data && (Array.isArray(data) ? data : data.data || [])) || []),
        ]);
        const approvedIds = Array.isArray(senderIdsRes)
          ? senderIdsRes.filter((s) => s.is_approved)
          : senderIdsRes?.data?.filter((s: any) => s.is_approved) || FALLBACK_SENDER_IDS;
        console.log('Data fetched:', { senderIds: approvedIds, groups: groupsRes, logs: logsRes });
        setSenderIds(approvedIds);
        setForm((prev) => ({ ...prev, senderId: approvedIds[0]?.sender_id || '' }));
        setValidGroups(groupsRes);
        setMessageLogs(logsRes);
        setUi((prev) => ({
          ...prev,
          isLoading: false,
          error: approvedIds === FALLBACK_SENDER_IDS ? 'Using fallback sender IDs' : null,
        }));
      } catch (err) {
        console.error('Initial data fetch error:', err);
        setSenderIds(FALLBACK_SENDER_IDS);
        setForm((prev) => ({ ...prev, senderId: FALLBACK_SENDER_IDS[0].sender_id }));
        setUi((prev) => ({ ...prev, isLoading: false, error: 'Failed to load data.' }));
      }
    };
    fetchData();
  }, [currentWorkspaceId]);

  const getRecipients = useCallback(
    async (groupIds: string[]): Promise<string[]> => {
      if (!currentWorkspaceId) {
        console.warn('No workspace ID');
        return [];
      }
      const phones: string[] = [];
      for (const groupId of groupIds) {
        if (contactCache.current.has(groupId)) {
          phones.push(...contactCache.current.get(groupId)!.map((c) => c.phone_number));
          continue;
        }
        try {
          const contacts = await fetchAllContacts(currentWorkspaceId, groupId);
          contactCache.current.set(groupId, contacts);
          phones.push(...contacts.map((c) => c.phone_number));
        } catch (err) {
          console.error(`Error fetching contacts for group ${groupId}:`, err);
        }
      }
      const validPhones = [...new Set(phones)].filter((p) => p && /^\+?\d{10,15}$/.test(p.trim()));
      console.log('Recipients fetched:', validPhones);
      return validPhones;
    },
    [currentWorkspaceId, fetchAllContacts]
  );

  const getContactRecipients = useCallback(
    async () => {
      let recipients: string[] = [];
      if (form.useAllContacts) {
        if (!allContactsCache.current.length) {
          allContactsCache.current = await fetchAllContacts(currentWorkspaceId);
        }
        recipients = allContactsCache.current.map((c) => c.phone_number);
      } else {
        if (form.contacts.trim()) {
          recipients.push(...form.contacts.split(/[\n,]+/).map((p) => p.trim()));
        }
        if (form.groups.length) {
          recipients.push(...(await getRecipients(form.groups)));
        }
      }
      const validRecipients = [...new Set(recipients)].filter((p) => p && /^\+?\d{10,15}$/.test(p));
      console.log('Contact recipients:', validRecipients);
      return validRecipients;
    },
    [form.useAllContacts, form.contacts, form.groups, currentWorkspaceId, getRecipients]
  );

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setUi((prev) => ({ ...prev, error: 'No workspace selected' }));
      return;
    }
    if (!form.senderId) {
      setUi((prev) => ({ ...prev, error: 'Please select a sender ID' }));
      return;
    }
    if (mode === 'campaign' && !form.campaignId) {
      setUi((prev) => ({ ...prev, error: 'Please select a campaign' }));
      return;
    }
    if (
      mode === 'contacts' &&
      !form.useAllContacts &&
      !form.contacts.trim() &&
      form.groups.length === 0
    ) {
      setUi((prev) => ({ ...prev, error: 'Please add contacts or groups' }));
      return;
    }
    if (mode !== 'file' && !form.message.trim()) {
      setUi((prev) => ({ ...prev, error: 'Please enter a message' }));
      return;
    }
    if (mode === 'file' && (!form.campaignName || !form.fileColumns['phone_number'])) {
      setUi((prev) => ({ ...prev, error: 'Please provide campaign name and map phone number' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true, error: null }));
    try {
      console.log('Sending SMS:', { mode, form });
      let recipients: string[] = [];
      if (mode === 'contacts') {
        recipients = await getContactRecipients();
      } else if (mode === 'campaign') {
        recipients = await getRecipients(form.groups);
      } else if (mode === 'file') {
        recipients = form.fileData
          .map((row) => row[form.fileColumns['phone_number']])
          .filter((p) => p && /^\+?\d{10,15}$/.test(p.trim()));
      }
      if (!recipients.length) {
        throw new Error('No valid recipients found');
      }
      await sendInstantMessage(currentWorkspaceId, {
        recipients,
        content: form.message,
        sender_id: form.senderId,
      });
      console.log('SMS sent successfully');
      setForm({
        ...form,
        message: '',
        contacts: '',
        groups: [],
        campaignId: '',
        schedule: '',
        campaignName: '',
        keywords: '',
        fileData: [],
        fileColumns: {},
        placeholders: [],
        useAllContacts: false,
      });
      setUi((prev) => ({
        ...prev,
        success: true,
        isSending: false,
        error: null,
        modals: { ...prev.modals, file: false, campaign: false },
        fileStep: 1,
      }));
      setTimeout(() => setUi((prev) => ({ ...prev, success: false })), 3000);
      const logs = await getMessageLogs();
      setMessageLogs((data && (Array.isArray(data) ? data : data.data || [])) || []);
    } catch (err: any) {
      console.error('Send SMS error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to send SMS', isSending: false }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    console.log('Uploading file:', file.name);
    Papa.parse(file, {
      header: true,
      complete: (result) => {
        const data = result.data as UploadedContact[];
        console.log('File parsed:', data);
        setForm((prev) => ({ ...prev, fileData: data, placeholders: data[0] ? Object.keys(data[0]) : [] }));
        setUi((prev) => ({ ...prev, fileStep: 2 }));
      },
      error: (err) => {
        console.error('File parse error:', err);
        setUi((prev) => ({ ...prev, error: 'Failed to parse file' }));
      },
    });
  };

  const handleGenerateAI = async () => {
    if (!form.keywords.trim()) {
      setUi((prev) => ({ ...prev, error: 'Please enter a prompt' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true }));
    try {
      console.log('Generating AI message with prompt:', form.keywords);
      const message = await generateMessage(`Generate SMS: ${form.keywords}`);
      setForm((prev) => ({ ...prev, message }));
      setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false }, isSending: false }));
    } catch (err: any) {
      console.error('AI generation error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to generate message', isSending: false }));
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {ui.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-gray-200 p-3 text-[#00333e] text-sm text-center rounded-lg shadow-sm"
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          SMS Sent Successfully!
        </motion.div>
      )}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-3 text-center text-sm rounded-lg"
        >
          {ui.error}
        </motion.div>
      )}
      {ui.isLoading && (
        <motion.div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00333e]"></div>
        </motion.div>
      )}
      {!ui.isLoading && (
        <div className="space-y-6">
          <motion.div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-6 h-6 text-[#00333e]" />
            <h1 className="text-xl font-bold text-[#00333e]">Send SMS</h1>
          </motion.div>
          <motion.div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <ModeTabs mode={mode} setMode={setMode} />
            <SmsForm
              mode={mode}
              form={form}
              setForm={setForm}
              ui={ui}
              setUi={setUi}
              senderIds={senderIds}
              validGroups={validGroups}
              onSubmit={handleSend}
              onFileUpload={handleFileUpload}
              onGenerateAi={handleGenerateAI}
            />
          </motion.div>
          <Logs logs={messageLogs} />
          <Stats groups={validGroups} campaignId={form.campaignId} senderIds={senderIds} />
          <Modal
            isOpen={ui.modals.ai}
            onClose={() => {
              console.log('Closing AI modal');
              setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false } }));
            }}
            title="Generate AI Message"
            onSubmit={handleGenerateAI}
            submitText={ui.isSending ? 'Generating...' : 'Generate'}
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Prompt</label>
            <input
              type="text"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Write a prompt to generate SMS"
              value={form.keywords}
              onChange={(e) => {
                console.log('Updating AI prompt:', e.target.value);
                setForm((prev) => ({ ...prev, keywords: e.target.value }));
              }}
            />
          </Modal>
          <Modal
            isOpen={ui.modals.import}
            onClose={() => {
              console.log('Closing import modal');
              setUi((prev) => ({ ...prev, modals: { ...prev.modals, import: false } }));
            }}
            title="Import Contacts"
          >
            <label className="block text-sm font-medium text-[#00333e] mb-1">Upload File</label>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                console.log('Importing file:', file.name);
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  const phones = text
                    .split(/[\n,]+/)
                    .map((p) => p.trim())
                    .filter((p) => p && /^\+?\d{10,15}$/.test(p));
                  console.log('Imported phones:', phones);
                  setForm((prev) => ({ ...prev, contacts: phones.join('\n') }));
                  setUi((prev) => ({ ...prev, modals: { ...prev.modals, import: false } }));
                };
                reader.readAsText(file);
              }}
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
            />
            <p className="text-sm text-gray-500 mt-1">Upload CSV/TXT with phone numbers (one per line or comma-separated).</p>
          </Modal>
          <Modal
            isOpen={ui.modals.group}
            onClose={() => {
              console.log('Closing group modal');
              setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false } }));
            }}
            title="Select Contact Groups"
          >
            <div className="max-h-48 overflow-y-auto">
              {validGroups.map((group) => (
                <label key={group.group_id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={form.groups.includes(group.group_id)}
                    onChange={() => {
                      console.log('Toggling group:', group.group_id);
                      setForm((prev) => ({
                        ...prev,
                        groups: prev.groups.includes(group.group_id)
                          ? prev.groups.filter((id) => id !== group.group_id)
                          : [...prev.groups, group.group_id],
                      }));
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#00333e]">{group.name}</span>
                </label>
              ))}
            </div>
          </Modal>
          <Modal
            isOpen={ui.modals.file}
            onClose={() => {
              console.log('Closing file modal');
              setUi((prev) => ({ ...prev, modals: { ...prev.modals, file: false }, fileStep: 1 }));
              setForm((prev) => ({ ...prev, fileData: [], fileColumns: {}, placeholders: [], message: '' }));
            }}
            title="Upload File for SMS"
          >
            <div className="flex items-center justify-between mb-4 overflow-x-auto">
              {['Upload', 'Map', 'Send'].map((label, i) => (
                <div key={label} className="flex items-center min-w-[100px]">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      ui.fileStep >= i + 1 ? 'bg-[#00333e] text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`ml-2 text-sm ${ui.fileStep >= i + 1 ? 'text-[#00333e]' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                  {i < 2 && <div className="w-6 h-1 bg-gray-300 mx-1" />}
                </div>
              ))}
            </div>
            {ui.fileStep === 1 && (
              <div className="text-center">
                <Upload className="w-10 h-10 text-gray-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload a CSV file</p>
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
                <p className="text-sm text-gray-500 mt-2">(Format: phone_number, etc.)</p>
              </div>
            )}
            {ui.fileStep === 2 && form.fileData.length > 0 && (
              <div>
                <p className="text-sm text-gray-700 mb-2">Map Columns and Select Placeholders</p>
                <div className="overflow-x-auto max-h-[300px] border border-gray-200 rounded-lg mb-4">
                  <table className="w-full text-left text-gray-700">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        {Object.keys(form.fileData[0]).map((col) => (
                          <th key={col} className="p-2 min-w-[120px]">
                            <select
                              value={form.fileColumns[col] || ''}
                              onChange={(e) => {
                                console.log(`Mapping column ${col} to ${e.target.value}`);
                                setForm((prev) => ({
                                  ...prev,
                                  fileColumns: { ...prev.fileColumns, [col]: e.target.value },
                                }));
                              }}
                              className="w-full text-sm py-1 px-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
                            >
                              <option value="">Select...</option>
                              <option value="phone_number">Phone Number</option>
                              <option value="message">Message</option>
                            </select>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {form.fileData.slice(0, 5).map((row, i) => (
                        <tr key={i} className="border-b border-gray-200">
                          {Object.values(row).map((value, j) => (
                            <td
                              key={j}
                              className="p-2 text-sm min-w-[120px] whitespace-nowrap overflow-hidden text-ellipsis"
                            >
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Showing first 5 rows. Total rows: {form.fileData.length}
                </p>
                <p className="text-sm text-gray-700 mb-2">Select Placeholders for Message</p>
                <div className="flex flex-wrap gap-2">
                  {form.placeholders.map((p) => (
                    <label key={p} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={form.placeholders.includes(p)}
                        onChange={() => {
                          console.log('Toggling placeholder:', p);
                          setForm((prev) => ({
                            ...prev,
                            placeholders: prev.placeholders.includes(p)
                              ? prev.placeholders.filter((x) => x !== p)
                              : [...prev.placeholders, p],
                          }));
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-[#00333e]">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {ui.fileStep === 3 && (
              <div>
                <p className="text-sm text-gray-700 mb-2">Compose Message with Placeholders</p>
                <textarea
                  className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
                  placeholder="Type your message (e.g., Hello {name})"
                  value={form.message}
                  onChange={(e) => {
                    console.log('Updating file message:', e.target.value);
                    setForm((prev) => ({ ...prev, message: e.target.value }));
                  }}
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  Available placeholders: {form.placeholders.map((p) => `{${p}}`).join(', ')}
                </p>
                <p className="text-sm text-gray-600">
                  Preview (first contact):{' '}
                  {form.fileData.length > 0
                    ? form.placeholders.reduce(
                        (msg, p) => msg.replace(`{${p}}`, form.fileData[0][p] || ''),
                        form.message
                      )
                    : 'No preview available'}
                </p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              {ui.fileStep > 1 && (
                <button
                  onClick={() => {
                    console.log('Going back to file step:', ui.fileStep - 1);
                    setUi((prev) => ({ ...prev, fileStep: prev.fileStep - 1 }));
                  }}
                  className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Back
                </button>
              )}
              {ui.fileStep < 3 ? (
                <button
                  onClick={() => {
                    console.log('Advancing to file step:', ui.fileStep + 1);
                    setUi((prev) => ({ ...prev, fileStep: prev.fileStep + 1 }));
                  }}
                  className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
                  disabled={ui.fileStep === 2 && !form.fileColumns['phone_number']}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSend}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                  disabled={ui.isSending}
                >
                  {ui.isSending ? 'Sending...' : 'Send SMS'}
                </button>
              )}
            </div>
          </Modal>
          <CampaignModal
            isOpen={ui.modals.campaign}
            onClose={() => {
              console.log('Closing campaign modal');
              setUi((prev) => ({ ...prev, modals: { ...prev.modals, campaign: false } }));
            }}
            onSelect={(campaignId, schedule, groups) => {
              console.log('Campaign selected:', { campaignId, schedule, groups });
              setForm((prev) => ({ ...prev, campaignId, schedule, groups }));
            }}
            validGroups={validGroups}
          />
        </div>
      )}
    </div>
  );
};

export default SendSMS;