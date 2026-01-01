import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, Eye } from 'lucide-react';
import MessagePreviewModal from '../modals/MessagePreviewModal';

interface FormData {
  senderId: string;
  groupIds: string[];
  message: string;
  recipients: string;
}

interface Props {
  senderIds: { sender_id: string; name: string; is_approved: boolean }[];
  groups: { group_id: string; name: string }[];
  onSubmit: (data: FormData) => Promise<void>;
}

const MessageForm: React.FC<Props> = ({ senderIds, groups, onSubmit }) => {
  const [form, setForm] = useState<FormData>({
    senderId: '',
    groupIds: [],
    message: '',
    recipients: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);
      try {
        await onSubmit(form);
        setForm({ senderId: '', groupIds: [], message: '', recipients: '' });
      } catch (err: any) {
        setError(err.message || 'Failed to send message.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, onSubmit],
  );

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-4"
      role="form"
      aria-label="SMS message form"
    >
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg text-sm"
          role="alert"
        >
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="senderId"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Sender ID
        </label>
        <select
          id="senderId"
          value={form.senderId}
          onChange={(e) => setForm((prev) => ({ ...prev, senderId: e.target.value }))}
          className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#003087]"
          required
          aria-required="true"
        >
          <option value="">Select Sender ID</option>
          {senderIds
            .filter((s) => s.is_approved)
            .map((sender) => (
              <option key={sender.sender_id} value={sender.sender_id}>
                {sender.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="groupIds"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Groups
        </label>
        <select
          id="groupIds"
          multiple
          value={form.groupIds}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              groupIds: Array.from(e.target.selectedOptions, (option) => option.value),
            }))
          }
          className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#003087] h-24"
          aria-multiselectable="true"
        >
          {groups.map((group) => (
            <option key={group.group_id} value={group.group_id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Message
        </label>
        <textarea
          id="message"
          value={form.message}
          onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
          className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#003087] h-32"
          maxLength={160}
          required
          aria-required="true"
        />
        <p className="text-xs text-gray-500 mt-1">
          {form.message.length}/160 characters
        </p>
      </div>
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSubmitting}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#003087] rounded-lg ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#002a6d]'
          }`}
          aria-label="Send SMS"
        >
          <Send className="w-4 h-4" aria-hidden="true" />
          Send
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setIsPreviewOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#003087] border border-[#003087] rounded-lg hover:bg-gray-50"
          aria-label="Preview message"
        >
          <Eye className="w-4 h-4" aria-hidden="true" />
          Preview
        </motion.button>
      </div>
      <MessagePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        message={form.message}
        senderId={senderIds.find((s) => s.sender_id === form.senderId)?.name || ''}
      />
    </motion.form>
  );
};

export default MessageForm;