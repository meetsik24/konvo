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
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        onRecordingComplete(blob, url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error starting recording:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
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
  };

  return (
    <div className="space-y-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-2 rounded-lg text-white flex items-center justify-center gap-2 ${
          isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-[#00333e] hover:bg-[#002a36]'
        }`}
      >
        <Mic className="w-5 h-5" /> {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>

      {audioUrl && (
        <div className="flex items-center gap-3">
          <audio ref={audioRef} src={audioUrl} className="w-full" />
          <button
            onClick={handlePlay}
            className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]"
          >
            <Play className="w-5 h-5" />
          </button>
          <button
            onClick={handlePause}
            className="bg-[#00333e] text-white p-2 rounded-lg hover:bg-[#002a36]"
          >
            <Pause className="w-5 h-5" />
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;