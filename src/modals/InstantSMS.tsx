import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, CheckCircle, X } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext.tsx';
import { sendInstantMessage, generateMessage } from '../services/api.tsx';
import { getRecipients, fetchAllContacts } from '../utils/smsUtilis.tsx';

interface Group {
  group_id: string;
  name: string;
}

interface SenderId {
  sender_id: string;
  name: string;
  is_approved: boolean;
}

interface FormState {
  senderId: string;
  message: string;
  contacts: string;
  groups: string[];
  keywords: string;
  useAllContacts: boolean;
}

interface UiState {
  isSending: boolean;
  error: string | null;
  success: boolean;
  modals: { ai: boolean; group: boolean; import: boolean };
}

interface Props {
  senderIds: SenderId[];
  validGroups: Group[];
  onSend: () => void;
}

const InstantSMS: React.FC<Props> = ({ senderIds, validGroups, onSend }) => {
  const { currentWorkspaceId } = useWorkspace();
  const [form, setForm] = useState<FormState>({
    senderId: senderIds[0]?.sender_id || '',
    message: '',
    contacts: '',
    groups: [],
    keywords: '',
    useAllContacts: false,
  });
  const [ui, setUi] = useState<UiState>({
    isSending: false,
    error: null,
    success: false,
    modals: { ai: false, group: false, import: false },
  });
  const contactCache = useRef<Map<string, Contact[]>>(new Map());
  const allContactsCache = useRef<Contact[]>([]);

  const getContactRecipients = useCallback(async () => {
    let recipients: string[] = [];
    if (form.useAllContacts) {
      if (!allContactsCache.current.length) {
        allContactsCache.current = await fetchAllContacts(currentWorkspaceId!);
      }
      recipients = allContactsCache.current.map((c) => c.phone_number);
    } else {
      if (form.contacts.trim()) {
        recipients.push(...form.contacts.split(/[\n,]+/).map((p) => p.trim()));
      }
      if (form.groups.length) {
        recipients.push(...(await getRecipients(currentWorkspaceId!, form.groups, contactCache.current)));
      }
    }
    const validRecipients = [...new Set(recipients)].filter((p) => p && /^\+?\d{10,15}$/.test(p));
    console.log('Contact recipients:', validRecipients);
    return validRecipients;
  }, [form.useAllContacts, form.contacts, form.groups, currentWorkspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId) {
      setUi((prev) => ({ ...prev, error: 'No workspace selected' }));
      return;
    }
    if (!form.senderId) {
      setUi((prev) => ({ ...prev, error: 'Please select a sender ID' }));
      return;
    }
    if (!form.useAllContacts && !form.contacts.trim() && form.groups.length === 0) {
      setUi((prev) => ({ ...prev, error: 'Please add contacts or groups' }));
      return;
    }
    if (!form.message.trim()) {
      setUi((prev) => ({ ...prev, error: 'Please enter a message' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true, error: null }));
    try {
      const recipients = await getContactRecipients();
      if (!recipients.length) {
        throw new Error('No valid recipients found');
      }
      await sendInstantMessage(currentWorkspaceId, {
        recipients,
        content: form.message,
        sender_id: form.senderId,
      });
      console.log('Instant SMS sent successfully');
      setForm({
        senderId: senderIds[0]?.sender_id || '',
        message: '',
        contacts: '',
        groups: [],
        keywords: '',
        useAllContacts: false,
      });
      setUi((prev) => ({ ...prev, success: true, isSending: false, error: null }));
      setTimeout(() => setUi((prev) => ({ ...prev, success: false })), 3000);
      onSend();
    } catch (err: any) {
      console.error('Send instant SMS error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to send SMS', isSending: false }));
    }
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
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      {ui.success && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-100 border border-gray-200 p-3 text-[#00333e] text-sm text-center rounded-lg shadow-sm mb-4"
        >
          <CheckCircle className="w-4 h-4 inline mr-2" />
          SMS Sent Successfully!
        </motion.div>
      )}
      {ui.error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-600 p-3 text-center text-sm rounded-lg mb-4"
        >
          {ui.error}
        </motion.div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#00333e] mb-1">Sender ID</label>
          <select
            className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
            value={form.senderId}
            onChange={(e) => setForm({ ...form, senderId: e.target.value })}
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
        <div>
          <div className="mb-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.useAllContacts}
                onChange={() =>
                  setForm({
                    ...form,
                    useAllContacts: !form.useAllContacts,
                    contacts: form.useAllContacts ? '' : form.contacts,
                    groups: form.useAllContacts ? [] : form.groups,
                  })
                }
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-[#00333e]">Send to All Contacts</span>
            </label>
            {form.useAllContacts && (
              <p className="text-sm text-gray-600 mt-1">This will send the SMS to all contacts in the workspace.</p>
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
                  onChange={(e) => setForm({ ...form, contacts: e.target.value })}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setUi({ ...ui, modals: { ...ui.modals, group: true } })}
                  className="text-sm text-[#00333e] bg-gray-100 px-3 py-1 rounded-lg hover:bg-[#fddf0d]"
                >
                  Select Groups
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setUi({ ...ui, modals: { ...ui.modals, import: true } })}
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
                            onClick={() =>
                              setForm({ ...form, groups: form.groups.filter((id) => id !== groupId) })
                            }
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
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-[#00333e]">Message</label>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => setUi({ ...ui, modals: { ...ui.modals, ai: true } })}
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
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <div className="mt-1 flex justify-between text-sm text-gray-500">
            <span>{form.message.length} characters</span>
            <span>{Math.ceil(form.message.length / 160)} message(s)</span>
          </div>
        </div>
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={ui.isSending || !form.senderId}
            className="flex items-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] disabled:bg-[#00333e]/50"
          >
            <Send className="w-5 h-5" />
            {ui.isSending ? 'Sending...' : 'Send SMS'}
          </motion.button>
        </div>
      </form>
      {ui.modals.ai && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00333e]">Generate AI Message</h3>
              <button
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false } }))}
                className="text-gray-500 hover:text-[#00333e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#00333e] mb-1">Prompt</label>
              <input
                type="text"
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
                placeholder="Write a prompt to generate SMS"
                value={form.keywords}
                onChange={(e) => setForm((prev) => ({ ...prev, keywords: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, ai: false } }))}
                className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateAI}
                className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
                disabled={ui.isSending}
              >
                {ui.isSending ? 'Generating...' : 'Generate'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {ui.modals.import && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00333e]">Import Contacts</h3>
              <button
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, import: false } }))}
                className="text-gray-500 hover:text-[#00333e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
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
                    const phones = text
                      .split(/[\n,]+/)
                      .map((p) => p.trim())
                      .filter((p) => p && /^\+?\d{10,15}$/.test(p));
                    setForm((prev) => ({ ...prev, contacts: phones.join('\n') }));
                    setUi((prev) => ({ ...prev, modals: { ...prev.modals, import: false } }));
                  };
                  reader.readAsText(file);
                }}
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
              />
              <p className="text-sm text-gray-500 mt-1">Upload CSV/TXT with phone numbers (one per line or comma-separated).</p>
            </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, import: false } }))}
                className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
      {ui.modals.group && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm w-full max-w-lg p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00333e]">Select Contact Groups</h3>
              <button
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false } }))}
                className="text-gray-500 hover:text-[#00333e]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto mb-4">
              {validGroups.map((group) => (
                <label key={group.group_id} className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    checked={form.groups.includes(group.group_id)}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        groups: prev.groups.includes(group.group_id)
                          ? prev.groups.filter((id) => id !== group.group_id)
                          : [...prev.groups, group.group_id],
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-[#00333e]">{group.name}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setUi((prev) => ({ ...prev, modals: { ...prev.modals, group: false } }))}
                className="px-3 py-1 text-sm text-[#00333e] bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default InstantSMS;