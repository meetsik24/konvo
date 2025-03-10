// Logs.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, MessageSquare, Mail, Check, X, Clock, Search, Trash2 } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { fetchLogs} from '../services/api';

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
  const [activeTab, setActiveTab] = useState<'sms' | 'email'>('sms');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Map API response to LogEntry
  const mapApiLogToLogEntry = (apiLog: any): LogEntry => ({
    id: apiLog.log_id,
    recipient: apiLog.recipient || 'Unknown', // Placeholder; adjust based on actual API response
    content: apiLog.content || 'No content', // Placeholder; adjust based on actual API response
    status: apiLog.status as 'delivered' | 'failed' | 'pending',
    timestamp: apiLog.timestamp,
  });

  useEffect(() => {
    setLogs(workspace?.logs || []);
    setError(null);
  }, [currentWorkspaceId, workspace]);

  const fetchLogsData = async (type: 'sms' | 'email') => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLogs();
      const logsToUse = type === 'sms' ? data.smsLogs : data.emailLogs;
      if (!logsToUse || !Array.isArray(logsToUse.logs) || logsToUse.logs.length === 0) {
        throw new Error(`No ${type} logs returned from the server.`);
      }
      const mappedLogs = logsToUse.logs.map(mapApiLogToLogEntry);
      setLogs(mappedLogs);
      if (currentWorkspaceId) {
        updateWorkspace(currentWorkspaceId, { logs: mappedLogs });
      }
      setError(null);
    } catch (error) {
      console.error(`Failed to fetch ${type} logs:`, error);
      setError(`Unable to fetch ${type} logs from the server. ${error.message}`);
      setLogs([]);
    } finally {
      setLoading(false);
    };

  useEffect(() => {
    fetchLogsData(activeTab);
  }, [activeTab, currentWorkspaceId]);

  const handleDeleteLog = (id: string) => {
    if (window.confirm('Are you sure you want to delete this log entry?')) {
      const updatedLogs = logs.filter((log) => log.id !== id);
      setLogs(updatedLogs);
      if (currentWorkspaceId) {
        updateWorkspace(currentWorkspaceId, { logs: updatedLogs });
      }
    }
  };

  const getStatusIcon = (status: LogEntry['status']) => {
    switch (status) {
      case 'delivered': return <Check className="w-5 h-5 text-green-500" />;
      case 'failed': return <X className="w-5 h-5 text-red-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <History className="w-8 h-8 text-primary-500" />
        <h1 className="text-3xl font-bold text-gray-800">Logs & History</h1>
      </div>
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="flex gap-4">
            <button onClick={() => setActiveTab('sms')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'sms' ? 'bg-primary-50 text-primary-500' : 'text-gray-500'}`}>
              <MessageSquare className="w-5 h-5" /> SMS Logs
            </button>
            <button onClick={() => setActiveTab('email')} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${activeTab === 'email' ? 'bg-primary-50 text-primary-500' : 'text-gray-500'}`}>
              <Mail className="w-5 h-5" /> Email Logs
            </button>
          </div>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search logs..." className="input pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {loading && (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500" />
            <p className="ml-2 text-gray-600">Loading {activeTab} logs...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-red-500 text-center p-4">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Recipient</th>
                  <th className="text-left py-3 px-4 font-medium">Content</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Time</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-3 px-4">{log.recipient}</td>
                    <td className="py-3 px-4"><p className="truncate max-w-md">{log.content}</p></td>
                    <td className="py-3 px-4"><div className="flex items-center gap-2">{getStatusIcon(log.status)}<span className="capitalize">{log.status}</span></div></td>
                    <td className="py-3 px-4 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => handleDeleteLog(log.id)} className="btn btn-icon btn-ghost text-red-500">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-gray-500">No {activeTab} logs found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};
};

export default Logs;