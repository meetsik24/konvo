import React from 'react';
import { motion } from 'framer-motion';

interface Log {
  id?: string;
  message?: string;
  status?: string;
  timestamp?: string;
}

interface Props {
  logs: Log[];
}

const Logs: React.FC<Props> = ({ logs }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white rounded-xl-1g shadow-sm p-6 border border-gray-200"
    role="region"
    aria-label="Sent SMS logs"
  >
    <h2 className="text-xl font-semibold text-[#003087] mb-4">Recent Logs</h2>
    {logs.length === 0 ? (
      <p className="text-gray-500 text-sm">No logs available.</p>
    ) : (
      <div className="space-y-3">
        {logs.map((log) => (
          <motion.div
            key={log.id || log.timestamp}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 border rounded-lg bg-gray-50 text-sm hover:bg-gray-100 transition-colors"
            role="article"
            aria-label="SMS log entry"
          >
            <p className="text-[#003087]">
              <span className="font-medium">Message:</span> {log.message || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Status:</span> {log.status || 'N/A'}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Timestamp:</span>{' '}
              {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

export default Logs;