import React, { useEffect, useState, useCallback } from 'react';
import {
    IdCard,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    Trash2,
    Clock,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    ShieldCheck
} from 'lucide-react';
import { AdminApi } from '../../services/api';

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
            alert('Please specify a provider (e.g., Twilio, Infobip) before approving.');
            return;
        }

        try {
            setIsProcessing(requestId);
            await AdminApi.reviewSenderIdRequest(requestId, approve, provider);
            fetchData(); // Refresh list
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Sender IDs</h1>
                    <p className="text-gray-400 text-sm">Review, approve, and manage system Sender IDs.</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#1a1a1a] p-1 rounded-xl w-fit border border-[#2a2a2a]">
                {(['pending', 'approved', 'rejected'] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => { setTab(t); setPage(0); }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t
                                ? 'bg-red-600 text-white shadow-lg'
                                : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                    >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] bg-[#1d1d1d]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Sender ID</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{tab === 'approved' ? 'Approved At' : 'Requested At'}</th>
                                {tab === 'pending' && <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Provider</th>}
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        Loading sender IDs...
                                    </td>
                                </tr>
                            ) : (tab === 'approved' ? approvedList : requests).length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No {tab} sender IDs found.
                                    </td>
                                </tr>
                            ) : (
                                (tab === 'approved' ? approvedList : requests).map((item) => (
                                    <tr key={tab === 'approved' ? item.sender_id : item.request_id} className="hover:bg-[#222222] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-red-600/10 rounded-lg">
                                                    <IdCard className="w-4 h-4 text-red-500" />
                                                </div>
                                                <span className="text-white font-bold">{tab === 'approved' ? item.name : item.sender_id_requested}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm">
                                                <div className="text-gray-300">{item.username}</div>
                                                <div className="text-gray-500 text-xs">ID: {item.user_id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(tab === 'approved' ? item.approved_at : item.requested_at).toLocaleString()}
                                        </td>
                                        {tab === 'pending' && (
                                            <td className="px-6 py-4">
                                                <input
                                                    type="text"
                                                    placeholder="Provider (e.g. Twilio)"
                                                    className="bg-[#2a2a2a] border border-[#3a3a3a] text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500/50"
                                                    value={providerMap[item.request_id] || ''}
                                                    onChange={(e) => setProviderMap(prev => ({ ...prev, [item.request_id]: e.target.value }))}
                                                />
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            {tab === 'pending' ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleReview(item.request_id, true)}
                                                        disabled={isProcessing === item.request_id}
                                                        className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(item.request_id, false)}
                                                        disabled={isProcessing === item.request_id}
                                                        className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Reject"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : tab === 'approved' ? (
                                                <button
                                                    onClick={() => handleDelete(item.sender_id)}
                                                    className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <span className="text-xs text-red-500 font-bold uppercase">Rejected</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        {tab === 'approved' ? `Total length: ${approvedList.length}` : `Total length: ${requests.length}`}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="p-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-white px-2">Page {page + 1}</span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={(tab === 'approved' ? approvedList : requests).length < limit || loading}
                            className="p-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white disabled:opacity-50 transition-all"
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
