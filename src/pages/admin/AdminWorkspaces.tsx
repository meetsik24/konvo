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
    MoreVertical
} from 'lucide-react';
import { AdminApi } from '../../services/api';

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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Workspaces</h1>
                    <p className="text-gray-400 text-sm">Monitor all professional workspaces across the platform.</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search workspaces..."
                        className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-red-500/50 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] bg-[#1d1d1d]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Workspace</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Owner</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Contacts</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center">Campaigns</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        Loading workspaces...
                                    </td>
                                </tr>
                            ) : workspaces.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No workspaces found.
                                    </td>
                                </tr>
                            ) : (
                                workspaces.map((ws) => (
                                    <tr key={ws.workspace_id} className="hover:bg-[#222222] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500">
                                                    <Building className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{ws.name}</div>
                                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">{ws.workspace_id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-white">
                                                    {ws.owner.username.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-gray-300">{ws.owner.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-white font-medium">{ws.total_contacts}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-white font-medium">{ws.total_campaigns}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(ws.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-500 hover:text-white hover:bg-[#2a2a2a] rounded-lg transition-all">
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
                <div className="px-6 py-4 border-t border-[#2a2a2a] flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                        Showing <span className="text-white font-medium">{workspaces.length}</span> workspaces
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
                            disabled={workspaces.length < limit || loading}
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

export default AdminWorkspaces;
