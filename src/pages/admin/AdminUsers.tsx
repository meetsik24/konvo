import React, { useEffect, useState, useCallback } from 'react';
import {
    Users,
    Search,
    MoreVertical,
    Mail,
    Phone,
    Shield,
    UserX,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Filter
} from 'lucide-react';
import { AdminApi, UserApiResponse } from '../../services/api';

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserApiResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [limit] = useState(10);
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const data = await AdminApi.getUsers({ page, limit, search });
            setUsers(data);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [page, limit, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleUpdateStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            setIsUpdating(userId);
            await AdminApi.updateUserStatus(userId, newStatus);
            // Refresh user list
            fetchUsers();
        } catch (err: any) {
            alert('Failed to update user status');
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Users</h1>
                    <p className="text-gray-400 text-sm">Manage platform users and their account status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-red-500/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-gray-400 hover:text-white transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-[#2a2a2a] bg-[#1d1d1d]">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Credits</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2a2a2a]">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-[#222222] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center text-red-500 font-bold uppercase">
                                                    {user.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-white font-medium">{user.username}</div>
                                                    <div className="text-gray-500 text-xs">{user.full_name || 'No full name'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-300">
                                                    <Mail className="w-3 h-3 text-gray-500" />
                                                    {user.email}
                                                </div>
                                                {user.mobile_number && (
                                                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                                                        <Phone className="w-3 h-3 text-gray-600" />
                                                        {user.mobile_number}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            <div>SMS: <span className="text-white font-medium">{user.credits?.sms_credits || 0}</span></div>
                                            <div className="text-xs text-gray-500">Min: {user.credits?.call_minutes || 0}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.account_status === 'active'
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                }`}>
                                                {user.account_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUpdateStatus(user.user_id, user.account_status)}
                                                disabled={isUpdating === user.user_id}
                                                className={`p-2 rounded-lg transition-all ${user.account_status === 'active'
                                                        ? 'text-gray-500 hover:text-red-500 hover:bg-red-500/10'
                                                        : 'text-gray-500 hover:text-green-500 hover:bg-green-500/10'
                                                    }`}
                                            >
                                                {isUpdating === user.user_id ? (
                                                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                                ) : user.account_status === 'active' ? (
                                                    <UserX className="w-5 h-5" />
                                                ) : (
                                                    <UserCheck className="w-5 h-5" />
                                                )}
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
                        Showing <span className="text-white font-medium">{users.length}</span> users
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
                            disabled={users.length < limit || loading}
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

export default AdminUsers;
