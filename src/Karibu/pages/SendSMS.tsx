// Karibu/pages/SendSMS.tsx
import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import JsonView from '../components/JsonView';
import EndpointCard from '../components/EndpointCard';
import { endpoints } from '../data/endpoints';
import { motion } from 'framer-motion';

const SendSMSAPI: React.FC = () => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string>('POST:/v1/sms/send');
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [code, setCode] = useState(selectedEndpoint.sampleCode);

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoint(prev => (prev === key ? '' : key));
  };

  const selectEndpoint = (endpoint: typeof endpoints[0]) => {
    setExpandedEndpoint(`${endpoint.method}:${endpoint.path}`);
    setSelectedEndpoint(endpoint);
    setCode(endpoint.sampleCode);
  };

  const getMethodColor = (method: string) => {
    const colors = {
      POST: 'emerald',
      GET: 'blue',
      DELETE: 'red',
      PUT: 'yellow',
      PATCH: 'purple',
    };
    return colors[method as keyof typeof colors] || 'gray';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="min-h-[calc(100vh-64px)] w-full bg-[#00333e] text-white font-exo"
    >
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00333e] to-gray-900 opacity-80" />
        <div className="absolute inset-0 tech-circuit-bg animate-circuit-move" />
        <div className="absolute inset-0 particle-bg animate-particle-move" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-64px)] w-full pt-[80px] max-w-7xl mx-auto">
        {/* Left Side: Description and Endpoints (Sticky) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full md:w-[400px] border-r border-gray-700/50 p-6 sticky top-[80px] self-start"
        >
          {/* Header (Non-Scrollable) */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#fddf0d] [text-shadow:_0_0_10px_rgba(253,223,13,0.3)]">
              Send SMS
            </h2>
            <p className="text-gray-400 text-base sm:text-lg">
              Send SMS messages to any phone number worldwide using our simple API.
            </p>
          </div>

          {/* Endpoints List (Scrollable) */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto space-y-4 mt-6">
            {endpoints.map(endpoint => {
              const key = `${endpoint.method}:${endpoint.path}`;
              return (
                <div
                  key={key}
                  onClick={() => selectEndpoint(endpoint)}
                  className={`cursor-pointer rounded-lg transition-all duration-200 ${
                    selectedEndpoint.path === endpoint.path ? 'bg-gray-800 shadow-md' : 'hover:bg-gray-800/50'
                  }`}
                >
                  <EndpointCard
                    endpoint={endpoint}
                    isExpanded={expandedEndpoint === key}
                    onToggle={() => toggleEndpoint(key)}
                    getMethodColor={getMethodColor}
                  />
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Right Side: Code Playground and Payload/Response (Scrollable) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex-1 p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]"
        >
          {/* Code Playground */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">
              Code Playground
            </h3>
            <CodeEditor value={code} onChange={(value) => setCode(value || '')} />
          </div>

          {/* Request and Response */}
          <div className="space-y-8">
            <JsonView
              title="Request Payload"
              data={
                Object.keys(selectedEndpoint.samplePayload).length > 0
                  ? selectedEndpoint.samplePayload
                  : { message: 'No payload required for this endpoint' }
              }
            />
            <JsonView title="Response" data={selectedEndpoint.sampleResponse} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SendSMSAPI;