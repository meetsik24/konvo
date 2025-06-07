import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Upload, CheckCircle } from 'lucide-react';
import { useWorkspace } from '../pages/WorkspaceContext.tsx';
import { sendInstantMessage } from '../services/api.tsx';
import Papa from 'papaparse';

interface SenderId {
  sender_id: string;
  name: string;
  is_approved: boolean;
}

interface UploadedContact {
  phone_number?: string;
  [key: string]: any;
}

interface FormState {
  senderId: string;
  message: string;
  campaignName: string;
  fileData: UploadedContact[];
  fileColumns: { [key: string]: string };
  placeholders: string[];
}

interface UiState {
  isSending: boolean;
  error: string | null;
  success: boolean;
  fileStep: number;
}

interface Props {
  senderIds: SenderId[];
  onSend: () => void;
}

const SendFileSMS: React.FC<Props> = ({ senderIds, onSend }) => {
  const { currentWorkspaceId } = useWorkspace();
  const [form, setForm] = useState<FormState>({
    senderId: senderIds[0]?.sender_id || '',
    message: '',
    campaignName: '',
    fileData: [],
    fileColumns: {},
    placeholders: [],
  });
  const [ui, setUi] = useState<UiState>({
    isSending: false,
    error: null,
    success: false,
    fileStep: 1,
  });

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
    if (!form.campaignName) {
      setUi((prev) => ({ ...prev, error: 'Please provide a campaign name' }));
      return;
    }
    if (!form.fileColumns['phone_number']) {
      setUi((prev) => ({ ...prev, error: 'Please map phone number column' }));
      return;
    }
    setUi((prev) => ({ ...prev, isSending: true, error: null }));
    try {
      const recipients = form.fileData
        .map((row) => row[form.fileColumns['phone_number']])
        .filter((p) => p && /^\+?\d{10,15}$/.test(p.trim()));
      if (!recipients.length) {
        throw new Error('No valid recipients found');
      }
      await sendInstantMessage(currentWorkspaceId, {
        recipients,
        content: form.message,
        sender_id: form.senderId,
      });
      console.log('File SMS sent successfully');
      setForm({
        senderId: senderIds[0]?.sender_id || '',
        message: '',
        campaignName: '',
        fileData: [],
        fileColumns: {},
        placeholders: [],
      });
      setUi((prev) => ({ ...prev, success: true, isSending: false, error: null, fileStep: 1 }));
      setTimeout(() => setUi((prev) => ({ ...prev, success: false })), 3000);
      onSend();
    } catch (err: any) {
      console.error('Send file SMS error:', err);
      setUi((prev) => ({ ...prev, error: err.message || 'Failed to send SMS', isSending: false }));
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
          File SMS Sent Successfully!
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
            <span className={`ml-2 text-sm ${ui.fileStep >= i + 1 ? 'text-[#00333e]' : 'text-gray-400'}`}>
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
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            fileColumns: { ...prev.fileColumns, [col]: e.target.value },
                          }))
                        }
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
          <p className="text-sm text-gray-600 mb-2">Showing first 5 rows. Total rows: {form.fileData.length}</p>
          <p className="text-sm text-gray-700 mb-2">Select Placeholders for Message</p>
          <div className="flex flex-wrap gap-2">
            {form.placeholders.map((p) => (
              <label key={p} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={form.placeholders.includes(p)}
                  onChange={() =>
                    setForm((prev) => ({
                      ...prev,
                      placeholders: prev.placeholders.includes(p)
                        ? prev.placeholders.filter((x) => x !== p)
                        : [...prev.placeholders, p],
                    }))
                  }
                  className="w-4 h-4"
                />
                <span className="text-sm text-[#00333e]">{p}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setUi((prev) => ({ ...prev, fileStep: prev.fileStep - 1 }))}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={() => setUi((prev) => ({ ...prev, fileStep: prev.fileStep + 1 }))}
              className="px-3 py-1 text-sm bg-[#00333e] text-white rounded-lg hover:bg-[#002a36]"
              disabled={!form.fileColumns['phone_number']}
            >
              Next
            </button>
          </div>
        </div>
      )}
      {ui.fileStep === 3 && (
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
            <label className="block text-sm font-medium text-[#00333e] mb-1">Campaign Name</label>
            <input
              type="text"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Enter campaign name"
              value={form.campaignName}
              onChange={(e) => setForm({ ...form, campaignName: e.target.value })}
              required
            />
          </div>
          <div>
            <p className="text-sm text-gray-700 mb-2">Compose Message with Placeholders</p>
            <textarea
              className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d]"
              placeholder="Type your message (e.g., Hello {name})"
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
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
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setUi((prev) => ({ ...prev, fileStep: prev.fileStep - 1 }))}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={ui.isSending}
              className="flex items-center gap-2 text-sm py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-500/50"
            >
              <Send className="w-5 h-5" />
              {ui.isSending ? 'Sending...' : 'Send SMS'}
            </motion.button>
          </div>
        </form>
      )}
    </div>
  );
};

export default SendFileSMS;