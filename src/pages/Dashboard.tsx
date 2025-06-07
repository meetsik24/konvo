
import React, { useState, useEffect, useCallback } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, MessageSquare, XCircle, Megaphone, Folder, TrendingUp } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getCampaigns, fetchLogs, getContactMetrics } from '../services/api';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
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
    { title: 'Messages Sent', value: '0', icon: MessageSquare },
    { title: 'Campaigns', value: '0', icon: Megaphone },
    { title: 'Total Fails', value: '0', icon: XCircle },
    { title: 'Total Contacts', value: '0', icon: Users },
    { title: 'Contact Groups', value: '0', icon: Folder },
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

  const fetchAllMessageLogs = useCallback(async () => {
    try {
      const { logs = [] } = await fetchLogs();
      if (!Array.isArray(logs)) throw new Error('Invalid logs data');
      return logs;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch logs');
    }
  }, []);

  useEffect(() => {
    const storedData = workspace?.dashboardData;
    if (storedData?.stats?.length || storedData?.data?.length || storedData?.campaigns?.length) {
      setDashboardData({
        stats: storedData.stats || initialDashboardData.stats,
        data: storedData.data || initialDashboardData.data,
        campaigns: storedData.campaigns || initialDashboardData.campaigns,
      });
    } else {
      setDashboardData(initialDashboardData);
    }
  }, [currentWorkspaceId, workspace?.dashboardData]);

  const loadDashboardData = useCallback(async () => {
    if (!currentWorkspaceId) {
      setError('No workspace selected');
      return;
    }

    if (workspace?.dashboardData?.stats?.some((stat) => stat.value !== '0') ||
        workspace?.dashboardData?.data?.length ||
        workspace?.dashboardData?.campaigns?.length) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [campaigns, contactsMetrics, logs] = await Promise.all([
        getCampaigns().catch(() => []),
        getContactMetrics().catch(() => ({ total_contacts: 0, total_contact_groups: 0 })),
        fetchAllMessageLogs().catch(() => []),
      ]);

      const messagesSent = logs.filter((log) => log?.status === 'sent' && log?.response_group_name === 'PENDING').length;
      const totalFails = logs.filter((log) => log?.response_group_name === 'REJECTED').length;
      const messageVolume = logs.reduce((acc: { [key: string]: number }, log) => {
        const date = new Date(log?.timestamp);
        if (isNaN(date.getTime())) return acc;
        const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        acc[dateString] = (acc[dateString] || 0) + 1;
        return acc;
      }, {});

      const dataPoints = Object.entries(messageVolume)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Messages Sent', value: messagesSent.toString(), icon: MessageSquare },
          { title: 'Campaigns', value: campaigns.length.toString(), icon: Megaphone },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle },
          { title: 'Total Contacts', value: contactsMetrics.total_contacts.toString(), icon: Users },
          { title: 'Contact Groups', value: contactsMetrics.total_contact_groups.toString(), icon: Folder },
        ],
        data: dataPoints,
        campaigns,
      };

      setDashboardData(newDashboardData);
      updateWorkspace(currentWorkspaceId, { dashboardData: newDashboardData });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      setDashboardData(initialDashboardData);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, updateWorkspace, workspace?.dashboardData, fetchAllMessageLogs]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-4">
      {isLoading && (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#00333e]" />
          <p className="ml-2 text-[#00333e] text-sm">Loading...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="border border-gray-200 bg-white p-3 text-[#00333e] text-xs text-center">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {dashboardData.stats.map((stat) => (
              <div key={stat.title} className="bg-white border border-gray-200 p-3 flex items-center">
                <stat.icon className="w-4 h-4 text-[#00333e] mr-2" />
                <div>
                  <p className="text-xs text-[#00333e]">{stat.title}</p>
                  <p className="text-base font-semibold text-[#00333e]">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base text-[#00333e] flex items-center">
                <TrendingUp className="w-4 h-4 mr-1 text-[#00333e]" />
                Message Volume
              </h2>
              <span className="text-xs text-[#00333e]">{dashboardData.data.length} days</span>
            </div>
            <div className="h-64">
              {dashboardData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardData.data} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="2 2" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#00333e' }}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 10, fill: '#00333e' }} width={30} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        fontSize: '12px',
                        color: '#00333e',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#00333e"
                      strokeWidth={1}
                      fill="#fddf0d"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-[#00333e] text-xs">
                  <MessageSquare className="w-4 h-4 mr-1 text-[#00333e]" />
                  No data available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 p-4">
            <h2 className="text-base text-[#00333e] mb-2">Recent Campaigns</h2>
            <table className="w-full text-xs text-[#00333e]">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-1 text-left">Name</th>
                  <th className="pb-1 text-left">Date</th>
                  <th className="pb-1 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.campaigns.length > 0 ? (
                  dashboardData.campaigns.slice(0, 5).map((campaign) => (
                    <tr key={campaign.campaign_id} className="border-b border-gray-200 last:border-0">
                      <td className="py-1">{campaign.name}</td>
                      <td className="py-1">
                        {new Date(campaign.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-1 text-[#fddf0d]">{campaign.status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-1 text-center">
                      No campaigns
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;