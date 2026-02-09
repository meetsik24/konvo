import React, { useEffect, useState } from 'react';
import {
    Users,
    IdCard,
    Building,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { AdminApi } from '../../services/api';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    trend?: string;
    trendType?: 'up' | 'down';
    color: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, trendType, color }) => (
    <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            {trend && (
                <span className={`text-xs font-medium flex items-center gap-1 ${trendType === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    {trendType === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </span>
            )}
        </div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
    </div>
);

const AdminDashboard: React.FC = () => {
    const [financials, setFinancials] = useState<any>(null);
    const [senderIds, setSenderIds] = useState<any>(null);
    const [workspaces, setWorkspaces] = useState<any>(null);
    const [otps, setOtps] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const [finData, senderData, workspaceData, otpData] = await Promise.all([
                    AdminApi.getFinancialMetrics(),
                    AdminApi.getSenderIdMetrics(),
                    AdminApi.getWorkspaceMetrics(),
                    AdminApi.getOTPCodesMetrics()
                ]);
                setFinancials(finData);
                setSenderIds(senderData);
                setWorkspaces(workspaceData);
                setOtps(otpData);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Admin Dashboard</h1>
                <p className="text-gray-400">Overview of the BriqPilot platform statistics and performance.</p>
            </div>

            {error && (
                <div className="bg-red-900/20 border border-red-900/50 p-4 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Revenue"
                    value={`$${financials?.total_revenue?.toLocaleString() || '0'}`}
                    icon={DollarSign}
                    trend="+12.5%"
                    trendType="up"
                    color="bg-green-500"
                />
                <StatsCard
                    title="Active Workspaces"
                    value={workspaces?.total_workspaces || '0'}
                    icon={Building}
                    trend="+5.2%"
                    trendType="up"
                    color="bg-blue-500"
                />
                <StatsCard
                    title="Sender ID Requests"
                    value={senderIds?.pending_requests || '0'}
                    icon={IdCard}
                    trend="Pending"
                    color="bg-yellow-500"
                />
                <StatsCard
                    title="OTP Success Rate"
                    value={`${otps?.usage_rate_percent?.toFixed(1) || '0'}%`}
                    icon={ShieldCheck}
                    trend="-2.1%"
                    trendType="down"
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity or detailed stats could go here */}
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-500" />
                        Platform Activity
                    </h2>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">OTPs Generated (24h)</span>
                            <span className="text-white font-medium">{otps?.otps_last_24_hours || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">New Workspaces (7d)</span>
                            <span className="text-white font-medium">{workspaces?.new_workspaces_last_7_days || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">SMS Credits Sold</span>
                            <span className="text-white font-medium">{financials?.sms_credits_sold || 0}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Avg. Transaction Value</span>
                            <span className="text-white font-medium">${financials?.avg_transaction_value?.toFixed(2) || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Top Performance
                    </h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-400 mb-4">Top workspace by contacts:</p>
                        {workspaces?.top_workspace_by_contacts ? (
                            <div className="flex items-center gap-4 bg-[#2a2a2a] p-4 rounded-xl">
                                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center text-red-500">
                                    <Building className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{workspaces.top_workspace_by_contacts.name}</h4>
                                    <p className="text-xs text-gray-400">{workspaces.top_workspace_by_contacts.total_contacts} contacts</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No data available</p>
                        )}

                        <p className="text-sm text-gray-400 mt-6 mb-4">Top User by spend:</p>
                        {financials?.top_users?.[0] ? (
                            <div className="flex items-center gap-4 bg-[#2a2a2a] p-4 rounded-xl">
                                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center text-green-500">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{financials.top_users[0].username}</h4>
                                    <p className="text-xs text-gray-400">${financials.top_users[0].total_spent.toLocaleString()} total spent</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 italic">No data available</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
