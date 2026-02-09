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
import { AdminApi } from '../../services/api';

const AdminOTPs: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);

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
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">OTP Logs</h1>
                    <p className="text-gray-400 text-sm">Monitor verification codes and success rates.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-4 py-2 rounded-xl flex items-center gap-2">
                        <span className="text-gray-500 text-xs font-medium uppercase">Success Rate</span>
                        <span className="text-green-500 font-bold">{metrics?.usage_rate_percent?.toFixed(1) || 0}%</span>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Total Generated</h3>
                    <p className="text-2xl font-bold text-white mb-2">{metrics?.total_otps_generated || 0}</p>
                    <div className="text-[10px] text-gray-500">All time platform activity</div>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Total Verified</h3>
                    <p className="text-2xl font-bold text-green-500 mb-2">{metrics?.total_otps_used || 0}</p>
                    <div className="text-[10px] text-gray-500">Successfully completed verifications</div>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#2a2a2a]">
                    <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Expired / Failed</h3>
                    <p className="text-2xl font-bold text-red-500 mb-2">{metrics?.total_otps_expired || 0}</p>
                    <div className="text-[10px] text-gray-500">Codes that were not used in time</div>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-[#2a2a2a] bg-[#1d1d1d] flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white">Recent OTP Activity</h2>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Filter by phone..."
                            className="bg-[#2a2a2a] border border-[#3a3a3a] text-white text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-red-500/50"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] bg-[#1d1d1d]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Code</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Generated</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Used/Expired</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No OTP logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.otp_id} className="hover:bg-[#222222] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                                                    <Smartphone className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{log.phone_number}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase">User: {log.user_id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-white tracking-widest bg-[#2a2a2a] px-2 py-1 rounded text-sm">
                                                {log.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${log.is_used
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : new Date(log.expires_at) < new Date()
                                                        ? 'bg-red-500/10 text-red-500'
                                                        : 'bg-yellow-500/10 text-yellow-500'
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
                                        <td className="px-6 py-4 text-xs text-gray-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {log.used_at ? new Date(log.used_at).toLocaleString() : `Expires: ${new Date(log.expires_at).toLocaleTimeString()}`}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Platform wide OTP audit trailing
                    </p>
                    <div className="flex items-center gap-2">
                        <button disabled className="p-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 opacity-50">
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-medium text-white px-2">Page 1</span>
                        <button disabled className="p-1.5 rounded-lg border border-[#2a2a2a] text-gray-400 opacity-50">
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOTPs;
