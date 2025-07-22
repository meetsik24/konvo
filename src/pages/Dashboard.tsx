import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import { Users, MessageSquare, XCircle, Megaphone, Folder, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import { getMetricsV1 } from '../services/api';
import { MetricsResponse, SmsStatus, ContactsCount, LogsCount, DailyCount } from '../services/metricsInterfaces';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  gradient: string;
}

interface DataPoint {
  name: string;
  value: number;
  instanceDates: string[]; // Store all dates contributing to this data point
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
    { title: 'Campaigns', value: '0', icon: Megaphone, gradient: 'from-green-500 to-green-600' },
    { title: 'Total Fails', value: '0', icon: XCircle, gradient: 'from-red-500 to-red-600' },
    { title: 'Total Contacts', value: '0', icon: Users, gradient: 'from-purple-500 to-purple-600' },
    { title: 'Contact Groups', value: '0', icon: Folder, gradient: 'from-yellow-500 to-yellow-600' },
  ],
  data: [],
  campaigns: [],
};

const timeRangeOptions = [
  { value: 'today' as const, label: 'Today' },
  { value: 'this_week' as const, label: 'This Week' },
  { value: 'this_month' as const, label: 'This Month' },
  { value: 'past_3_months' as const, label: 'Past 3 Months' },
  { value: 'past_6_months' as const, label: 'Past 6 Months' },
  { value: 'past_9_months' as const, label: 'Past 9 Months' },
  { value: 'last_year' as const, label: 'Last Year' },
  { value: 'all_time' as const, label: 'All Time' },
];

const Dashboard: React.FC = () => {
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRefLine = useRef<HTMLCanvasElement>(null);
  const [chartInstanceLine, setChartInstanceLine] = useState<Chart | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'this_week' | 'this_month' | 'past_3_months' | 'past_6_months' | 'past_9_months' | 'last_year' | 'all_time'>('all_time');

  const fetchMetricsData = useCallback(async () => {
    try {
      const response = await getMetricsV1(dateRange);
      console.log('getMetricsV1 response:', response);
      return response;
    } catch (error: any) {
      console.error('Error fetching metrics:', error.message);
      throw new Error(error.message || 'Failed to fetch metrics data');
    }
  }, [dateRange]);

  const aggregateDataPoints = (dailyCounts: Record<string, DailyCount>, range: typeof dateRange): DataPoint[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    const dataPoints: DataPoint[] = [];
    const countsByRange: Record<string, { value: number; instanceDates: string[] }> = {};

    // Define date boundaries
    let startDate: Date | null = null;
    let endDate = new Date(now);
    if (range === 'today') {
      startDate = new Date(now);
    } else if (range === 'this_week') {
      startDate = new Date(now);
      startDate.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
    } else if (range === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'past_3_months') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 3);
      startDate.setDate(1);
    } else if (range === 'past_6_months') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 6);
      startDate.setDate(1);
    } else if (range === 'past_9_months') {
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 9);
      startDate.setDate(1);
    } else if (range === 'last_year') {
      startDate = new Date(now.getFullYear() - 1, 0, 1);
    } // No startDate for 'all_time'

    Object.entries(dailyCounts).forEach(([date, counts]: [string, DailyCount]) => {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date in daily_counts:', date);
        return;
      }

      // Filter by date range
      if (!startDate || (dateObj >= startDate && dateObj <= endDate)) {
        let key: string;
        if (range === 'today') {
          key = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } else if (range === 'this_week') {
          key = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
        } else if (range === 'this_month' || range === 'past_3_months' || range === 'past_6_months' || range === 'past_9_months') {
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth();
          const weekOfMonth = Math.floor((dateObj.getDate() - 1) / 7) + 1;
          key = `${year}-${month + 1}-W${weekOfMonth}`;
        } else {
          key = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        }

        if (!countsByRange[key]) {
          countsByRange[key] = { value: 0, instanceDates: [] };
        }
        countsByRange[key].value += counts.sent;
        countsByRange[key].instanceDates.push(date);
      }
    });

    // Format labels for display
    Object.entries(countsByRange).forEach(([key, data]) => {
      let displayName = key;
      if (range === 'this_month' || range === 'past_3_months' || range === 'past_6_months' || range === 'past_9_months') {
        const [, month, week] = key.split('-');
        displayName = `Week ${week.slice(1)}`;
      }
      dataPoints.push({ name: displayName, value: data.value, instanceDates: data.instanceDates });
    });

    // Sort data points chronologically
    return dataPoints.sort((a, b) => {
      if (range === 'this_month' || range === 'past_3_months' || range === 'past_6_months' || range === 'past_9_months') {
        return parseInt(a.name.replace('Week ', '')) - parseInt(b.name.replace('Week ', ''));
      } else if (range === 'last_year' || range === 'all_time') {
        return new Date(a.instanceDates[0]).getTime() - new Date(b.instanceDates[0]).getTime();
      }
      return new Date(a.instanceDates[0]).getTime() - new Date(b.instanceDates[0]).getTime();
    });
  };

  useEffect(() => {
    const storedDashboardData = workspace?.dashboardData;
    if (
      storedDashboardData?.stats?.length ||
      storedDashboardData?.data?.length ||
      storedDashboardData?.campaigns?.length
    ) {
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
    if (hasValidData && workspace?.dashboardData?.dateRange === dateRange) {
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const metrics = await fetchMetricsData();

      const messagesSent = metrics.sms_status.find((s: SmsStatus) => s.status.toLowerCase() === 'sent')?.count || 0;
      const totalFails = metrics.sms_status.find((s: SmsStatus) => s.status.toLowerCase() === 'failed')?.count || 0;
      const totalContacts = metrics.contacts_count.total_contacts || 0;
      const totalContactGroups = metrics.contacts_count.total_groups || 0;
      const numberOfCampaigns = 0; // No campaign data in /v1/metrics

      const dataPoints = aggregateDataPoints(metrics.logs_count.daily_counts, dateRange);

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Messages Sent', value: messagesSent.toString(), icon: MessageSquare, gradient: 'from-blue-500 to-blue-600' },
          { title: 'Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, gradient: 'from-green-500 to-green-600' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, gradient: 'from-red-500 to-red-600' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, gradient: 'from-purple-500 to-purple-600' },
          { title: 'Contact Groups', value: totalContactGroups.toString(), icon: Folder, gradient: 'from-yellow-500 to-yellow-600' },
        ],
        data: dataPoints,
        campaigns: [],
      };

      setDashboardData(newDashboardData);
      updateWorkspace(currentWorkspaceId, { dashboardData: { ...newDashboardData, dateRange } });
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unable to load dashboard data. Please try again.';
      console.error('Failed to fetch dashboard data:', err);
      setError(errorMessage);
      setDashboardData(initialDashboardData);
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspaceId, updateWorkspace, workspace?.dashboardData, fetchMetricsData, dateRange]);

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
        const newChartInstanceLine = new Chart(ctxLine!, {
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
              tooltip: {
                callbacks: {
                  title: (tooltipItems) => {
                    const dataPoint = dashboardData.data[tooltipItems[0].dataIndex];
                    const instanceDates = dataPoint.instanceDates;
                    if (instanceDates.length === 0) return dataPoint.name;

                    // Format all instance dates
                    const formattedDates = instanceDates
                      .map((date) =>
                        new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      )
                      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

                    if (dateRange === 'today' || dateRange === 'this_week') {
                      return formattedDates[0]; // Single date for non-aggregated ranges
                    } else if (dateRange === 'this_month' || dateRange === 'past_3_months' || dateRange === 'past_6_months' || dateRange === 'past_9_months') {
                      // Calculate week range from the first instance date
                      const firstDate = new Date(instanceDates[0]);
                      const [year, month, week] = dataPoint.name.includes('Week')
                        ? dataPoint.name.split('-').length === 3
                          ? dataPoint.name.split('-')
                          : ['', firstDate.getMonth() + 1, dataPoint.name.replace('Week ', '')]
                        : ['', firstDate.getMonth() + 1, '1'];
                      const weekNum = parseInt(week.slice(1) || '1');
                      const startDate = new Date(year || firstDate.getFullYear(), month - 1, (weekNum - 1) * 7 + 1);
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + 6);
                      const weekRange = `Week of ${startDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })} - ${endDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`;
                      return [weekRange, ...formattedDates].join('\n');
                    } else {
                      // For 'last_year' or 'all_time', show month and all instance dates
                      const monthYear = new Date(instanceDates[0]).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      });
                      return [monthYear, ...formattedDates].join('\n');
                    }
                  },
                  label: (tooltipItem) => `Messages Sent: ${tooltipItem.raw}`,
                },
              },
            },
            scales: {
              y: { 
                beginAtZero: true, 
                title: { display: true, text: 'Message Count', color: '#00333e' },
                ticks: { color: '#00333e' },
              },
              x: { 
                title: { 
                  display: true, 
                  text: timeRangeOptions.find((opt) => opt.value === dateRange)?.label || 'Time', 
                  color: '#00333e' 
                },
                ticks: { 
                  color: '#00333e',
                  maxRotation: 45,
                  minRotation: 45,
                  autoSkip: true,
                  maxTicksLimit: 10,
                },
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
  }, [dashboardData.data, dateRange]);

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
    <div className="max-w-7xl mx-auto p-4 sm:p-6 bg-[#f5f5f5] min-h-screen font-inter">
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
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-xl sm:text-2xl font-semibold text-[#00333e] mb-4">Dashboard</h1>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {dashboardData.stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="min-w-[150px] max-w-[200px] w-full bg-white rounded-md p-3 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-md bg-gradient-to-r ${stat.gradient}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-2">
                    <p className="text-xs font-medium text-gray-600">{stat.title}</p>
                    <p className="text-base font-semibold text-[#00333e]">{stat.value}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-md p-4 sm:p-6 border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-[#00333e] flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-[#fddf0d]" />
                Message Volume
              </h2>
              <div>
                <label htmlFor="dateRange" className="sr-only">Filter by:</label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="p-2 border border-gray-300 rounded-md text-sm text-[#00333e] focus:outline-none focus:ring-2 focus:ring-[#fddf0d]"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative h-[300px] sm:h-[350px]">
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
            className="bg-white rounded-md p-4 sm:p-6 border border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-medium text-[#00333e] mb-4">Recent Campaigns</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dashboardData.campaigns && dashboardData.campaigns.length > 0 ? (
                    dashboardData.campaigns.slice(0, 5).map((campaign) => (
                      <tr key={campaign.campaign_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#00333e]">{campaign.name}</td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#00333e]">
                          {new Date(campaign.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">{getStatusIcon(campaign.status)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-[#00333e] text-center">
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