import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Save, Play, Pause } from 'lucide-react';
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
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [receiverNumber, setReceiverNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [messageType, setMessageType] = useState<'tts' | 'audio' | 'sample'>('audio');
  const [ttsMessage, setTtsMessage] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [selectedSampleAudio, setSelectedSampleAudio] = useState<string | null>(null);
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
      try {
        const mockWorkspaceId = 'default-workspace-id';
        const response = await getCallLogs(mockWorkspaceId);
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
  }, []);

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
    console.log('handleMakeCall - receiverNumber:', receiverNumber, 'trimmedNumber:', trimmedNumber);

    if (!trimmedNumber) {
      setError('Please enter a phone number.');
      return;
    }

    let finalAudioUrl: string | undefined = undefined;
    let finalTtsMessage: string | undefined = undefined;

    if (messageType === 'tts') {
      if (!ttsMessage) {
        setError('Please enter a TTS message.');
        return;
      }
      finalTtsMessage = ttsMessage;
    } else if (messageType === 'audio') {
      if (!audioUrl) {
        setError('Please record an audio message.');
        return;
      }
      finalAudioUrl = audioUrl;
    } else if (messageType === 'sample') {
      if (!selectedSampleAudio) {
        setError('Please select a sample audio.');
        return;
      }
      finalAudioUrl = selectedSampleAudio;
    }

    setIsCalling(true);
    setCallActive(true);
    setCallDuration(0);
    try {
      const fullNumber = `${countryCode}${trimmedNumber}`.replace(/\s/g, '');
      console.log('Full number to be sent:', fullNumber);
      console.log('Message type:', messageType, 'Audio URL:', finalAudioUrl, 'TTS Message:', finalTtsMessage);

      const data: CallRequest = {
        receiver_number: fullNumber,
        tts_message: finalTtsMessage,
        audio_url: finalAudioUrl,
      };
      console.log('Call request data:', data);
      const mockWorkspaceId = 'default-workspace-id'; // Replace with actual workspaceId if needed
      const response = await makeCall(mockWorkspaceId, data);
      console.log('Call made successfully:', response);
      const logsResponse = await getCallLogs(mockWorkspaceId);
      if (logsResponse) setCallLogs(logsResponse.logs || []);
      setReceiverNumber('');
      setTtsMessage('');
      setAudioUrl('');
      setAudioBlob(null);
      setSelectedSampleAudio(null);
      setShowSuccessNotification(true);
      setTimeout(() => setShowSuccessNotification(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to make call.');
      console.error('Call failed:', err);
    } finally {
      setIsCalling(false);
      setCallActive(false);
    }
  };

  const handleRecordingComplete = (blob: Blob | null, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setSelectedSampleAudio(null); // Clear sample audio selection
  };

  const handlePlay = () => {
    if (audioRef.current && (audioUrl || selectedSampleAudio)) {
      audioRef.current.src = audioUrl || selectedSampleAudio || '';
      audioRef.current.play().catch((err) => setError('Playback failed: ' + err.message));
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
      setSelectedSampleAudio(null); // Clear sample audio selection
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
      className="min-h-screen bg-gray-100 p-6 sm:p-8 lg:p-10"
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
            <p>Performed at 10:23 PM EAT, May 21, 2025.</p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg w-full max-w-3xl mx-auto mb-6">
          {error}
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Calls</p>
            <p className="text-2xl font-bold text-[#00333e]">{callLogs.length || 150}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">Total Minutes</p>
            <p className="text-2xl font-bold text-[#00333e]">
              {callLogs.reduce((sum, log) => sum + log.duration_seconds, 0) / 60 || 120}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">Rejected</p>
            <p className="text-2xl font-bold text-[#00333e]">
              {callLogs.filter((log) => log.status === 'failed').length || 10}
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <p className="text-sm text-gray-600 mb-2">Received</p>
            <p className="text-2xl font-bold text-[#00333e]">
              {callLogs.filter((log) => log.status === 'completed').length || 140}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Make a Call Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#00333e] flex items-center gap-2">
              <Phone className="w-6 h-6 text-[#00333e]" /> Make a Call
            </h2>
            <form onSubmit={handleMakeCall} className="space-y-4">
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
                  onChange={(e) => {
                    setReceiverNumber(e.target.value);
                    console.log('Phone number input changed:', e.target.value);
                  }}
                  placeholder="Enter Phone Number"
                  className="flex-1 text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
                  required
                />
              </div>
              <select
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
              >
                <option>Choose Contact Group</option>
                <option>Group 1</option>
                <option>Group 2</option>
              </select>
              <select
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as 'tts' | 'audio' | 'sample')}
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
              >
                <option value="tts">Use TTS</option>
                <option value="audio">Use Recorded Audio</option>
                <option value="sample">Use Sample Audio</option>
              </select>
              {messageType === 'sample' && (
                <select
                  value={selectedSampleAudio || ''}
                  onChange={(e) => {
                    setSelectedSampleAudio(e.target.value);
                    setAudioUrl(''); // Clear recorded audio
                    setAudioBlob(null);
                  }}
                  className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
                >
                  <option value="">Select Sample Audio</option>
                  <option value="https://github.com/BRIQ-BLOCK/briq-block.github.io/raw/main/swahili-demo.wav">
                    Swahili Demo
                  </option>
                  <option value="https://github.com/BRIQ-BLOCK/briq-block.github.io/raw/main/voice-demo.wav">
                    Voice Demo
                  </option>
                </select>
              )}
              {messageType === 'sample' && selectedSampleAudio && (
                <div className="flex items-center gap-3">
                  <audio ref={audioRef} src={selectedSampleAudio} className="w-full" controls />
                  <button onClick={handlePlay} className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]">
                    <Play className="w-5 h-5" />
                  </button>
                  <button onClick={handlePause} className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]">
                    <Pause className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-[#00333e] text-white py-2 rounded-lg hover:bg-[#002a36] transition-all"
                disabled={isCalling}
              >
                {isCalling ? 'Calling...' : 'Make Call'}
              </button>
            </form>
          </div>

          {/* Voice Recording & TTS Section */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-[#00333e]">Voice Recording</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={ttsMessage}
                onChange={(e) => setTtsMessage(e.target.value)}
                placeholder="Text to Speech"
                className="w-full text-sm py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fddf0d] focus:border-[#fddf0d]"
              />
              <button
                onClick={handleConvertTts}
                className="w-full bg-[#00333e] text-white py-2 rounded-lg hover:bg-[#002a36] transition-all"
              >
                Convert to Audio
              </button>
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
                <Save className="w-5 h-5" /> Save
              </button>
            </div>
          </div>
        </div>

        {/* Call Logs Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-[#00333e]">Call Logs</h2>
          {callLogs.length === 0 ? (
            <p className="text-gray-500 text-sm">No call logs available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-4 font-medium text-[#00333e]">Time</th>
                    <th className="py-2 px-4 font-medium text-[#00333e]">Contact</th>
                    <th className="py-2 px-4 font-medium text-[#00333e]">Call Duration</th>
                    <th className="py-2 px-4 font-medium text-[#00333e]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {callLogs.map((log) => (
                    <tr key={log.call_log_id} className="border-b border-gray-100">
                      <td className="py-2 px-4">{new Date(log.started_at).toLocaleString()}</td>
                      <td className="py-2 px-4">{log.receiver_number}</td>
                      <td className="py-2 px-4">{formatDuration(log.duration_seconds)}</td>
                      <td className="py-2 px-4">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs ${
                            log.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : log.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <audio ref={audioRef} />
    </motion.div>
  );
};

export default Voice;