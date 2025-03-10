// Logs.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, MessageSquare, Check, X, Clock, Search, Trash2 } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { fetchLogs } from '../services/api';

interface LogEntry {
  id: string;
  recipient: string;
  content: string;
  status: 'delivered' | 'failed' | 'pending';
  timestamp: string;
}

const Logs: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [logs, setLogs] = useState<LogEntry[]>(workspace?.logs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Map API response to LogEntry
  const mapApiLogToLogEntry = (apiLog: any): LogEntry => ({
    id: apiLog.log_id,
    recipient: apiLog.recipient || 'Unknown',
    content: apiLog.content || 'No content',
    status: apiLog.status as 'delivered' | 'failed' | 'pending',
    timestamp: apiLog.timestamp,
  });

  // Fetch logs on mount or workspace change
  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      try {
        const data = await fetchLogs();
        const mappedLogs = data.logs.map(mapApiLogToLogEntry);
        setLogs(mappedLogs);
        if (currentWorkspaceId) {
          updateWorkspace(currentWorkspaceId, { logs: mappedLogs });
        }
        setError(null);
      } catch (err) {
        setError((err as Error).message);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, [currentWorkspaceId]);

  // Delete log entry
  const handleDeleteLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      const updatedLogs = logs.filter((log) => log.id !== id);
      setLogs(updatedLogs);
      if (currentWorkspaceId) {
        updateWorkspace(currentWorkspaceId, { logs: updatedLogs });
      }
    }
  };

  // Get status icon based on log status
  const getStatusIcon = (status: LogEntry['status']) => {
    const icons = {
      delivered: <Check className="w-5 h-5 text-green-500" />,
      failed: <X className="w-5 h-5 text-red-500" />,
      pending: <Clock className="w-5 h-5 text-yellow-500" />,
    };
    return icons[status];
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(log =>
    log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center gap-3">
        <History className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-800">SMS Logs & History</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare className="w-5 h-5" /> SMS Logs
            </button>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2 text-gray-600">Loading SMS logs...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Content</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Time</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{log.recipient}</td>
                    <td className="py-3 px-4"><p className="truncate max-w-md">{log.content}</p></td>
                    <td className="py-3 px-4 flex items-center gap-2">
                      {getStatusIcon(log.status)}
                      <span className="capitalize">{log.status}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No SMS logs found.
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