import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mic, VolumeX, Volume2, PlayCircle } from 'lucide-react';

const Voice: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [callNumber, setCallNumber] = useState('');

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleCall = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement voice call logic
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Phone className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Voice API</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Phone className="w-6 h-6 text-primary-500" />
            Make a Call
          </h2>
          <form onSubmit={handleCall} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="flex gap-3">
                <div className="w-24">
                  <select className="input">
                    <option>+1</option>
                    <option>+44</option>
                    <option>+91</option>
                  </select>
                </div>
                <input
                  type="tel"
                  className="input"
                  placeholder="(555) 123-4567"
                  value={callNumber}
                  onChange={(e) => setCallNumber(e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              Start Call
            </button>
          </form>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Mic className="w-6 h-6 text-primary-500" />
            Voice Recording
          </h2>
          <div className="space-y-6">
            <div className="flex justify-center">
              <button
                onClick={toggleRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-500 text-white' : 'bg-primary-500 text-white'
                }`}
              >
                <Mic className="w-12 h-12" />
              </button>
            </div>
            <div className="flex justify-center gap-4">
              <button className="btn btn-secondary flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Play
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                Volume
              </button>
              <button className="btn btn-secondary flex items-center gap-2">
                <VolumeX className="w-5 h-5" />
                Mute
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-8">
        <h2 className="text-xl font-semibold mb-6">Recent Calls</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((call) => (
            <div
              key={call}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-4">
                <Phone className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="font-medium">+1 (555) 123-456{call}</p>
                  <p className="text-sm text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                Completed
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Voice;