// components/EndpointCard.tsx
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EndpointCardProps {
  endpoint: {
    method: string;
    path: string;
    description: string;
    // Add other fields as needed (e.g., sampleCode, samplePayload)
  };
  isExpanded: boolean;
  onToggle: () => void;
  getMethodColor: (method: string) => string;
}

const EndpointCard: React.FC<EndpointCardProps> = ({ endpoint, isExpanded, onToggle, getMethodColor }) => {
  const methodColor = `text-${getMethodColor(endpoint.method)}-500`;

  return (
    <div className="p-4 rounded-lg transition-all duration-200">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <span
            className={`font-mono text-sm font-semibold ${methodColor} bg-gray-800 px-2 py-1 rounded`}
          >
            {endpoint.method}
          </span>
          <span className="text-gray-200 font-medium">{endpoint.path}</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="text-gray-400" size={20} />
        ) : (
          <ChevronDown className="text-gray-400" size={20} />
        )}
      </div>
      {isExpanded && (
        <div className="mt-3 text-gray-400 text-sm pl-4 border-l-2 border-gray-700">
          <p>{endpoint.description}</p>
          {/* Add more details here if needed, e.g., parameters */}
        </div>
      )}
    </div>
  );
};

export default EndpointCard;