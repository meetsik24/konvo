import React, { useEffect, useState, useCallback } from 'react';
import {
    Building,
    Search,
    Users,
    Layers,
    Calendar,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Mail,
    MoreVertical,
    Filter
} from 'lucide-react';
import { AdminApi } from '../../services/admin-api';

const AdminWorkspaces: React.FC = () => {
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit] = useState(10);
    const [search, setSearch] = useState('');

    const fetchWorkspaces = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminApi.getWorkspaces({ limit, offset: page * limit });
            setWorkspaces(data.workspaces);
        } catch (err: any) {
            console.error('Failed to fetch workspaces:', err);
            setError('Failed to load workspaces.');
        } finally {
            setLoading(false);
        }
    }, [page, limit]);

    useEffect(() => {
        fetchWorkspaces();
    }, [fetchWorkspaces]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">Workspaces</h1>
                    <p className="text-gray-500 text-sm">Monitor all professional workspaces across the platform.</p>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex bg-white p-1 rounded-xl w-fit border border-gray-200 shadow-sm">
                    {['all'] .map((t) => (
                        <button
                            key={t}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all bg-[#00333e] text-white shadow-md`}
                        >
                            All Workspaces
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search workspaces..."
                            className="bg-white border border-gray-200 text-[#00333e] text-sm rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 transition-all shadow-sm">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Workspace</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Contacts</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Campaigns</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading workspaces...
                                    </td>
                                </tr>
                            ) : workspaces.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No workspaces found.
                                    </td>
                                </tr>
                            ) : (
                                workspaces.map((ws) => (
                                    <tr key={ws.workspace_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-[#00333e]/5 rounded-lg">
                                                    <Building className="w-4 h-4 text-[#00333e]" />
                                                </div>
                                                <div>
                                                    <div className="text-[#00333e] font-bold">{ws.name}</div>
                                                    <div className="text-gray-400 text-[10px] uppercase tracking-wider">{ws.workspace_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-[#00333e] font-bold">
                                                    {ws.owner.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-[#00333e] font-medium">{ws.owner.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[#00333e] font-medium">{ws.total_contacts}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[#00333e] font-medium">{ws.total_campaigns}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(ws.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-[#00333e] hover:bg-gray-100 rounded-lg transition-all">
                                                <MoreVertical className="w-5 h-5" />
                                            </button>
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
                        Showing <span className="text-[#00333e]">{workspaces.length}</span> workspaces
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
                            disabled={workspaces.length < limit || loading}
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

export default AdminWorkspaces;
