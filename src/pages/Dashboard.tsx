import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import { Users, MessageSquare, XCircle, Megaphone, Folder, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getCampaigns, fetchLogs, getContactMetrics } from '../services/api';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  gradient: string;
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
    { title: 'Messages Sent', value: '0', icon: MessageSquare, gradient: 'from-blue-500 to-blue-600' },
    { title: 'Number of Campaigns', value: '0', icon: Megaphone, gradient: 'from-green-500 to-green-600' },
    { title: 'Total Fails', value: '0', icon: XCircle, gradient: 'from-red-500 to-red-600' },
    { title: 'Total Contacts', value: '0', icon: Users, gradient: 'from-purple-500 to-purple-600' },
    { title: 'Total Contact Groups', value: '0', icon: Folder, gradient: 'from-yellow-500 to-yellow-600' },
  ],
  data: [],
  campaigns: [],
};

const Dashboard: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRefLine = useRef<HTMLCanvasElement>(null);
  const [chartInstanceLine, setChartInstanceLine] = useState<Chart | null>(null);

  const fetchAllMessageLogs = useCallback(async () => {
    try {
      const response = await fetchLogs();
      const logs = response?.logs || [];
      console.log('fetchLogs response:', response);
      console.log(`Total message logs: ${logs.length}`);
      if (!Array.isArray(logs)) {
        console.error('Logs is not an array:', logs);
        throw new Error('Invalid logs data: expected an array');
      }
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
  }, [currentWorkspaceId, workspace?.dashboardData]);

  const loadDashboardData = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected.');
      return;
    }

    const hasValidData =
      workspace?.dashboardData?.stats?.some((stat) => stat.value !== '0') ||
      workspace?.dashboardData?.data?.length > 0 ||
      workspace?.dashboardData?.campaigns?.length > 0;
    if (hasValidData) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      let campaigns = [], contactsMetrics = { total_contacts: 0, total_contact_groups: 0 }, logs = [];
      
      try {
        campaigns = await getCampaigns() || [];
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        campaigns = [];
      }
      
      try {
        contactsMetrics = await getContactMetrics() || { total_contacts: 0, total_contact_groups: 0 };
      } catch (err) {
        console.error('Error fetching contact metrics:', err);
        contactsMetrics = { total_contacts: 0, total_contact_groups: 0 };
      }
      
      try {
        logs = await fetchAllMessageLogs() || [];
      } catch (err) {
        console.error('Error fetching logs:', err);
        logs = [];
      }

      const messagesSent = logs.filter(
        (log: any) => log?.status === 'sent' && log?.response_group_name === 'PENDING'
      ).length;
      const numberOfCampaigns = Array.isArray(campaigns) ? campaigns.length : 0;
      const totalFails = logs.filter(
        (log: any) => log?.response_group_name === 'REJECTED'
      ).length;
      const totalContacts = contactsMetrics?.total_contacts || 0;
      const totalContactGroups = contactsMetrics?.total_contact_groups || 0;

      const messageVolume = logs.reduce((acc: { [key: string]: number }, log: any) => {
        const timestamp = log?.timestamp;
        if (!timestamp) {
          console.warn('Missing timestamp in log:', log);
          return acc;
        }
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          console.warn('Invalid timestamp in log:', log);
          return acc;
        }
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[dateString] = (acc[dateString] || 0) + 1;
        return acc;
      }, {});

      const dataPoints = Object.entries(messageVolume)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

      console.log('Processed data points for chart:', dataPoints);

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'SMS Sent', value: messagesSent.toString(), icon: MessageSquare, gradient: 'from-blue-500 to-blue-600' },
          { title: 'Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, gradient: 'from-green-500 to-green-600' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, gradient: 'from-red-500 to-red-600' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, gradient: 'from-purple-500 to-purple-600' },
          { title: 'Total Groups', value: totalContactGroups.toString(), icon: Folder, gradient: 'from-yellow-500 to-yellow-600' },
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

  useEffect(() => {
    if (chartRefLine.current && dashboardData.data.length > 0) {
      const ctxLine = chartRefLine.current.getContext('2d');
      if (chartInstanceLine) {
        chartInstanceLine.destroy();
      }
      try {
        const newChartInstanceLine = new Chart(ctxLine, {
          type: 'line',
          data: {
            labels: dashboardData.data.map((point) => point.name),
            datasets: [{
              label: 'Message Volume',
              data: dashboardData.data.map((point) => point.value),
              borderColor: '#fddf0d',
              backgroundColor: 'rgba(253, 223, 13, 0.2)',
              fill: true,
              tension: 0.4,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom', labels: { color: '#00333e' } },
            },
            scales: {
              y: { 
                beginAtZero: true, 
                title: { display: true, text: 'Count', color: '#00333e' },
                ticks: { color: '#00333e' }
              },
              x: { 
                title: { display: true, text: 'Date', color: '#00333e' },
                ticks: { color: '#00333e' }
              },
            },
          },
        });
        setChartInstanceLine(newChartInstanceLine);
      } catch (error) {
        console.error('Error creating line chart:', error);
      }
    }

    return () => {
      if (chartInstanceLine) {
        chartInstanceLine.destroy();
      }
    };
  }, [dashboardData.data]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="w-5 h-5 text-[#00333e]" />;
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-[#00333e]" />;
      case 'Pending':
        return <Clock className="w-5 h-5 text-[#fddf0d]" />;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-[#f5f5f5] min-h-screen font-inter">
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <svg className="animate-spin h-6 w-6 text-[#00333e]" viewBox="0 0 24 24" aria-label="Loading">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <p className="ml-3 text-[#00333e] text-sm">Loading Dashboard Data</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-md text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-2xl font-semibold text-[#00333e] mb-8">Dashboard</h1>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {dashboardData.stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white rounded-md p-4 border border-gray-200"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-md bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-lg font-medium text-[#00333e]">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#00333e] mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-[#fddf0d]" />
              Message Volume
            </h2>
            <div className="h-64">
              {dashboardData.data.length > 0 ? (
                <canvas ref={chartRefLine} />
              ) : (
                <div className="flex items-center justify-center h-full text-[#00333e]">
                  <MessageSquare className="w-8 h-8 mr-2 text-[#fddf0d]" />
                  No message volume data available.
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-md p-6 border border-gray-200"
          >
            <h2 className="text-lg font-medium text-[#00333e] mb-4">Recent Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.campaigns && dashboardData.campaigns.length > 0 ? (
                    dashboardData.campaigns.slice(0, 5).map((campaign) => (
                      <tr key={campaign.campaign_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00333e]">{campaign.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00333e]">
                          {new Date(campaign.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusIcon(campaign.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-[#00333e] text-center">
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