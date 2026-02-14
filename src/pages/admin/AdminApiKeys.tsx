import React, { useEffect, useState, useCallback } from 'react';
import {
    Key,
    Search,
    Shield,
    Clock,
    CheckCircle,
    XSquare,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    Eye,
    Activity,
    User,
    ExternalLink
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminApiKeys: React.FC = () => {
    const [keys, setKeys] = useState<any[]>([]);
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [keysData, metricsData] = await Promise.all([
                AdminApi.getApiKeys(),
                AdminApi.getApiKeyMetrics()
            ]);
            setKeys(keysData.api_keys || []);
            setMetrics(metricsData);
        } catch (err: any) {
            console.error('Failed to fetch API key data:', err);
            setError('Failed to load API keys.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleStatusUpdate = async (apiKeyId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            setIsUpdating(apiKeyId);
            await AdminApi.updateApiKeyStatus(apiKeyId, newStatus);
            fetchData();
        } catch (err: any) {
            alert('Failed to update status');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Global API Keys</h1>
                    <p className="text-gray-500 text-sm">Manage developer access and monitor key usage.</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Total Active</h3>
                    <p className="text-2xl font-bold text-[#00333e] mb-1">{metrics?.active_keys || 0}</p>
                    <div className="text-[10px] text-gray-500">Currently valid keys</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Suspended</h3>
                    <p className="text-2xl font-bold text-red-600 mb-1">{metrics?.suspended_keys || 0}</p>
                    <div className="text-[10px] text-gray-500">Flagged or revoked</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Requests (24h)</h3>
                    <p className="text-2xl font-bold text-[#00333e] mb-1">{metrics?.total_requests_24h || 0}</p>
                    <div className="text-[10px] text-gray-500">Overall platform API load</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Error Rate</h3>
                    <p className="text-2xl font-bold text-[#c84b31] mb-1">{metrics?.error_rate_percent || 0}%</p>
                    <div className="text-[10px] text-gray-500">Weighted system-wide</div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-[#00333e]">Advanced Search & Filtering</h2>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by ID or User..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white border border-gray-200 text-[#00333e] text-xs rounded-lg pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#00333e]/50"
                            />
                        </div>
                        <button className="p-1.5 bg-white border border-gray-200 rounded-lg text-gray-400 hover:text-[#00333e] transition-all">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">API Key (ID)</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {(() => {
                                const filteredKeys = keys.filter((key: any) =>
                                    key.api_key_id?.toLowerCase().includes(search.toLowerCase()) ||
                                    key.owner_username?.toLowerCase().includes(search.toLowerCase()) ||
                                    key.id?.toLowerCase().includes(search.toLowerCase())
                                );
                                if (loading) return (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                            Loading global keys...
                                        </td>
                                    </tr>
                                );
                                if (filteredKeys.length === 0) return (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No API keys found.</td>
                                    </tr>
                                );
                                return filteredKeys.map((key: any) => (
                                    <tr key={key.id} className="hover:bg-gray-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Key className="w-4 h-4 text-gray-400 group-hover:text-[#00333e] transition-colors" />
                                                <span className="text-[#00333e] font-mono text-xs">{key.api_key_id}...</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-[#00333e] font-medium">
                                                <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-[#00333e] font-bold">
                                                    {key.owner_username?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                                {key.owner_username || 'System'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${key.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {key.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {new Date(key.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    disabled={isUpdating === key.id}
                                                    onClick={() => handleStatusUpdate(key.id, key.status)}
                                                    className="p-1.5 text-gray-400 hover:text-[#00333e] hover:bg-gray-100 rounded-lg transition-all"
                                                >
                                                    {key.status === 'active' ? <XSquare className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminApiKeys;
