import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, XCircle, Megaphone, Folder } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getCampaigns, fetchLogs, getContactMetrics } from '../services/api';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface DataPoint {
  name: string;
  value: number;
}

interface DashboardData {
  stats: Stat[];
  data: DataPoint[];
}

const initialDashboardData: DashboardData = {
  stats: [
    { title: 'Messages Sent', value: '0', icon: MessageSquare, color: 'bg-green-500' },
    { title: 'Number of Campaigns', value: '0', icon: Megaphone, color: 'bg-green-500' },
    { title: 'Total Fails', value: '0', icon: XCircle, color: 'bg-green-500' },
    { title: 'Total Contacts', value: '0', icon: Users, color: 'bg-green-500' },
    { title: 'Total Contact Groups', value: '0', icon: Folder, color: 'bg-green-500' },
  ],
  data: [],
};

const Dashboard: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all message logs (non-paginated)
  const fetchAllMessageLogs = useCallback(async () => {
    try {
      const response = await fetchLogs();
      const logs = response.logs || [];
      console.log(`Total message logs: ${logs.length}`);
      return logs;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch message logs');
    }
  }, []);

  // Sync with workspace data only when currentWorkspaceId changes
  useEffect(() => {
    const storedDashboardData = workspace?.dashboardData;
    if (storedDashboardData?.stats?.length || storedDashboardData?.data?.length) {
      setDashboardData({
        stats: storedDashboardData.stats || initialDashboardData.stats,
        data: storedDashboardData.data || initialDashboardData.data,
      });
      setError(null);
    } else {
      setDashboardData(initialDashboardData);
    }
  }, [currentWorkspaceId, workspace?.dashboardData]);

  // Fetch dashboard data when component mounts or workspace changes
  const loadDashboardData = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    const hasValidData =
      workspace?.dashboardData?.stats?.some((stat) => stat.value !== '0') ||
      workspace?.dashboardData?.data?.length > 0;
    if (hasValidData) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [campaigns, contactsMetrics, logs] = await Promise.all([
        getCampaigns(),
        getContactMetrics(),
        fetchAllMessageLogs(),
      ]);

      const messagesSent = logs.filter(
        (log: any) => log.status === 'sent' && log.response_group_name === 'PENDING'
      ).length;
      const numberOfCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
      const totalFails = logs.filter(
        (log: any) => log.response_group_name === 'REJECTED'
      ).length;
      const totalContacts = contactsMetrics.total_contacts || 0;
      const totalContactGroups = contactsMetrics.total_contact_groups || 0;

      const messageVolume = logs.reduce((acc: { [key: string]: number }, log: any) => {
        const date = new Date(log.timestamp).toLocaleDateString();
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {});
      const dataPoints = Object.entries(messageVolume)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => new Date(b.name).getTime() - new Date(a.name).getTime()); // Oldest to newest

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Messages Sent', value: messagesSent.toString(), icon: MessageSquare, color: 'bg-green-500' },
          { title: 'Number of Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, color: 'bg-green-500' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, color: 'bg-green-500' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, color: 'bg-green-500' },
          { title: 'Total Contact Groups', value: totalContactGroups.toString(), icon: Folder, color: 'bg-green-500' },
        ],
        data: dataPoints,
      };

      setDashboardData(newDashboardData);
      updateWorkspace(currentWorkspaceId, { dashboardData: newDashboardData });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.';
      console.error('Failed to fetch dashboard data:', err);
      setError(errorMessage);
      setDashboardData(initialDashboardData);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, updateWorkspace, workspace?.dashboardData, fetchAllMessageLogs]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

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
          {/* Removed retry button */}
        </div>
      )}

      {!isLoading && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
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
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Message Volume</h2>
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