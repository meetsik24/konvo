import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    IdCard,
    CheckCircle,
    XCircle,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminSenderIds: React.FC = () => {
    const [requests, setRequests] = useState<any[]>([]);
    const [approvedList, setApprovedList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);
    const [providerMap, setProviderMap] = useState<Record<string, string>>({});

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            if (tab === 'approved') {
                const data = await AdminApi.getApprovedSenderIds(limit, page * limit);
                setApprovedList(data.sender_ids);
            } else {
                const data = await AdminApi.getSenderIdRequests(tab, limit, page * limit);
                setRequests(data.requests);
            }
        } catch (err: any) {
            console.error('Failed to fetch sender IDs:', err);
            setError('Failed to load data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [tab, page, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleReview = async (requestId: string, approve: boolean) => {
        const provider = providerMap[requestId];
        if (approve && (!provider || provider.trim() === '')) {
            alert('Please select a provider before approving.');
            return;
        }

        try {
            setIsProcessing(requestId);
            await AdminApi.reviewSenderIdRequest(requestId, approve, provider);
            // Refresh list
            fetchData();
        } catch (err: any) {
            alert(`Failed to ${approve ? 'approve' : 'reject'} request: ${err.message}`);
        } finally {
            setIsProcessing(null);
        }
    };

    const handleDelete = async (senderId: string) => {
        if (!window.confirm('Are you sure you want to delete this Sender ID?')) return;
        try {
            await AdminApi.deleteSenderId(senderId);
            fetchData();
        } catch (err: any) {
            alert('Failed to delete Sender ID');
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Sender IDs</h1>
                    <p className="text-gray-500 text-sm">Review, approve, and manage system Sender IDs.</p>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
                    {(['pending', 'approved', 'rejected'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setPage(0); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t
                                ? 'bg-[#00333e] text-white shadow-md'
                                : 'text-gray-500 hover:text-[#00333e] hover:bg-gray-50'
                                }`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sender IDs..."
                            className="bg-white border border-gray-200 text-[#00333e] text-sm rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10 transition-all"
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sender ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{tab === 'approved' ? 'Approved At' : 'Requested At'}</th>
                                {tab === 'pending' && <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Provider</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading sender IDs...
                                    </td>
                                </tr>
                            ) : (tab === 'approved' ? approvedList : requests).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        No {tab} sender IDs found.
                                    </td>
                                </tr>
                            ) : (
                                (tab === 'approved' ? approvedList : requests).map((item) => (
                                    <tr key={tab === 'approved' ? item.sender_id : item.request_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#00333e]/5 rounded-lg">
                                                    <IdCard className="w-4 h-4 text-[#00333e]" />
                                                </div>
                                                <span className="text-[#00333e] font-bold">{tab === 'approved' ? item.name : item.sender_id_requested}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="text-[#00333e] font-medium">{item.username}</div>
                                                <div className="text-gray-400 text-xs">ID: {item.user_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tab === 'approved' ? item.approved_at : item.requested_at).toLocaleString()}
                                        </td>
                                        {tab === 'pending' && (
                                            <td className="px-6 py-4">
                                                <select
                                                    className="bg-gray-50 border border-gray-200 text-[#00333e] text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#00333e]/50 transition-all font-medium cursor-pointer hover:border-[#00333e]/30"
                                                    value={providerMap[item.request_id] || ''}
                                                    onChange={(e) => setProviderMap(prev => ({ ...prev, [item.request_id]: e.target.value }))}
                                                >
                                                    <option value="">Select Provider</option>
                                                    <option value="ESKI_SMS">ESKI_SMS</option>
                                                    <option value="BEEM_SMS">BEEM_SMS</option>
                                                </select>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            {tab === 'pending' ? (
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => handleReview(item.request_id, true)}
                                                        disabled={isProcessing === item.request_id}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(item.request_id, false)}
                                                        disabled={isProcessing === item.request_id}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : tab === 'approved' ? (
                                                <button
                                                    onClick={() => handleDelete(item.sender_id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                                                    Rejected
                                                </span>
                                            )}
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
                        Showing <span className="text-[#00333e]">{(tab === 'approved' ? approvedList : requests).length}</span> items
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
                            disabled={(tab === 'approved' ? approvedList : requests).length < limit || loading}
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

export default AdminSenderIds;
