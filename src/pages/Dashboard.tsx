import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Chart } from 'chart.js/auto';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  XCircle,
  Megaphone,
  Folder,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Plus,
  Wallet,
  PlusCircle,
} from 'lucide-react';
import { useWorkspace } from './WorkspaceContext';
import {
  getMetricsV1,
  getAccountBalance
} from '../services/api';
import { SmsStatus, DailyCount } from '../services/metricsInterfaces';

interface Stat {
  title: string;
  value: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

interface DataPoint {
  name: string;
  value: number;
  instanceDates: string[];
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

interface Plan {
  plan_id: string;
  name: string;
  sms_unit_price: string;
  description: string;
  minimum_sms_purchase: number;
}

interface SubscriptionUsage {
  sms_credits: number;
}

const initialDashboardData: DashboardData = {
  stats: [
    { title: 'Messages Sent', value: '0', icon: MessageSquare, color: 'text-blue-600' },
    { title: 'Campaigns', value: '0', icon: Megaphone, color: 'text-green-600' },
    { title: 'Total Fails', value: '0', icon: XCircle, color: 'text-red-600' },
    { title: 'Total Contacts', value: '0', icon: Users, color: 'text-purple-600' },
    { title: 'Contact Groups', value: '0', icon: Folder, color: 'text-yellow-600' },
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

const GREETING_MESSAGES = [
  "December hustle hits different.",
  "Still grinding? Santa would.",
  "Holiday mode? Not yet.",
  "Finish > start.",
  "Pressure makes classics.",
  "Lazy ain’t festive.",
  "Next year starts now.",
  "Move like it’s closing day.",
  "Last push, loud results.",
  "Bills don’t take holidays.",
];

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentWorkspace, updateWorkspace, currentWorkspaceId } = useWorkspace();
  const workspace = getCurrentWorkspace();
  const { user, token } = useSelector((state: any) => state.auth);
  const [dashboardData, setDashboardData] = useState<DashboardData>(initialDashboardData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chartRefLine = useRef<HTMLCanvasElement>(null);
  const [chartInstanceLine, setChartInstanceLine] = useState<Chart | null>(null);
  const [dateRange, setDateRange] = useState<'today' | 'this_week' | 'this_month' | 'past_3_months' | 'past_6_months' | 'past_9_months' | 'last_year' | 'all_time'>('all_time');

  // Wallet State
  const [wallet, setWallet] = useState<{ units: number } | null>(null);

  // Greeting State
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);

  // Rotate Greetings
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prevIndex) => (prevIndex + 1) % GREETING_MESSAGES.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, []);


  const fetchMetricsData = useCallback(async () => {
    try {
      const response = await getMetricsV1(dateRange as any);
      return response;
    } catch (error: any) {
      console.error('Error fetching metrics:', error.message);
      throw new Error(error.message || 'Failed to fetch metrics data');
    }
  }, [dateRange]);

  const aggregateDataPoints = (dailyCounts: Record<string, DailyCount>, range: typeof dateRange): DataPoint[] => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const dataPoints: DataPoint[] = [];
    const countsByRange: Record<string, { value: number; instanceDates: string[] }> = {};

    let startDate: Date | null = null;
    let endDate = new Date(now);

    if (range === 'today') startDate = new Date(now);
    else if (range === 'this_week') { startDate = new Date(now); startDate.setDate(now.getDate() - now.getDay()); }
    else if (range === 'this_month') startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else if (range === 'past_3_months') { startDate = new Date(now); startDate.setMonth(now.getMonth() - 3); startDate.setDate(1); }
    else if (range === 'past_6_months') { startDate = new Date(now); startDate.setMonth(now.getMonth() - 6); startDate.setDate(1); }
    else if (range === 'past_9_months') { startDate = new Date(now); startDate.setMonth(now.getMonth() - 9); startDate.setDate(1); }
    else if (range === 'last_year') startDate = new Date(now.getFullYear() - 1, 0, 1);

    Object.entries(dailyCounts).forEach(([date, counts]: [string, DailyCount]) => {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return;

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

    Object.entries(countsByRange).forEach(([key, data]) => {
      let displayName = key;
      if (range === 'this_month' || range === 'past_3_months' || range === 'past_6_months' || range === 'past_9_months') {
        const [, , week] = key.split('-');
        displayName = `Week ${week.slice(1)}`;
      }
      dataPoints.push({ name: displayName, value: data.value, instanceDates: data.instanceDates });
    });

    return dataPoints.sort((a, b) => {
      if (range === 'this_month' || range === 'past_3_months' || range === 'past_6_months' || range === 'past_9_months') {
        return parseInt(a.name.replace('Week ', '')) - parseInt(b.name.replace('Week ', ''));
      }
      return new Date(a.instanceDates[0]).getTime() - new Date(b.instanceDates[0]).getTime();
    });
  };

  useEffect(() => {
    const storedDashboardData = (workspace as any)?.dashboardData;
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
    if (hasValidData && workspace?.dashboardData?.dateRange === dateRange) {
      if (!token) return;
      getAccountBalance().then((b) => setWallet({ units: b.balance })).catch((err) => console.error('Error fetching wallet balance:', err));
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const walletPromise = token ? getAccountBalance() : Promise.resolve(null);
      const [metrics, balanceResult] = await Promise.all([fetchMetricsData(), walletPromise]);
      if (balanceResult) setWallet({ units: balanceResult.balance });

      const messagesSent = metrics.sms_status.find((s: SmsStatus) => s.status.toLowerCase() === 'sent')?.count || 0;
      const totalFails = metrics.sms_status.find((s: SmsStatus) => s.status.toLowerCase() === 'failed')?.count || 0;
      const totalContacts = metrics.contacts_count.total_contacts || 0;
      const totalContactGroups = metrics.contacts_count.total_groups || 0;
      const numberOfCampaigns = 0;

      const dataPoints = aggregateDataPoints(metrics.logs_count.daily_counts, dateRange);

      const newDashboardData: DashboardData = {
        stats: [
          { title: 'Messages Sent', value: messagesSent.toString(), icon: MessageSquare, color: 'text-blue-600' },
          { title: 'Campaigns', value: numberOfCampaigns.toString(), icon: Megaphone, color: 'text-green-600' },
          { title: 'Total Fails', value: totalFails.toString(), icon: XCircle, color: 'text-red-600' },
          { title: 'Total Contacts', value: totalContacts.toString(), icon: Users, color: 'text-purple-600' },
          { title: 'Contact Groups', value: totalContactGroups.toString(), icon: Folder, color: 'text-yellow-600' },
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
  }, [currentWorkspaceId, updateWorkspace, workspace?.dashboardData, fetchMetricsData, dateRange, token]);

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
          type: 'bar',
          data: {
            labels: dashboardData.data.map((point) => point.name),
            datasets: [{
              label: 'Message Volume',
              data: dashboardData.data.map((point) => point.value),
              backgroundColor: '#00333e',
              borderRadius: 4,
              barThickness: 20,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#00333e',
                titleColor: '#fff',
                bodyColor: '#fff',
                padding: 10,
                cornerRadius: 8,
                displayColors: false,
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: '#f3f4f6',
                },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
              },
              x: {
                grid: { display: false },
                ticks: { color: '#6b7280', font: { size: 11 } },
                border: { display: false }
              },
            },
          },
        });
        setChartInstanceLine(newChartInstanceLine);
      } catch (error) {
        console.error('Error creating chart:', error);
      }
    }

    return () => {
      if (chartInstanceLine) {
        chartInstanceLine.destroy();
      }
    };
  }, [dashboardData.data, dateRange]);

  const getStatValue = (title: string) => {
    return dashboardData.stats.find(s => s.title === title)?.value || '0';
  };

  return (
    <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8  min-h-screen font-inter">
      {/* Header with Greetings and Balance */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div className="w-full lg:w-auto">
          <h1 className="text-2xl font-bold text-[#00333e]">
            Hello, {user?.username || 'User'}! 👋
          </h1>
          <div className="h-10 overflow-hidden relative max-w-lg mt-1">
            <AnimatePresence mode="wait">
              <motion.p
                key={currentGreetingIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-gray-500 text-sm absolute w-full leading-tight"
              >
                {GREETING_MESSAGES[currentGreetingIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full lg:w-auto">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 flex-grow sm:flex-grow-0">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Wallet className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Wallet Balance</p>
              <p className="text-sm font-bold text-[#00333e]">
                {wallet ? wallet.units.toLocaleString() : '---'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/subscription')}
            className="flex items-center gap-3 bg-[#00333e] text-white px-4 py-2 rounded-xl border border-[#00333e] shadow-sm flex-grow sm:flex-grow-0 hover:bg-[#004d5e] transition-colors text-left"
          >

            <PlusCircle className="w-7 h-7 text-[#fddf0d]" />

            <div>
              <p className="text-xs text-gray-300 font-medium">Purchase</p>
              <p className="text-sm font-bold text-white">Credits</p>
            </div>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e]"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Section - Total Messages (Compact) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#00333e] rounded-2xl p-8 text-white relative overflow-hidden shadow-2xl shadow-[#00333e]/20 border border-white/5"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#fddf0d] opacity-5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Total Messages Sent</h2>
                <div className="flex items-baseline gap-4">
                  <span className="text-4xl font-bold tracking-tight">{getStatValue('Messages Sent')}</span>
                  <span className="flex items-center text-[#fddf0d] text-xs font-bold bg-[#fddf0d]/10 px-3 py-1 rounded-full">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-1" />
                    15.8%
                  </span>
                </div>
              </div>

              <div className="relative group">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className="appearance-none bg-white/5 border border-white/10 text-white text-xs font-bold rounded-xl px-5 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#fddf0d]/50 hover:bg-white/10 transition-all cursor-pointer backdrop-blur-md"
                >
                  {timeRangeOptions.map((option) => (
                    <option key={option.value} value={option.value} className="text-[#00333e]">{option.label}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40 group-hover:text-white transition-colors">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Legacy Style Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Successful', value: getStatValue('Messages Sent'), icon: ArrowDownRight, color: 'text-[#00333e]' },
              { title: 'Failed', value: getStatValue('Total Fails'), icon: XCircle, color: 'text-red-500' },
              { title: 'Contacts', value: getStatValue('Total Contacts'), icon: Users, color: 'text-[#00333e]' },
              { title: 'Campaigns', value: getStatValue('Campaigns'), icon: Megaphone, color: 'text-[#00333e]' }
            ].map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="card flex items-center gap-5 group"
              >
                <div className={`p-3 rounded-xl bg-gray-50 ${stat.color} group-hover:bg-white transition-colors duration-300 shadow-sm border border-transparent group-hover:border-gray-100`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#00333e] tracking-tight">{stat.value}</h3>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{stat.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Grid: Chart & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 card p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-green-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-[#00333e]">Message Volume</h3>
                </div>

              </div>
              <div className="h-[250px] w-full">
                {dashboardData.data.length > 0 ? (
                  <canvas ref={chartRefLine} />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                    <p>No data available for this period</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Quick Actions (Redesigned) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-8 flex flex-col"
            >
              <h3 className="text-lg font-bold text-[#00333e] mb-4">Quick Actions</h3>

              <div className="flex-1 flex flex-col gap-3">
                <button
                  onClick={() => navigate('/send-sms')}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="p-3 bg-gray-50  rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#00333e]">Send SMS</span>
                    <span className="text-xs text-gray-500">Start a new message</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>

                <button
                  onClick={() => navigate('/send-sms')}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="p-3 bg-gray-50  rounded-xl group-hover:bg-purple-100 transition-colors">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#00333e]">New Campaign</span>
                    <span className="text-xs text-gray-500">Reach more customers</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>

                <button
                  onClick={() => navigate('/contacts')}
                  className="w-full flex items-center gap-4 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors group text-left"
                >
                  <div className="p-3 bg-gray-50 text-[#00333e] rounded-xl group-hover:bg-yellow-100 transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#00333e]">Add Contacts</span>
                    <span className="text-xs text-gray-500">Grow your audience</span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="card p-8"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00333e]" />
                <h3 className="text-lg font-bold text-[#00333e]">Recent Activity</h3>
              </div>
              <button
                onClick={() => navigate('/logs')}
                className="text-xs font-medium text-[#00333e] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-400 border-b border-gray-100">
                    <th className="pb-3 pl-2">CAMPAIGN</th>
                    <th className="pb-3">DATE</th>
                    <th className="pb-3">STATUS</th>
                    <th className="pb-3 text-right pr-2">TYPE</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {dashboardData.campaigns && dashboardData.campaigns.length > 0 ? (
                    dashboardData.campaigns.slice(0, 5).map((campaign) => (
                      <tr key={campaign.campaign_id} className="group hover:bg-gray-50 transition-colors">
                        <td className="py-4 pl-2">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 text-green-600 rounded-full group-hover:bg-white transition-colors">
                              <Megaphone className="w-4 h-4" />
                            </div>
                            <span className="font-medium text-[#00333e]">{campaign.name}</span>
                          </div>
                        </td>
                        <td className="py-4 text-gray-500">
                          {new Date(campaign.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td className="py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${campaign.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'}`}>
                            {campaign.status}
                          </span>
                        </td>
                        <td className="py-4 text-right pr-2 text-gray-500">SMS Campaign</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400">
                        No recent activity found
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