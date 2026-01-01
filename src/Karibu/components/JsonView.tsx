import React from 'react';

interface JsonViewProps {
  title: string;
  data: any;
}

const JsonView: React.FC<JsonViewProps> = ({ title, data }) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-[var(--text-secondary)]">{title}</h3>
      <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default JsonView;