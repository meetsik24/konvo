import React, { useEffect, useState, useCallback } from 'react';
import {
    ShieldCheck,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Filter,
    User,
    Smartphone
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminOTPs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const [logsData, metricsData] = await Promise.all([
                AdminApi.getOTPCodes(),
                AdminApi.getOTPCodesMetrics()
            ]);
            setLogs(logsData.otp_logs);
            setMetrics(metricsData);
        } catch (err: any) {
            console.error('Failed to fetch OTP data:', err);
            setError('Failed to load OTP logs.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">OTP Logs</h1>
                    <p className="text-gray-500 text-sm">Monitor verification codes and success rates.</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Generated</h3>
                    <p className="text-2xl font-bold text-[#00333e] mb-2">{metrics?.total_otps_generated || 0}</p>
                    <div className="text-[10px] text-gray-500">All time platform activity</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Verified</h3>
                    <p className="text-2xl font-bold text-green-600 mb-2">{metrics?.total_otps_used || 0}</p>
                    <div className="text-[10px] text-gray-500">Successfully completed verifications</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Expired / Failed</h3>
                    <p className="text-2xl font-bold text-[#c84b31] mb-2">{metrics?.total_otps_expired || 0}</p>
                    <div className="text-[10px] text-gray-500">Codes that were not used in time</div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#00333e]">Recent OTP Activity</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Generated</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Used/Expired</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                                const filteredLogs = logs.filter((log: any) =>
                                    log.phone_number?.toLowerCase().includes(search.toLowerCase()) ||
                                    log.user_id?.toLowerCase().includes(search.toLowerCase()) ||
                                    log.code?.includes(search)
                                );
                                if (loading) return (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                            Loading logs...
                                        </td>
                                    </tr>
                                );
                                if (filteredLogs.length === 0) return (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No OTP logs found.
                                        </td>
                                    </tr>
                                );
                                return filteredLogs.map((log: any) => (
                                    <tr key={log.otp_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                                                    <Smartphone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-[#00333e] font-medium">{log.phone_number}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase">User: {log.user_id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-[#00333e] tracking-widest bg-gray-100 px-2 py-1 rounded text-sm font-bold">
                                                {log.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.is_used
                                                    ? 'bg-green-100 text-green-700'
                                                    : new Date(log.expires_at) < new Date()
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {log.is_used ? (
                                                    <><CheckCircle2 className="w-3 h-3" /> VERIFIED</>
                                                ) : new Date(log.expires_at) < new Date() ? (
                                                    <><XCircle className="w-3 h-3" /> EXPIRED</>
                                                ) : (
                                                    <><Clock className="w-3 h-3" /> ACTIVE</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {log.used_at ? new Date(log.used_at).toLocaleString() : `Expires: ${new Date(log.expires_at).toLocaleTimeString()}`}
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <p className="text-xs text-gray-500 font-medium">
                        Showing <span className="text-[#00333e]">{logs.length}</span> logs
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
                            disabled={logs.length < limit || loading}
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

export default AdminOTPs;
