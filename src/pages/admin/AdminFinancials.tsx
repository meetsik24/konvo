import React, { useEffect, useState, useCallback } from 'react';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    AlertCircle,
    Calendar,
    BarChart3,
    ExternalLink
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminFinancials: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [trends, setTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinancials = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const [metricsData, trendsData] = await Promise.all([
                AdminApi.getFinancialMetrics(),
                AdminApi.getRevenueTrends()
            ]);
            console.log('Financials Overview Data:', { metricsData, trendsData });
            setMetrics(metricsData);
            setTrends(trendsData.data || []);
        } catch (err: any) {
            console.error('Failed to fetch financial data:', err);
            setError('Failed to load financial statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFinancials();
    }, [fetchFinancials]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-red-600">{error}</p>
                        <button 
                            onClick={fetchFinancials}
                            className="text-xs text-red-600 hover:text-red-700 underline mt-1"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {loading && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-600">Loading financial dashboard...</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Financial Overview</h1>
                    <p className="text-gray-500 text-sm">Total revenue, metrics, and trends across the platform.</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Revenue</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">TShs {metrics?.total_revenue?.toLocaleString() || 0}</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        All-time earnings
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">TShs {metrics?.monthly_revenue?.toLocaleString() || 0}</p>
                    <div className="text-[10px] text-gray-500">Current calendar month</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Avg Transaction</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">TShs {metrics?.avg_transaction_value?.toFixed(2) || 0}</p>
                    <div className="text-[10px] text-gray-500">Average order value</div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Transactions</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">{metrics?.total_transactions || 0}</p>
                    <div className="text-[10px] text-gray-500">{metrics?.completed_transactions || 0} completed</div>
                </div>
            </div>

            {/* Credits Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">SMS Credits</h3>
                    <p className="text-2xl font-bold text-[#00333e] mb-4">
                        <span className="text-green-600">{metrics?.sms_credits_sold?.toLocaleString() || 0}</span>
                        <span className="text-gray-400 text-sm ml-2">Sold</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{metrics?.sms_credits_used?.toLocaleString() || 0} used by users</span>
                        <span className="text-[#00333e] font-semibold">
                            {metrics?.sms_credits_sold > 0 
                                ? ((metrics?.sms_credits_used / metrics?.sms_credits_sold) * 100).toFixed(0) 
                                : 0}% utilization
                        </span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Call Minutes</h3>
                    <p className="text-2xl font-bold text-[#00333e] mb-4">
                        <span className="text-purple-600">{metrics?.call_minutes_sold?.toLocaleString() || 0}</span>
                        <span className="text-gray-400 text-sm ml-2">Sold</span>
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{metrics?.call_minutes_used?.toLocaleString() || 0} used by users</span>
                        <span className="text-[#00333e] font-semibold">
                            {metrics?.call_minutes_sold > 0 
                                ? ((metrics?.call_minutes_used / metrics?.call_minutes_sold) * 100).toFixed(0) 
                                : 0}% utilization
                        </span>
                    </div>
                </div>
            </div>

            {/* Top Spending Users */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h2 className="text-sm font-bold text-[#00333e] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Top 5 Spending Users
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {metrics?.top_users?.length === 0 ? (
                                <tr><td colSpan={2} className="px-6 py-8 text-center text-gray-500 text-sm">No data available</td></tr>
                            ) : (
                                metrics?.top_users?.slice(0, 5).map((user: any) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-[#00333e]/10 flex items-center justify-center text-xs font-bold text-[#00333e]">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[#00333e] text-sm font-medium">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-[#00333e] font-bold">TShs {user.total_spent?.toLocaleString() || 0}</span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Links to Related Pages */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a href="/orange/transactions" className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#00333e]/30 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-[#00333e] font-bold text-sm mb-1 group-hover:text-[#00333e]/80">Transactions</h3>
                            <p className="text-xs text-gray-500">View detailed transaction history and manage approvals</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[#00333e] transition-colors" />
                    </div>
                </a>

                <a href="/orange/credits-usage" className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:border-[#00333e]/30 hover:shadow-md transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-[#00333e] font-bold text-sm mb-1 group-hover:text-[#00333e]/80">Credits Usage</h3>
                            <p className="text-xs text-gray-500">Monitor credit allocation and consumption patterns</p>
                        </div>
                        <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[#00333e] transition-colors" />
                    </div>
                </a>
            </div>
        </div>
    );
};

export default AdminFinancials;
