import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, MessageSquare, Mail, Check, X, Clock, Search } from 'lucide-react';

interface LogEntry {
  id: string;
  recipient: string;
  content: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
}

const Logs = () => {
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async (type: 'sms' | 'email') => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/logs/${type}`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs(activeTab);
  }, [activeTab]);

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'delivered':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <X className="w-5 h-5 text-red-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const filteredLogs = logs.filter(log => 
    log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <History className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Logs & History</h1>
      </div>

      <div className="card p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('sms')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                activeTab === 'sms' ? 'bg-primary-50 text-primary-500' : 'text-gray-500'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              SMS Logs
            </button>
            <button
              onClick={() => setActiveTab('email')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                activeTab === 'email' ? 'bg-primary-50 text-primary-500' : 'text-gray-500'
              }`}
            >
              <Mail className="w-5 h-5" />
              Email Logs
            </button>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              className="input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium">Content</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-3 px-4">{log.recipient}</td>
                    <td className="py-3 px-4">
                      <p className="truncate max-w-md">{log.content}</p>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(log.status)}
                        <span className="capitalize">{log.status}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Logs;
