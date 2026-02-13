import React, { useEffect, useState, useCallback } from 'react';
import {
    CreditCard,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    DollarSign,
    TrendingUp,
    MoreVertical
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminTransactions: React.FC = () => {
    const [incompleteTransactions, setIncompleteTransactions] = useState<any[]>([]);
    const [completeTransactions, setCompleteTransactions] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'incomplete' | 'complete'>('incomplete');

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const [incompleteData, completeData, metricsData] = await Promise.all([
                AdminApi.getIncompleteTransactions(),
                AdminApi.getCompleteTransactions(),
                AdminApi.getFinancialMetrics()
            ]);
            console.log('Transactions Data:', { incompleteData, completeData, metricsData });
            setIncompleteTransactions(incompleteData.transactions || []);
            setCompleteTransactions(completeData.transactions || []);
            setMetrics(metricsData);
        } catch (err: any) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const displayTransactions = activeTab === 'incomplete' ? incompleteTransactions : completeTransactions;
    const filteredTransactions = displayTransactions.filter((txn: any) =>
        txn.username?.toLowerCase().includes(search.toLowerCase()) ||
        txn.transaction_id?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredTransactions.length / limit);
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Transactions</h1>
                    <p className="text-gray-500 text-sm">Manage and monitor all payment transactions.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Transactions</h3>
                    <p className="text-2xl font-bold text-[#00333e]">{metrics?.total_transactions || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Completed</h3>
                    <p className="text-2xl font-bold text-green-600">{metrics?.completed_transactions || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Incomplete</h3>
                    <p className="text-2xl font-bold text-[#c84b31]">{metrics?.incomplete_transactions || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Avg Value</h3>
                    <p className="text-2xl font-bold text-[#00333e]">${metrics?.avg_transaction_value?.toFixed(2) || 0}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    {/* Tabs */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('incomplete')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'incomplete'
                                        ? 'bg-[#00333e] text-white'
                                        : 'bg-white border border-gray-200 text-[#00333e] hover:border-[#00333e]/30'
                                }`}
                            >
                                Incomplete ({incompleteTransactions.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('complete')}
                                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === 'complete'
                                        ? 'bg-[#00333e] text-white'
                                        : 'bg-white border border-gray-200 text-[#00333e] hover:border-[#00333e]/30'
                                }`}
                            >
                                Complete ({completeTransactions.length})
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by username or ID..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment Method</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                {activeTab === 'incomplete' && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'incomplete' ? 7 : 6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={activeTab === 'incomplete' ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                                        No {activeTab} transactions found.
                                    </td>
                                </tr>
                            ) : (
                                paginatedTransactions.map((txn) => (
                                    <tr key={txn.transaction_id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] text-gray-500 font-mono">{txn.transaction_id?.slice(0, 8)}...</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-[#00333e]">
                                                    {txn.username?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[#00333e] text-sm font-medium">{txn.username}</p>
                                                    <p className="text-[10px] text-gray-500">{txn.user_id?.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[#00333e] font-bold">${txn.total_amount_paid?.toLocaleString() || 0}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            <div className="space-y-0.5">
                                                {txn.sms_quantity > 0 && <p>SMS: {txn.sms_quantity}</p>}
                                                {txn.call_minutes_quantity > 0 && <p>Minutes: {txn.call_minutes_quantity}</p>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                                {txn.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(txn.transaction_date).toLocaleDateString()}
                                        </td>
                                        {activeTab === 'incomplete' && (
                                            <td className="px-6 py-4 text-right">
                                                <button className="px-3 py-1.5 rounded-lg bg-[#00333e] text-white text-xs font-semibold hover:opacity-90 transition-all">
                                                    Approve
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-[#00333e]">{filteredTransactions.length}</span> transactions
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
                            disabled={paginatedTransactions.length < limit || loading}
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

export default AdminTransactions;
