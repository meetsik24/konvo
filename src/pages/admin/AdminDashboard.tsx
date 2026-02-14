import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    IdCard,
    Building,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    ShieldCheck,
    ArrowUpRight
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendType?: 'up' | 'down';
    color: string;
    delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendType, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + delay * 0.1 }}
        className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-all"
    >
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#00333e]">{value}</h3>
                <p className="text-gray-500 text-xs font-medium">{title}</p>
            </div>
            {trend && (
                <span className={`text-xs font-medium flex items-center gap-1 px-2 py-1 rounded-full ${trendType === 'up'
                        ? 'bg-green-50 text-green-600'
                        : trendType === 'down'
                            ? 'bg-red-50 text-red-500'
                            : 'bg-yellow-50 text-yellow-600'
                    }`}>
                    {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> :
                        trendType === 'down' ? <TrendingDown className="w-3 h-3" /> : null}
                    {trend}
                </span>
            )}
        </div>
    </motion.div>
);

const AdminDashboard: React.FC = () => {
    const [financials, setFinancials] = useState<any>(null);
    const [senderIds, setSenderIds] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<any>(null);
    const [otps, setOtps] = useState<any>(null);
    const [totalUsers, setTotalUsers] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);

                // Fetch all available stats including user count
                const [senderResult, workspaceResult, usersResult] = await Promise.allSettled([
                    AdminApi.getSenderIdMetrics(),
                    AdminApi.getWorkspaceMetrics(),
                    AdminApi.getUsers({ skip: 0, limit: 1 }) // Just to get count
                ]);

                // Extract successful results or null for failures
                setSenderIds(senderResult.status === 'fulfilled' ? senderResult.value : null);
                setWorkspaces(workspaceResult.status === 'fulfilled' ? workspaceResult.value : null);

                // For user count, we'll fetch all users once to get total
                if (usersResult.status === 'fulfilled') {
                    // Fetch all users to count (TODO: backend should provide this)
                    const allUsers = await AdminApi.getUsers({ skip: 0, limit: 1000 });
                    setTotalUsers(allUsers.length);
                }

                // These endpoints don't exist on the backend yet - use placeholder data
                setOtps({
                    total_otps_generated: 0,
                    total_otps_used: 0,
                    total_otps_expired: 0,
                    usage_rate_percent: 0,
                    otps_last_24_hours: 0,
                    otps_last_7_days: 0,
                    daily_usage: []
                });
                setFinancials({
                    total_revenue: 0,
                    total_units_sold: 0,
                    avg_transaction_value: 0,
                    top_users: []
                });

                // Check if any critical data failed
                if (senderResult.status === 'rejected' && workspaceResult.status === 'rejected') {
                    setError('Some dashboard data could not be loaded. Displaying available information.');
                }
            } catch (err: any) {
                console.error('Failed to fetch admin dashboard data:', err);
                setError('Failed to load dashboard statistics. Some data might be missing.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00333e]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Admin Dashboard</h1>
                <p className="text-gray-500 text-sm">Overview of the BriqPilot platform statistics and performance.</p>
            </div>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-700 text-sm">
                    {error}
                </div>
            )}

            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#00333e] rounded-xl p-6 text-white relative overflow-hidden border"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#fddf0d] opacity-5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-gray-300 text-xs font-medium mb-1 uppercase tracking-wider">Platform Overview</h2>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold tracking-tight">{totalUsers} Users</span>
                            <span className="flex items-center text-[#fddf0d] text-xs font-medium bg-[#fddf0d]/10 px-2 py-0.5 rounded-full">
                                <ArrowUpRight className="w-3 h-3 mr-1" />
                                Active
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-gray-400 text-xs">Total Workspaces</p>
                        <p className="text-xl font-bold">{workspaces?.total_workspaces || 0}</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Users"
                    value={totalUsers}
                    icon={Users}
                    trend="+12%"
                    trendType="up"
                    color="bg-blue-50 text-blue-600"
                    delay={0}
                />
                <StatsCard
                    title="Active Workspaces"
                    value={workspaces?.total_workspaces || '0'}
                    icon={Building}
                    trend="+5.2%"
                    trendType="up"
                    color="bg-green-50 text-green-600"
                    delay={1}
                />
                <StatsCard
                    title="Pending Sender IDs"
                    value={senderIds?.pending_requests || '0'}
                    icon={IdCard}
                    trend="Pending"
                    color="bg-yellow-50 text-yellow-600"
                    delay={2}
                />
                <StatsCard
                    title="OTP Success Rate"
                    value={`${otps?.usage_rate_percent?.toFixed(1) || '0'}%`}
                    icon={ShieldCheck}
                    trend="N/A"
                    color="bg-purple-50 text-purple-600"
                    delay={3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Platform Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                >
                    <h2 className="text-lg font-bold text-[#00333e] mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-[#00333e]" />
                        Platform Activity
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm py-3 border-b border-gray-100">
                            <span className="text-gray-500">OTPs Generated (24h)</span>
                            <span className="text-[#00333e] font-semibold">{otps?.otps_last_24_hours || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-3 border-b border-gray-100">
                            <span className="text-gray-500">New Workspaces (7d)</span>
                            <span className="text-[#00333e] font-semibold">{workspaces?.new_workspaces_last_7_days || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-3 border-b border-gray-100">
                            <span className="text-gray-500">Universal Units Sold</span>
                            <span className="text-[#00333e] font-semibold">{financials?.total_units_sold || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-3">
                            <span className="text-gray-500">Total Users</span>
                            <span className="text-[#00333e] font-semibold">{totalUsers}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Top Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                >
                    <h2 className="text-lg font-bold text-[#00333e] mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Top Performance
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500 mb-4">Top workspace by contacts:</p>
                        {workspaces?.top_workspace_by_contacts ? (
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="w-10 h-10 bg-[#00333e]/10 rounded-lg flex items-center justify-center text-[#00333e]">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[#00333e] font-medium">{workspaces.top_workspace_by_contacts.name}</h4>
                                    <p className="text-xs text-gray-500">{workspaces.top_workspace_by_contacts.total_contacts} contacts</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No data available</p>
                        )}

                        <p className="text-sm text-gray-500 mt-6 mb-4">Top User by spend:</p>
                        {financials?.top_users?.[0] ? (
                            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-[#00333e] font-medium">{financials.top_users[0].username}</h4>
                                    <p className="text-xs text-gray-500">TShs {financials.top_users[0].total_spent.toLocaleString()} total spent</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No data available</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
