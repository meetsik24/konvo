import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Save } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { makeCall, getCallLogs } from '../services/api';
import VoiceRecorder from '../components/VoiceRecorder';
import axios from 'axios';

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

const Voice: React.FC = () => {
  const { userId } = useWorkspace();
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [receiverNumber, setReceiverNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [messageType, setMessageType] = useState<'tts' | 'audio'>('tts');
  const [ttsMessage, setTtsMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCallLogs = async () => {
      if (!userId) {
        setError('No user selected.');
        return;
      }
      try {
        const response = await getCallLogs(userId);
        if (isMounted && response) {
          setCallLogs(response.logs || []);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch call logs.');
        }
      }
    };
    fetchCallLogs();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callActive]);

  const handleMakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = receiverNumber.trim();
    if (!userId || !trimmedNumber) {
      setError('Receiver number is required.');
      return;
    }

    setIsCalling(true);
    setCallActive(true);
    setCallDuration(0);
    try {
      const fullNumber = `${countryCode}${trimmedNumber}`.replace(/\s/g, '');
      let finalAudioUrl: string | undefined = audioUrl;
      let finalTtsMessage: string | undefined = undefined;

      if (messageType === 'tts' && ttsMessage) {
        finalTtsMessage = ttsMessage;
      } else if (messageType === 'audio' && !audioUrl) {
        throw new Error('Please record or upload an audio message.');
      }

      const data: CallRequest = {
        receiver_number: fullNumber,
        tts_message: finalTtsMessage,
        audio_url: finalAudioUrl,
      };
      await makeCall(userId, data);
      const response = await getCallLogs(userId);
      if (response) setCallLogs(response.logs || []);
      setReceiverNumber('');
      setTtsMessage('');
      setAudioUrl('');
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to make call. Please check the endpoint and server status.');
    } finally {
      setIsCalling(false);
    }
  };

  const handleEndCall = () => {
    setCallActive(false);
    setCallDuration(0);
  };

  const handleRecordingComplete = (blob: Blob | null, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
  };

  const handlePlay = () => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.play().catch((err) => console.error('Playback error:', err));
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleConvertTts = async () => {
    if (!ttsMessage) {
      setError('Please enter a TTS message to convert.');
      return;
    }

    try {
      const ttsResponse = await axios.post('https://your-tts-endpoint.com/convert', { text: ttsMessage }, {
        headers: { 'Content-Type': 'application/json' },
      });
      const convertedAudioUrl = ttsResponse.data.audio_url;
      const response = await fetch(convertedAudioUrl);
      const blob = await response.blob();
      setAudioBlob(blob);
      setAudioUrl(convertedAudioUrl);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err) {
      setError('Failed to convert TTS to audio.');
    }
  };

  const handleSave = async () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      try {
        const response = await axios.post('https://your-firebase-storage-endpoint.com/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setAudioUrl(response.data.url);
        setShowSuccessNotification(true);
        setTimeout(() => setShowSuccessNotification(false), 3000);
      } catch (err) {
        setError('Failed to upload audio.');
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8"
    >
      {showSuccessNotification && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
        >
          <div className="bg-green-500 text-white p-4 rounded-xl shadow-2xl flex flex-col items-center gap-2 w-full max-w-xs">
            <Save className="w-10 h-10" />
            <span>Action Successful!</span>
            <p>Performed at 09:36 PM EAT, May 21, 2025.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg w-full max-w-3xl mb-6">
          {error}
        </motion.div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm text-gray-600">Total Calls</p>
            <p className="text-xl font-bold text-[#00333e]">150</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm text-gray-600">Total Minutes</p>
            <p className="text-xl font-bold text-[#00333e]">120</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm text-gray-600">Rejected</p>
            <p className="text-xl font-bold text-[#00333e]">10</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md text-center">
            <p className="text-sm text-gray-600">Received</p>
            <p className="text-xl font-bold text-[#00333e]">140</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Make a Call */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#00333e] flex items-center gap-2">
              <Phone className="w-6 h-6 text-[#00333e]" /> Make a Call
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
                >
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+91">+91</option>
                  <option value="+255">+255</option>
                </select>
                <input
                  type="tel"
                  value={receiverNumber}
                  onChange={(e) => setReceiverNumber(e.target.value)}
                  placeholder="Enter phone number"
                  className="flex-1 text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
                />
              </div>
              <select className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]">
                <option>Choose Contact Group</option>
                <option>Group 1</option>
                <option>Group 2</option>
              </select>
              <select className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]">
                <option>Dropdown Menu</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as 'tts' | 'audio')}
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
              >
                <option value="tts">Use TTS</option>
                <option value="audio">Use Recorded Audio</option>
              </select>
              <button
                onClick={handleMakeCall}
                className="w-full bg-[#00333e] text-white py-2 rounded-lg hover:bg-[#002a36] transition-all"
                disabled={isCalling}
              >
                {isCalling ? 'Calling...' : 'Make Call'}
              </button>
            </div>
          </div>

          {/* Voice Recording and TTS Conversion */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#00333e]">Voice Recording & TTS</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <input
                  type="text"
                  value={ttsMessage}
                  onChange={(e) => setTtsMessage(e.target.value)}
                  placeholder="Enter TTS text to convert"
                  className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
                />
                <button
                  onClick={handleConvertTts}
                  className="w-full bg-[#00333e] text-white py-2 rounded-lg hover:bg-[#002a36] transition-all"
                >
                  Convert TTS to Audio
                </button>
              </div>
              <VoiceRecorder
                onRecordingComplete={handleRecordingComplete}
                onPlay={handlePlay}
                onPause={handlePause}
              />
              <button
                onClick={handleSave}
                className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 flex items-center justify-center gap-2"
                disabled={!audioBlob}
              >
                <Save className="w-5 h-5" /> Save Audio
              </button>
            </div>
          </div>
        </div>

        {/* Call Logs */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-[#00333e]">Call Logs</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="font-medium">Time</div>
            <div className="font-medium">Contact</div>
            <div className="font-medium">Call Duration</div>
            <div className="font-medium">Status</div>
            {callLogs.map((log) => (
              <React.Fragment key={log.call_log_id}>
                <div>{new Date(log.started_at).toLocaleString()}</div>
                <div>{log.receiver_number}</div>
                <div>{formatDuration(log.duration_seconds)}</div>
                <div>{log.status}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
      <audio ref={audioRef} />
    </motion.div>
  );
};

export default Voice;