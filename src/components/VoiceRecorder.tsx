import React, { useState, useRef, useEffect } from 'react';
import { Mic, Play, Pause, Trash2 } from 'lucide-react';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob | null, url: string) => void;
  onPlay: () => void;
  onPause: () => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onRecordingComplete, onPlay, onPause }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob, url);

        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      mediaRecorderRef.current.onerror = (event) => {
        setError('Recording failed: ' + (event as any).error?.message);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setError(null);
    } catch (err: any) {
      setError('Failed to start recording: ' + err.message);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => setError('Playback failed: ' + err.message));
      onPlay();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      onPause();
    }
  };

  const handleDelete = () => {
    setAudioUrl('');
    onRecordingComplete(null, '');
    if (audioRef.current) audioRef.current.src = '';
  };

  const handlePreview = (url: string) => {
    setAudioUrl(url);
    onRecordingComplete(null, url);
    if (audioRef.current) audioRef.current.src = url;
  };

  return (
    <div className="space-y-4">
      {error && <div className="bg-red-50 border border-red-200 text-red-600 p-2 rounded-lg text-sm">{error}</div>}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00333e] hover:bg-[#002a36]'
        }`}
        disabled={!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia}
      >
        <Mic className="w-5 h-5" /> {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#00333e]">Preview Sample Audio:</p>
        <div className="flex gap-2">
          <button
            onClick={() =>
              handlePreview('https://github.com/BRIQ-BLOCK/briq-block.github.io/raw/main/swahili-demo.wav')
            }
            className="bg-[#00333e] text-white py-1 px-3 rounded-lg text-sm hover:bg-[#002a36]"
          >
            Swahili Demo
          </button>
          <button
            onClick={() =>
              handlePreview('https://github.com/BRIQ-BLOCK/briq-block.github.io/raw/main/voice-demo.wav')
            }
            className="bg-[#00333e] text-white py-1 px-3 rounded-lg text-sm hover:bg-[#002a36]"
          >
            Voice Demo
          </button>
        </div>
      </div>
      {audioUrl && (
        <div className="flex items-center gap-3">
          <audio ref={audioRef} src={audioUrl} className="w-full" controls />
          <button onClick={handlePlay} className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]">
            <Play className="w-5 h-5" />
          </button>
          <button onClick={handlePause} className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]">
            <Pause className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;