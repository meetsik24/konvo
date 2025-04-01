import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Clock, Search, Download } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { fetchLogs } from '../services/api';

interface LogEntry {
  id: string;
  recipient: string;
  sender: string;
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
    sender: apiLog.sender_id || 'Unknown', // Map sender_id to sender
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

  // Debug logs to verify sender field
  useEffect(() => {
    console.log('Fetched Logs:', logs);
  }, [logs]);

  // Group logs by content and aggregate data
  const groupLogsByContent = (logs: LogEntry[]) => {
    const grouped = logs.reduce((acc, log) => {
      const content = log.content;
      if (!acc[content]) {
        acc[content] = {
          content,
          senders: new Set<string>(),
          recipients: new Set<string>(),
          statuses: { delivered: 0, failed: 0, pending: 0 },
          latestTimestamp: log.timestamp,
          entries: [],
        };
      }
      acc[content].senders.add(log.sender);
      acc[content].recipients.add(log.recipient);
      acc[content].statuses[log.status] += 1;
      acc[content].latestTimestamp = new Date(log.timestamp) > new Date(acc[content].latestTimestamp)
        ? log.timestamp
        : acc[content].latestTimestamp;
      acc[content].entries.push(log);
      return acc;
    }, {} as Record<string, {
      content: string;
      senders: Set<string>;
      recipients: Set<string>;
      statuses: { delivered: number; failed: number; pending: number };
      latestTimestamp: string;
      entries: LogEntry[];
    }>);

    return Object.values(grouped).map(group => ({
      ...group,
      senders: Array.from(group.senders),
      recipients: Array.from(group.recipients),
    }));
  };

  // Delete all logs in a group
  const handleDeleteGroup = (ids: string[]) => {
    if (window.confirm(`Are you sure you want to delete ${ids.length} log entries?`)) {
      const updatedLogs = logs.filter((log) => !ids.includes(log.id));
      setLogs(updatedLogs);
      if (currentWorkspaceId) {
        updateWorkspace(currentWorkspaceId, { logs: updatedLogs });
      }
    }
  };

  // Get status icon and label for the group
  const getGroupStatus = (statuses: { delivered: number; failed: number; pending: number }) => {
    if (statuses.failed > 0) {
      return {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        label: `Undeliverable - Handset errors`,
      };
    } else if (statuses.pending > 0) {
      return {
        icon: <Clock className="w-5 h-5 text-yellow-500" />,
        label: `Pending`,
      };
    } else {
      return {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
        label: `Delivered - No errors`,
      };
    }
  };

  // Filter logs based on search query
  const filteredLogs = logs.filter(
    (log) =>
      log.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered logs by content
  const groupedLogs = groupLogsByContent(filteredLogs);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 space-y-4 sm:space-y-6"
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Logs</h1>
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow w-full">
        {/* Header with Search and Export */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative w-full sm:w-1/2">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by message id, email subject, sender name, destination, or data payload..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
        </div>

        {/* Showing Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {groupedLogs.length} of {groupedLogs.length}
        </div>

        {loading && (
          <div className="flex justify-center items-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            <span className="ml-2 text-gray-600 text-sm">Loading logs...</span>
          </div>
        )}

        {error && !loading && (
          <div className="text-red-500 text-center p-4 bg-red-50 rounded text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm w-full sm:w-2/5">
                    Message
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm hidden sm:table-cell sm:w-1/5">
                    From
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm hidden sm:table-cell sm:w-1/5">
                    To
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm hidden sm:table-cell sm:w-1/5">
                    Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600 text-sm sm:w-1/10"></th>
                </tr>
              </thead>
              <tbody>
                {groupedLogs.map((group, index) => {
                  const statusInfo = getGroupStatus(group.statuses);
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {group.entries.length}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              Outbound calls - {statusInfo.label}
                            </p>
                            <p className="text-gray-600 text-sm break-words">
                              {group.content}
                              {/* Show From, To, and Date on mobile */}
                              <span className="block sm:hidden text-gray-500 text-xs mt-1">
                                From: {group.senders.join(', ')} | To: {group.recipients.join(', ')} |{' '}
                                {new Date(group.latestTimestamp).toLocaleString('en-US', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: 'numeric',
                                  minute: 'numeric',
                                  hour12: true,
                                })}
                              </span>
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
                        {group.senders.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
                        {group.recipients.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
                        {new Date(group.latestTimestamp).toLocaleString('en-US', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                          hour12: true,
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {statusInfo.icon}
                      </td>
                    </tr>
                  );
                })}
                {groupedLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 text-sm">
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