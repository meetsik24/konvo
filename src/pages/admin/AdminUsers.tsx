import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    Mail,
    Phone,
    UserX,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Filter,
    TrendingUp
} from 'lucide-react';
import { AdminApi, UserApiResponse } from '../../services/api';

interface UserStats {
    total: number;
    active: number;
    suspended: number;
}

// Helper function to format date safely
const formatDate = (dateValue: string | number | undefined): string => {
    if (!dateValue) return 'N/A';

    try {
        // Try parsing as ISO string first
        let date = new Date(dateValue);

        // If invalid, try parsing as timestamp
        if (isNaN(date.getTime()) && typeof dateValue === 'string') {
            // Try parsing as unix timestamp (seconds)
            const timestamp = parseInt(dateValue, 10);
            if (!isNaN(timestamp)) {
                date = new Date(timestamp * 1000);
            }
        }

        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

const AdminUsers: React.FC = () => {
    const [allUsers, setAllUsers] = useState<UserApiResponse[]>([]);
    const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, suspended: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const ITEMS_PER_PAGE = 10;

    // Fetch all users once
    const fetchAllUsers = useCallback(async () => {
        try {
            setLoading(true);
            // Backend might not support pagination, so fetch all
            const data = await AdminApi.getUsers({ page: 0, limit: 1000 });
            setAllUsers(data);

            // Calculate stats
            const totalUsers = data.length;
            const activeUsers = data.filter(u => u.account_status === 'active').length;
            const suspendedUsers = data.filter(u => u.account_status === 'suspended').length;
            setStats({ total: totalUsers, active: activeUsers, suspended: suspendedUsers });
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError('Failed to load users. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    // Filter and paginate users client-side
    const filteredUsers = useMemo(() => {
        if (!search.trim()) return allUsers;
        const searchLower = search.toLowerCase();
        return allUsers.filter(user =>
            user.username.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
            (user.mobile_number && user.mobile_number.includes(search))
        );
    }, [allUsers, search]);

    const paginatedUsers = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        return filteredUsers.slice(start, end);
    }, [filteredUsers, page]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    // Reset to page 0 when search changes
    useEffect(() => {
        setPage(0);
    }, [search]);

    const handleUpdateStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
        try {
            setIsUpdating(userId);
            await AdminApi.updateUserStatus(userId, newStatus);
            // Refresh user list
            fetchAllUsers();
        } catch (err: any) {
            alert('Failed to update user status');
        } finally {
            setIsUpdating(null);
        }
    };

    const startIndex = page * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min((page + 1) * ITEMS_PER_PAGE, filteredUsers.length);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#00333e] tracking-tight mb-1">User Management</h1>
                    <p className="text-gray-500 text-sm">Manage platform users and their account status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-white border border-gray-200 text-[#00333e] text-sm rounded-xl pl-10 pr-4 py-2.5 w-full md:w-64 focus:outline-none focus:border-[#00333e]/50 focus:ring-2 focus:ring-[#00333e]/10 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-[#00333e] hover:border-[#00333e]/30 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-blue-50">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-[#00333e]">{stats.total}</h3>
                            <p className="text-gray-500 text-xs font-medium">Total Users</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-green-50">
                            <UserCheck className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#00333e]">{stats.active}</h3>
                            <p className="text-gray-500 text-xs font-medium">Active Users</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-600">
                            {stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-red-50">
                            <UserX className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-2xl font-bold text-[#00333e]">{stats.suspended}</h3>
                            <p className="text-gray-500 text-xs font-medium">Suspended</p>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-50 text-red-500">
                            {stats.total > 0 ? ((stats.suspended / stats.total) * 100).toFixed(0) : 0}%
                        </span>
                    </div>
                </motion.div>
            </div>

            {/* Users Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Credits</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00333e] mx-auto mb-4"></div>
                                        Loading users...
                                    </td>
                                </tr>
                            ) : paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                        No users found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((user) => (
                                    <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#00333e]/10 flex items-center justify-center text-[#00333e] font-bold uppercase">
                                                    {user.username.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[#00333e] font-medium">{user.username}</div>
                                                    <div className="text-gray-400 text-xs">{user.full_name || 'No full name'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {user.email}
                                                </div>
                                                {user.mobile_number && (
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                                                        <Phone className="w-3 h-3" />
                                                        {user.mobile_number}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div>SMS: <span className="text-[#00333e] font-medium">{user.credits?.sms_credits || 0}</span></div>
                                            <div className="text-xs text-gray-400">Min: {user.credits?.call_minutes || 0}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.account_status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-600'
                                                }`}>
                                                {user.account_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {formatDate(user.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleUpdateStatus(user.user_id, user.account_status)}
                                                disabled={isUpdating === user.user_id}
                                                className={`p-2 rounded-lg transition-all ${user.account_status === 'active'
                                                    ? 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                                    : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <p className="text-sm text-gray-500">
                        Showing <span className="font-medium text-[#00333e]">{filteredUsers.length > 0 ? startIndex : 0}</span> to <span className="font-medium text-[#00333e]">{endIndex}</span> of <span className="font-medium text-[#00333e]">{filteredUsers.length}</span> users
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum: number;
                                if (totalPages <= 5) {
                                    pageNum = i;
                                } else if (page < 3) {
                                    pageNum = i;
                                } else if (page > totalPages - 3) {
                                    pageNum = totalPages - 5 + i;
                                } else {
                                    pageNum = page - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setPage(pageNum)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${page === pageNum
                                                ? 'bg-[#00333e] text-white'
                                                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00333e]/30'
                                            }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:text-[#00333e] hover:border-[#00333e]/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-white"
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
