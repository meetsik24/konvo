import React, { useEffect, useState, useCallback } from 'react';
import {
    Search,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '../../components/ui/sheet';

const AdminTransactions: React.FC = () => {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true);
            const skip = page * limit;
            const response = await AdminApi.getAdminTransactions(limit, skip);
            
            // Handle both array and object responses
            const transactionsData = Array.isArray(response) ? response : (response?.data || response?.transactions || []);
            const count = response?.total || response?.count || transactionsData.length;
            
            console.log('Transactions Data:', { transactionsData, count });
            setTransactions(transactionsData);
            setTotalCount(count);
            
            // Fetch metrics separately
            const metricsData = await AdminApi.getFinancialMetrics();
            setMetrics(metricsData);
        } catch (err: any) {
            console.error('Failed to fetch transactions:', err);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const displayTransactions = transactions;
    const filteredTransactions = displayTransactions.filter((txn: any) =>
        txn.transaction_name?.toLowerCase().includes(search.toLowerCase()) ||
        txn.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
        txn.user_id?.toLowerCase().includes(search.toLowerCase())
    );

    // Pagination logic - using API pagination
    const totalPages = Math.ceil(totalCount / limit);
    const displayedTransactions = filteredTransactions;

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
                    <p className="text-2xl font-bold text-[#00333e]">TShs {metrics?.avg_transaction_value?.toFixed(2) || 0}</p>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    {/* Tabs */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by username, transaction ID, or user ID..."
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setPage(0);
                                }}
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm text-[#00333e] placeholder-gray-400 focus:outline-none focus:border-[#00333e]/30 focus:ring-1 focus:ring-[#00333e]/20 transition-all"
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading transactions...
                                    </td>
                                </tr>
                            ) : displayedTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No transactions found.
                                    </td>
                                </tr>
                            ) : (
                                displayedTransactions.map((txn) => (
                                    <tr
                                        key={txn.transaction_id}
                                        className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                        onClick={() => {
                                            setSelectedTransaction(txn);
                                            setIsSheetOpen(true);
                                        }}
                                    >
                                        <td className="px-6 py-4">
                                            <code className="text-[10px] text-gray-500 font-mono">{txn.transaction_id?.slice(0, 8)}...</code>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-[#00333e]">
                                                    {txn.transaction_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-[#00333e] text-sm font-medium">{txn.transaction_name}</p>
                                                    <p className="text-[10px] text-gray-500">{txn.user_id?.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-[#00333e] font-bold">TShs {txn.total_amount_paid?.toLocaleString() || 0}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            <p>{txn.units_purchased?.toLocaleString() || 0} units</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700">
                                                {txn.payment_method || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                    txn.marked_complete
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {txn.marked_complete ? 'Complete' : 'Pending'}
                                                </span>
                                            </div>
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
                        Showing <span className="text-[#00333e]">{displayedTransactions.length}</span> of <span className="text-[#00333e]">{totalCount}</span> transactions
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-[#00333e] px-2">Page {page + 1} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={displayedTransactions.length < limit || loading || page >= totalPages - 1}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 transition-all bg-white shadow-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Transaction Details Sheet */}
            {selectedTransaction && (
                <Sheet
                    open={isSheetOpen}
                    onOpenChange={(open) => {
                        setIsSheetOpen(open);
                        if (!open) {
                            setSelectedTransaction(null);
                        }
                    }}
                >
                    <SheetContent side="right" className="sm:max-w-[420px] w-full p-0 bg-white">
                        <SheetHeader className="px-5 py-4 border-b border-gray-200">
                            <SheetTitle>Transaction details</SheetTitle>
                            <SheetDescription>
                                Full details for transaction{' '}
                                <code className="text-[10px] font-mono">
                                    {selectedTransaction.transaction_id}
                                </code>
                            </SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-[#00333e]">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        User
                                    </p>
                                    <p className="mt-1 font-medium">
                                        {selectedTransaction.transaction_name || 'N/A'}
                                    </p>
                                    <p className="mt-0.5 text-[11px] text-gray-500 font-mono">
                                        {selectedTransaction.user_id || 'N/A'}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </p>
                                        <p className="mt-1 font-bold">
                                            TShs{' '}
                                            {selectedTransaction.total_amount_paid
                                                ? Number(selectedTransaction.total_amount_paid).toLocaleString()
                                                : 0}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Units
                                        </p>
                                        <p className="mt-1">
                                            {selectedTransaction.units_purchased
                                                ? Number(selectedTransaction.units_purchased).toLocaleString()
                                                : 0}{' '}
                                            units
                                        </p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Payment Method
                                        </p>
                                        <p className="mt-1">
                                            {selectedTransaction.payment_method || 'N/A'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Status
                                        </p>
                                        <span
                                            className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                selectedTransaction.marked_complete
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                            }`}
                                        >
                                            {selectedTransaction.marked_complete ? 'Complete' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                                {selectedTransaction.transaction_date && (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            Date
                                        </p>
                                        <p className="mt-1">
                                            {new Date(selectedTransaction.transaction_date).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            )}
        </div>
    );
};

export default AdminTransactions;
