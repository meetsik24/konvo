import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Play, Copy, Check } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange }) => {
  const [output, setOutput] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);

  const handleRunCode = () => {
    try {
      const safeEval = new Function(value);
      const consoleLog = console.log;
      let outputString = '';
      
      console.log = (...args) => {
        outputString += args.join(' ') + '\n';
      };
      
      safeEval();
      console.log = consoleLog;
      setOutput(outputString || 'Done');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Syntax error'}`);
    }
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1500);
  };

  return (
    <div className="code-editor-container">
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleRunCode}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          title="Run code"
        >
          <Play size={14} />
        </button>
        <button
          onClick={handleCopyCode}
          className="p-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition-colors"
          title={isCopied ? "Copied!" : "Copy code"}
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <div className="border border-gray-800 rounded overflow-hidden">
        <Editor
          height="300px"
          defaultLanguage="javascript"
          theme="vs-dark"
          value={value}
          onChange={onChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>
      {output && (
        <div className="mt-2 p-2 bg-[#00333e] text-gray-300 text-sm rounded">
          {output}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;