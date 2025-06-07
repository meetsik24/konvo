import React from 'react';

interface ModeTabsProps {
  mode: string;
  setMode: (mode: 'instant' | 'campaign' | 'file') => void;
}

const ModeTabs: React.FC<ModeTabsProps> = ({ mode, setMode }) => (
  <div className="flex border-b border-gray-200 mb-4">
    {['Instant SMS', 'Create Campaign', 'Send File SMS'].map((label, i) => (
      <button
        key={label}
        onClick={() => {
          console.log(`Switching to mode: ${['instant', 'campaign', 'file'][i]}`);
          setMode(['instant', 'campaign', 'file'][i] as 'instant' | 'campaign' | 'file');
        }}
        className={`flex-1 py-2 px-3 text-sm font-medium text-center transition-colors ${
          mode === ['instant', 'campaign', 'file'][i]
            ? 'border-b-2 border-[#00333e] text-[#00333e]'
            : 'text-gray-600 hover:text-[#00333e]'
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

export default ModeTabs;