import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, XCircle, Megaphone, Folder, TrendingUp } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getCampaigns, fetchLogs, getContactMetrics } from '../services/api';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  titleLine1: string;
  titleLine2: string;
}

interface DataPoint {
  name: string;
  value: number;
}

interface Campaign {
  campaign_id: string;
  name: string;
  created_at: string;
  status: string;
}

interface DashboardData {
  stats: Stat[];
  data: DataPoint[];
  campaigns: Campaign[];
}

const initialDashboardData: DashboardData = {
  stats: [
    { title: 'Messages Sent', value: '0', icon: MessageSquare, gradient: 'from-blue-500 to-blue-600', titleLine1: 'Messages', titleLine2: 'Sent' },
    { title: 'Number of Campaigns', value: '0', icon: Megaphone, gradient: 'from-green-500 to-green-600', titleLine1: 'Number of', titleLine2: 'Campaigns' },
    { title: 'Total Fails', value: '0', icon: XCircle, gradient: 'from-red-500 to-red-600', titleLine1: 'Total', titleLine2: 'Fails' },
    { title: 'Total Contacts', value: '0', icon: Users, gradient: 'from-purple-500 to-purple-600', titleLine1: 'Total', titleLine2: 'Contacts' },
    { title: 'Total Contact Groups', value: '0', icon: Folder, gradient: 'from-yellow-500 to-yellow-600', titleLine1: 'Total Contact', titleLine2: 'Groups' },
  ],
  data: [],
  campaigns: [],
};

const Dashboard: React.FC = () => {
  interface Workspace {
    dashboardData?: DashboardData;
  }
  
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllMessageLogs = useCallback(async () => {
    try {
      const response = await fetchLogs();
      const logs = response.logs || [];
      console.log('Fetched logs:', logs);
      return logs;
    } catch (error: any) {
      console.error('Error fetching logs:', error.message);
      throw new Error(error.message || 'Failed to fetch message logs');
    }
  }, []);

  useEffect(() => {
    const storedDashboardData = workspace?.dashboardData;
    if (storedDashboardData?.stats?.length || storedDashboardData?.data?.length || storedDashboardData?.campaigns?.length) {
      setDashboardData({
        stats: storedDashboardData.stats || initialDashboardData.stats,
        data: storedDashboardData.data || initialDashboardData.data,
        campaigns: storedDashboardData.campaigns || initialDashboardData.campaigns,
      });
      setError(null);
    } else {
      setDashboardData(initialDashboardData);
    }
  }, [currentWorkspaceId, workspace?.dashbgitoardData]);

  const loadDashboardData = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    const hasValidData =
      workspace?.dashboardData?.stats?.some((stat: Stat) => stat.value !== '0') ||
      workspace?.dashboardData?.data?.length > 0 ||
      workspace?.dashboardData?.campaigns?.length > 0;
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
        (log: any) => log.status === 'delivered' && log.response_group_name !== 'REJECTED'
      ).length;
      const numberOfCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
      const totalFails = logs.filter(
        (log: any) => log.status === 'failed'
      ).length;
      const totalContacts = contactsMetrics.total_contacts || 0;
      const totalContactGroups = contactsMetrics.total_contact_groups || 0;

      const messageVolume: { [key: string]: number } = {};
      logs.forEach((log: any) => {
        const timestamp = log.timestamp;
        if (!timestamp || isNaN(new Date(timestamp).getTime())) {
          console.warn('Invalid timestamp in log:', log);
          return;
        }
        const date = new Date(timestamp).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        messageVolume[date] = (messageVolume[date] || 0) + 1;
      });

      const dataPoints = Object.entries(messageVolume)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

      console.log('Processed data points for chart:', dataPoints);

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Messages Sent', value: messagesSent.toString(), icon: MessageSquare, gradient: 'from-blue-500 to-blue-600', titleLine1: 'Messages', titleLine2: 'Sent' },
          { title: 'Number of Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, gradient: 'from-green-500 to-green-600', titleLine1: 'Number of', titleLine2: 'Campaigns' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, gradient: 'from-red-500 to-red-600', titleLine1: 'Total', titleLine2: 'Fails' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, gradient: 'from-purple-500 to-purple-600', titleLine1: 'Total', titleLine2: 'Contacts' },
          { title: 'Total Contact Groups', value: totalContactGroups.toString(), icon: Folder, gradient: 'from-yellow-500 to-yellow-600', titleLine1: 'Total Contact', titleLine2: 'Groups' },
        ],
        data: dataPoints,
        campaigns: Array.isArray(campaigns) ? campaigns : [],
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
    <div className="min-h-[calc(100vh-3.5rem)] flex flex-col p-4 sm:p-6 max-w-6xl mx-auto w-full">
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center flex-1">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#00333e]"></div>
          <p className="ml-4 text-[#00333e] text-lg">Loading dashboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg text-center flex-1 flex items-center justify-center">
          {error}
        </div>
      )}

      {/* Main Content */}
      {!isLoading && !error && (
        <div className="flex-1 flex flex-col space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardData.stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
              >
                <div className={`p-5 bg-gradient-to-r ${stat.gradient} flex items-center`}>
                  <stat.icon className="w-8 h-8 text-white" />
                  <div className="ml-4">
                    <p className="text-sm text-white/80 leading-tight">
                      {stat.titleLine1}<br />{stat.titleLine2}
                    </p>
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Message Volume Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex-1"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#00333e] flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-[#fddf0d]" />
                Message Volume
              </h2>
              <div className="text-sm text-[#00333e]">
                Last {dashboardData.data.length} days
              </div>
            </div>
            <div className="flex-1 min-h-[400px]">
              {dashboardData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dashboardData.data}
                    margin={{ top: 10, right: 30, left: 0, bottom: 50 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#fddf0d" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#fddf0d" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: '#00333e' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={70}
                      tickFormatter={(value) => value}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#00333e' }}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        color: '#00333e',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#fddf0d"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      activeDot={{ r: 6, fill: '#fddf0d', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#00333e]">
                  <MessageSquare className="w-8 h-8 mr-2 text-[#fddf0d]" />
                  No message volume data available.
                </div>
              )}
            </div>
          </motion.div>

          {/* Recent Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
          >
            <h2 className="text-xl font-semibold text-[#00333e] mb-4">Recent Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-sm text-[#00333e] border-b border-gray-200">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.campaigns.length > 0 ? (
                    dashboardData.campaigns.slice(0, 5).map((campaign) => (
                      <tr key={campaign.campaign_id} className="border-b last:border-b-0 hover:bg-gray-50">
                        <td className="py-3 text-[#00333e]">{campaign.name}</td>
                        <td className="py-3 text-[#00333e]">
                          {new Date(campaign.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-3">
                          <span className="text-[#fddf0d] font-medium">{campaign.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="py-3 text-center text-[#00333e]">
                        No recent campaigns available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;