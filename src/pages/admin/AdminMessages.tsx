import React, { useEffect, useState, useCallback } from 'react';
import {
    MessageSquare,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Send,
    CheckCircle2,
    AlertCircle,
    Clock,
    User,
    Activity,
    Smartphone,
    Mail,
    MoreVertical
} from 'lucide-react';
import { AdminApi } from '../../services/api';

const AdminMessages: React.FC = () => {
    const [messages, setMessages] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [messagesData, metricsData] = await Promise.all([
                AdminApi.getAdminMessages({ offset: page * limit, limit }),
                AdminApi.getAdminMessagesMetrics()
            ]);
            setMessages(messagesData.messages || []);
            setMetrics(metricsData);
        } catch (err: any) {
            console.error('Failed to fetch messages:', err);
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">System Messages</h1>
                    <p className="text-gray-500 text-sm">Monitor platform-wide message traffic and delivery status.</p>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">SMS (24h)</h3>
                    <p className="text-2xl font-bold text-[#00333e]">{metrics?.sms_sent_24h || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Email (24h)</h3>
                    <p className="text-2xl font-bold text-[#00333e]">{metrics?.email_sent_24h || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Delivery Rate</h3>
                    <p className="text-2xl font-bold text-green-600">{metrics?.delivery_success_rate || 0}%</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Failed</h3>
                    <p className="text-2xl font-bold text-[#c84b31]">{metrics?.delivery_failed_count || 0}</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#00333e]">Message Traffic Log</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search message content..."
                                className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Message Content</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Syncing message logs...
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No messages logged.</td>
                                </tr>
                            ) : (
                                messages.map((msg) => (
                                    <tr key={msg.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4 capitalize">
                                            <div className="flex items-center gap-2">
                                                {msg.type === 'sms' ? <Smartphone className="w-4 h-4 text-blue-500" /> : <Mail className="w-4 h-4 text-purple-500" />}
                                                <span className="text-[#00333e] text-xs font-bold uppercase">{msg.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-[#00333e] text-sm font-medium">{msg.recipient}</div>
                                            <div className="text-[10px] text-gray-500 uppercase tracking-tighter">WS: {msg.workspace_id?.slice(0, 8)}...</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">{msg.content}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${msg.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {msg.status === 'delivered' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(msg.created_at).toLocaleString()}
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
                        Showing <span className="text-[#00333e]">{messages.length}</span> messages
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
                            disabled={messages.length < limit || loading}
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

export default AdminMessages;
