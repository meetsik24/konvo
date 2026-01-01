import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Settings, Plus, Trash2 } from 'lucide-react';

interface FlowNode {
  id: string;
  type: 'message' | 'input' | 'condition';
  content: string;
}

const Chatbot: React.FC = () => {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: '1', type: 'message', content: 'Welcome! How can I help you today?' },
    { id: '2', type: 'input', content: 'User Input' },
    { id: '3', type: 'condition', content: 'If user mentions "pricing"' },
  ]);

  const addNode = (type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: Date.now().toString(),
      type,
      content: type === 'message' ? 'New message' : type === 'input' ? 'User Input' : 'New condition',
    };
    setNodes([...nodes, newNode]);
  };

  const removeNode = (id: string) => {
    setNodes(nodes.filter(node => node.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <Bot className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Chatbot Builder</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Flow Builder</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => addNode('message')}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Message
                </button>
                <button
                  onClick={() => addNode('condition')}
                  className="btn btn-secondary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Condition
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 rounded-xl border-2 ${
                    node.type === 'message'
                      ? 'border-primary-200 bg-primary-50'
                      : node.type === 'input'
                      ? 'border-secondary-200 bg-secondary-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {node.type === 'message' ? (
                        <MessageSquare className="w-5 h-5 text-primary-500" />
                      ) : node.type === 'input' ? (
                        <Bot className="w-5 h-5 text-secondary-500" />
                      ) : (
                        <Settings className="w-5 h-5 text-gray-500" />
                      )}
                      <input
                        type="text"
                        value={node.content}
                        onChange={(e) => {
                          const newNodes = [...nodes];
                          newNodes[index].content = e.target.value;
                          setNodes(newNodes);
                        }}
                        className="input bg-white"
                      />
                    </div>
                    <button
                      onClick={() => removeNode(node.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-semibold mb-6">Preview</h2>
          <div className="bg-gray-100 rounded-xl p-4 h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  className={`p-3 rounded-xl ${
                    node.type === 'message'
                      ? 'bg-white ml-auto max-w-[80%]'
                      : 'bg-primary-500 text-white max-w-[80%]'
                  }`}
                >
                  {node.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Chatbot;