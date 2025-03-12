import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, XCircle, Megaphone, RefreshCw } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getCampaigns,
  getContacts,
  getMessageLogs,
} from '../services/api';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface DataPoint {
  name: string; // e.g., date
  value: number; // e.g., message count
}

interface DashboardData {
  stats: Stat[];
  data: DataPoint[];
}

const initialDashboardData: DashboardData = {
  stats: [
    { title: 'Total Messages', value: '0', icon: MessageSquare, color: 'bg-blue-500' },
    { title: 'Number of Campaigns', value: '0', icon: Megaphone, color: 'bg-yellow-500' },
    { title: 'Total Fails', value: '0', icon: XCircle, color: 'bg-red-500' },
    { title: 'Total Contacts', value: '0', icon: Users, color: 'bg-teal-500' },
  ],
  data: [],
};

const Dashboard: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync with workspace data on workspace change
  useEffect(() => {
    if (workspace?.dashboardData?.stats?.length || workspace?.dashboardData?.data?.length) {
      setDashboardData({
        stats: workspace.dashboardData.stats || initialDashboardData.stats,
        data: workspace.dashboardData.data || initialDashboardData.data,
      });
      setError(null);
    } else {
      setDashboardData(initialDashboardData);
    }
  }, [currentWorkspaceId, workspace]);

  // Fetch dashboard data when component mounts or workspace changes
  useEffect(() => {
    const loadDashboardData = async () => {
      if (!currentWorkspaceId || (workspace?.dashboardData?.stats?.length && workspace?.dashboardData?.data?.length)) {
        return; // Skip if no workspace or data already loaded in workspace
      }

      setIsLoading(true);
      setError(null);
      try {
        // Fetch data from multiple endpoints
        const [campaigns, contacts, logsResponse] = await Promise.all([
          getCampaigns(),
          getContacts(currentWorkspaceId),
          getMessageLogs(),
        ]);

        // Extract logs from the response (logsResponse is { user_id, logs })
        const logs = logsResponse?.logs || [];

        // Compute stats
        const totalMessages = logs.length;
        const numberOfCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
        const totalFails = logs.filter((log) => log.status === 'failed').length;
        const totalContacts = Array.isArray(contacts) ? contacts.length : 0;

        // Approximate message volume by grouping logs by date
        const messageVolume = logs.reduce((acc: { [key: string]: number }, log) => {
          const date = new Date(log.timestamp).toLocaleDateString();
          acc[date] = (acc[date] || 0) + 1;
          return acc;
        }, {});
        const dataPoints = Object.entries(messageVolume).map(([name, value]) => ({ name, value }));

        const newDashboardData: DashboardData = {
          stats: [
            { title: 'Total Messages', value: totalMessages.toString(), icon: MessageSquare, color: 'bg-blue-500' },
            { title: 'Number of Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, color: 'bg-yellow-500' },
            { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, color: 'bg-red-500' },
            { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, color: 'bg-teal-500' },
          ],
          data: dataPoints,
        };

        if (!newDashboardData.stats.some((stat) => stat.value !== '0') && !newDashboardData.data.length) {
          throw new Error('No valid dashboard data returned from the server.');
        }

        setDashboardData(newDashboardData);
        if (currentWorkspaceId) {
          updateWorkspace(currentWorkspaceId, { dashboardData: newDashboardData });
        }
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch dashboard data.';
        console.error('Failed to fetch dashboard data:', err);
        setError(errorMessage);
        setDashboardData(initialDashboardData);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [currentWorkspaceId, updateWorkspace, workspace]);

  // Refresh dashboard data manually
  const refreshDashboardData = async () => {
    setIsLoading(true);
    try {
      const [campaigns, contacts, logsResponse] = await Promise.all([
        getCampaigns(),
        getContacts(currentWorkspaceId),
        getMessageLogs(),
      ]);

      const logs = logsResponse?.logs || [];

      const totalMessages = logs.length;
      const numberOfCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
      const totalFails = logs.filter((log) => log.status === 'failed').length;
      const totalContacts = Array.isArray(contacts) ? contacts.length : 0;

      const messageVolume = logs.reduce((acc: { [key: string]: number }, log) => {
        const date = new Date(log.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const dataPoints = Object.entries(messageVolume).map(([name, value]) => ({ name, value }));

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Total Messages', value: totalMessages.toString(), icon: MessageSquare, color: 'bg-blue-500' },
          { title: 'Number of Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, color: 'bg-yellow-500' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, color: 'bg-red-500' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, color: 'bg-teal-500' },
        ],
        data: dataPoints,
      };

      setDashboardData(newDashboardData);
      if (currentWorkspaceId) {
        updateWorkspace(currentWorkspaceId, { dashboardData: newDashboardData });
      }
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to refresh dashboard data.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto" />
          <p className="text-gray-600 mt-2">Loading dashboard data...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="text-red-500 text-center mb-4">
          {error}
          <button
            onClick={refreshDashboardData}
            className="ml-2 btn btn-sm btn-secondary"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="card transform transition-transform duration-300 rounded-md shadow-sm hover:shadow-md"
            >
              <div className="flex items-center p-4">
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card rounded-md shadow-sm p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Message Volume</h2>
            <button
              onClick={refreshDashboardData}
              className="btn btn-sm btn-secondary"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
          </div>
          <div className="h-80">
            {dashboardData.data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.data}>
                  <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    dot={{ fill: '#0ea5e9' }}
                    fillOpacity={1}
                    fill="url(#colorUv)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No message volume data available.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;