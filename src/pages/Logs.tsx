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
  }, [currentWorkspaceId, updateWorkspace]);

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
      delivered: <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />,
      failed: <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />,
      pending: <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />,
    };
    return icons[status];
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(
    (log) =>
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <History className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">SMS Logs & History</h1>
      </div>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow max-w-4xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex gap-2 sm:gap-4">
            <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-blue-50 text-blue-600 text-xs sm:text-sm">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" /> SMS Logs
            </button>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search logs..."
              className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center p-3 sm:p-4">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500" />
            <span className="ml-1 sm:ml-2 text-gray-600 text-xs sm:text-sm">Loading SMS logs...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-red-500 text-center p-3 sm:p-4 bg-red-50 rounded text-xs sm:text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-1/4 sm:w-1/5">
                    Recipient
                  </th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm hidden sm:table-cell w-2/5">
                    Content
                  </th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-1/4 sm:w-1/5">
                    Status
                  </th>
                  <th className="text-left py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm hidden sm:table-cell w-1/5">
                    Time
                  </th>
                  <th className="text-right py-2 sm:py-3 px-3 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-1/4 sm:w-1/10">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm truncate">{log.recipient}</td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 hidden sm:table-cell">
                      <p className="text-xs sm:text-sm break-words">{log.content}</p>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      {getStatusIcon(log.status)}
                      <span className="capitalize">{log.status}</span>
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-gray-500 hidden sm:table-cell text-xs sm:text-sm">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2 sm:py-3 px-3 sm:px-4 text-right">
                      <button
                        onClick={() => handleDeleteLog(log.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-6 sm:py-8 text-gray-500 text-xs sm:text-sm">
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