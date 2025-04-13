import React, { useState } from 'react';
import CodeEditor from '../components/CodeEditor';
import JsonView from '../components/JsonView';
import EndpointCard from '../components/EndpointCard';
import { endpoints } from '../data/endpoints';

const SendSMSAPI: React.FC = () => {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string>('POST:/v1/sms/send'); // Single active endpoint
  const [selectedEndpoint, setSelectedEndpoint] = useState(endpoints[0]);
  const [code, setCode] = useState(selectedEndpoint.sampleCode);

  const toggleEndpoint = (key: string) => {
    setExpandedEndpoint(prev => (prev === key ? '' : key)); // Toggle: collapse if same, expand if different
  };

  const selectEndpoint = (endpoint: typeof endpoints[0]) => {
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
    <div className="flex-1 flex bg-[#00333e] text-white min-h-screen">
      {/* Sidebar */}
      <div className="w-[500px] border-r border-gray-800 p-8 space-y-6 overflow-y-auto ">
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-teal-400">Send SMS</h2>
          <p className="text-gray-300 text-lg mb-6">
            Send SMS messages to any phone number worldwide using our simple API.
          </p>
        </div>
        <div className="space-y-4">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 space-y-8 ">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-300 uppercase tracking-wide">Code Playground</h3>
          <CodeEditor value={code} onChange={(value) => setCode(value || '')} />
        </div>
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
      </div>
    </div>
  );
};

export default SendSMSAPI;