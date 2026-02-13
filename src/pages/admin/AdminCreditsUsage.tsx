import React, { useEffect, useState, useCallback } from 'react';
import {
    Zap,
    TrendingDown,
    AlertCircle,
    Activity,
    Search,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminCreditsUsage: React.FC = () => {
    const [balanceStats, setBalanceStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [limit] = useState(10);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [balanceData, , usersData] = await Promise.all([
                AdminApi.getBalanceUsageStats(),
                AdminApi.getFinancialMetrics(),
                AdminApi.getUsers({ page, limit, search })
            ]);
            console.log('Credits Usage Data:', { balanceData, usersData });
            setBalanceStats(balanceData);
            setUsers(usersData || []);
        } catch (err: any) {
            console.error('Failed to fetch credits usage data:', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const utilizationRate = balanceStats?.total_credits_allocated 
        ? ((balanceStats.total_credits_used / balanceStats.total_credits_allocated) * 100).toFixed(1)
        : 0;

    const remainingCredits = (balanceStats?.total_credits_allocated || 0) - (balanceStats?.total_credits_used || 0);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Universal Credits Usage</h1>
                    <p className="text-gray-500 text-sm">Monitor credit allocation, consumption, and user metrics.</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Allocated</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">
                        {balanceStats?.total_credits_allocated?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center gap-1 text-blue-600 text-xs font-medium">
                        <Zap className="w-3 h-3" />
                        Universal Credits issued
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Used</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">
                        {balanceStats?.total_credits_used?.toLocaleString() || 0}
                    </p>
                    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                        <TrendingDown className="w-3 h-3" />
                        Consumed by users
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Remaining</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">
                        {remainingCredits.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Available pool
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Utilization</h3>
                    <p className="text-3xl font-bold text-[#00333e] mb-2">{utilizationRate}%</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className="bg-[#00333e] h-1.5 rounded-full transition-all"
                            style={{ width: `${Math.min(parseFloat(utilizationRate as string), 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Average Usage Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Avg Universal Credits Per User</h3>
                        <p className="text-4xl font-bold text-[#00333e] mb-2">
                            {balanceStats?.average_usage_per_user?.toFixed(0) || 0}
                        </p>
                        <p className="text-xs text-gray-500">Average consumption across all active users</p>
                    </div>
                    <Activity className="w-12 h-12 text-[#00333e]/10" />
                </div>
            </div>

            {/* Top Users Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#00333e]">Top Credit Consumers</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(0);
                            }}
                            className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Universal Credits</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No users found.</td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-[#00333e]">
                                                    {user.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[#00333e] text-sm font-medium">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-20">
                                                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '60%' }}></div>
                                                </div>
                                                <span className="text-[#00333e] font-semibold text-xs">{user.universal_credits || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    user.account_status === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {user.account_status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-[#00333e]">{users.length}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-[#00333e] px-2">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={users.length < limit || loading}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCreditsUsage;
