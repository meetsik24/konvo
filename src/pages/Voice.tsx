import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, CheckCircle } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { makeCall, getCallLogs } from '../services/api';

interface CallRequest {
  receiver_number: string;
  tts_message?: string;
  audio_url?: string;
}

interface CallLog {
  call_log_id: string;
  user_id: string;
  caller_number: string;
  receiver_number: string;
  status: 'initiated' | 'completed' | 'failed';
  duration_seconds: number;
  started_at: string;
  ended_at?: string;
  error_details?: string;
  infobip_call_id?: string;
}

interface CallLogsResponse {
  user_id: string;
  logs: CallLog[];
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
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
          <button onClick={onClose} className="text-gray-500 hover:text-[#00333e]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mb-4">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const Voice: React.FC = () => {
  const { currentWorkspaceId } = useWorkspace();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [receiverNumber, setReceiverNumber] = useState('');
  const [ttsMessage, setTtsMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallLogs = async () => {
      if (!currentWorkspaceId) {
        setError('No workspace selected.');
        return;
      }
      try {
        const response = await getCallLogs(currentWorkspaceId);
        setCallLogs(response.logs);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch call logs.');
      }
    };
    fetchCallLogs();
  }, [currentWorkspaceId]);

  const handleMakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspaceId || !receiverNumber) {
      setError('Receiver number is required.');
      return;
    }

    setIsCalling(true);
    try {
      const data: CallRequest = {
        receiver_number: `${receiverNumber}`, // Combines country code and number
        tts_message: ttsMessage || undefined,
        audio_url: audioUrl || undefined,
      };
      await makeCall(currentWorkspaceId, data);
      const updatedLogs = await getCallLogs(currentWorkspaceId);
      setCallLogs(updatedLogs.logs);
      setReceiverNumber('');
      setTtsMessage('');
      setAudioUrl('');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to make call.');
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6"
    >
      {showSuccessNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
            <CheckCircle className="w-10 h-10" />
            <span>Call Initiated Successfully!</span>
            <p>Your call was initiated at 07:42 PM EAT, May 20, 2025.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div className="bg-red-50 border border-gray-200 text-red-600 p-4 rounded-lg">
          {error}
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <Phone className="w-8 h-8 text-[#00333e]" />
        <h1 className="text-3xl font-bold text-[#00333e]">Voice API</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#00333e]">
            <Phone className="w-6 h-6 text-[#00333e]" />
            Make a Call
          </h2>
          <form onSubmit={handleMakeCall} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#00333e] mb-2">Phone Number</label>
              <div className="flex gap-3">
                <div className="w-24">
                  <select
                    className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                    value={receiverNumber.split(' ')[0] || '+1'}
                    onChange={(e) => {
                      const countryCode = e.target.value;
                      const numberPart = receiverNumber.split(' ').slice(1).join(' ') || '';
                      setReceiverNumber(`${countryCode} ${numberPart}`);
                    }}
                  >
                    <option value="+255">+255</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+91">+91</option>
                  </select>
                </div>
                <input
                  type="tel"
                  className="input w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                  placeholder="(555) 123-4567"
                  value={receiverNumber.split(' ').slice(1).join(' ') || ''}
                  onChange={(e) => {
                    const countryCode = receiverNumber.split(' ')[0] || '+1';
                    setReceiverNumber(`${countryCode} ${e.target.value}`);
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-all"
              disabled={isCalling}
            >
              <Phone className="w-5 h-5" />
              {isCalling ? 'Calling...' : 'Start Call'}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-[#00333e]">
            Voice Options
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#00333e] mb-2">TTS Message (optional)</label>
              <textarea
                className="w-full min-h-[100px] text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                value={ttsMessage}
                onChange={(e) => setTtsMessage(e.target.value)}
                placeholder="Enter text-to-speech message"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#00333e] mb-2">Audio URL (optional)</label>
              <input
                type="text"
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="e.g., https://example.com/audio.mp3"
              />
            </div>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 text-sm py-2 px-4 bg-[#00333e] text-white rounded-lg hover:bg-[#002a36] transition-all"
            >
              <Phone className="w-5 h-5" />
              Advanced Options
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-[#00333e]">Recent Calls</h2>
        <div className="space-y-4">
          {callLogs.map((log) => (
            <div
              key={log.call_log_id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-[#00333e]" />
                <div>
                  <p className="font-medium">{log.receiver_number}</p>
                  <p className="text-sm text-gray-500">{new Date(log.started_at).toLocaleString()}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {log.status}
              </span>
            </div>
          ))}
          {callLogs.length === 0 && (
            <p className="text-center text-gray-500 mt-4">No call logs available.</p>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Advanced Call Options">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#00333e] mb-2">Receiver Number</label>
            <input
              type="text"
              className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d] transition-all"
              value={receiverNumber}
              onChange={(e) => setReceiverNumber(e.target.value)}
              placeholder="Enter number with country code (e.g., +255788344348)"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleMakeCall}
              className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all"
              disabled={isCalling}
            >
              {isCalling ? 'Calling...' : 'Initiate'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Voice;