import React, { useEffect, useState, useCallback } from 'react';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    AlertCircle,
    Calendar,
    ChevronLeft,
    ChevronRight,
    TrendingDown,
    Activity,
    User,
    ExternalLink
} from 'lucide-react';
import { AdminApi } from '../../services/api';

const AdminFinancials: React.FC = () => {
    const [metrics, setMetrics] = useState<any>(null);
    const [incomplete, setIncomplete] = useState<any[]>([]);
    const [trends, setTrends] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFinancials = useCallback(async () => {
        try {
            setLoading(true);
            const [metricsData, incompleteData, trendsData] = await Promise.all([
                AdminApi.getFinancialMetrics(),
                AdminApi.getIncompleteTransactions(),
                AdminApi.getRevenueTrends()
            ]);
            setMetrics(metricsData);
            setIncomplete(incompleteData.transactions || []);
            setTrends(trendsData.revenue_trends || []);
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Financials</h1>
                    <p className="text-gray-500 text-sm">Revenue tracking and transaction monitoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm">
                        <span className="text-gray-500 text-xs font-medium uppercase">Avg. Transaction</span>
                        <span className="text-[#00333e] font-bold">${metrics?.avg_transaction_value?.toFixed(2) || 0}</span>
                    </div>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Revenue</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">${metrics?.total_revenue?.toLocaleString() || 0}</p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <TrendingUp className="w-3 h-3" />
                        +18% from last month
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Monthly Revenue</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">${metrics?.monthly_revenue?.toLocaleString() || 0}</p>
                    <div className="text-[10px] text-gray-500">Current calendar month</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Credits Sold</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">{metrics?.sms_credits_sold?.toLocaleString() || 0}</p>
                    <div className="text-[10px] text-gray-500">Total SMS units distributed</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Incomplete Trx</h3>
                    <p className="text-3xl font-bold text-[#c84b31] mb-2">{metrics?.incomplete_transactions || 0}</p>
                    <div className="text-[10px] text-gray-500">Requires attention</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Users Table */}
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-[#00333e]">Top Spending Users</h2>
                        <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase">Total Spent</th>
                                    <th className="px-6 py-3 text-[10px] font-bold text-gray-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics?.top_users?.length === 0 ? (
                                    <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500 text-sm">No data available</td></tr>
                                ) : (
                                    metrics?.top_users?.map((user: any) => (
                                        <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-[#00333e]">
                                                        {user.username.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-[#00333e] text-sm font-medium">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[#00333e] font-bold">${user.total_spent.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-gray-400 hover:text-[#00333e]">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Balance Alert */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-[#c84b31]" />
                        <h2 className="text-sm font-bold text-[#00333e]">Low Balance Alert</h2>
                    </div>
                    <div className="px-6 py-4 space-y-3">
                        {metrics?.users_low_balance?.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center py-4">All users healthy</p>
                        ) : (
                            metrics?.users_low_balance?.map((user: any) => (
                                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-[#00333e] text-sm font-medium">{user.username}</p>
                                        <p className="text-[10px] text-gray-500">{user.sms_credits} units left</p>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-[#c84b31] animate-pulse"></div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminFinancials;
