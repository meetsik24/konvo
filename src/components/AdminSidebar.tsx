import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    IdCard,
    Building,
    DollarSign,
    CreditCard,
    Zap,
    Package,
    Layers,
    Key,
    MessageSquare,
    ShieldCheck,
    LogOut,
    X,
    Gift,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { store } from '../store/store';
import type { RootState } from '../store/store';

const adminNavItems = [
    { to: '/orange/dashboard', icon: LayoutDashboard, label: 'Admin Dashboard' },
    { to: '/orange/users', icon: Users, label: 'User Management' },
    { to: '/orange/sender-ids', icon: IdCard, label: 'Sender IDs' },
    { to: '/orange/workspaces', icon: Building, label: 'Workspaces' },
    { to: '/orange/financials', icon: DollarSign, label: 'Financial Overview' },
    { to: '/orange/transactions', icon: CreditCard, label: 'Transactions' },
    { to: '/orange/credits-usage', icon: Zap, label: 'Credits Usage' },
    { to: '/orange/packages', icon: Package, label: 'Packages' },
    { to: '/orange/services', icon: Layers, label: 'Services' },
    { to: '/orange/api-keys', icon: Key, label: 'API Keys' },
    { to: '/orange/messages', icon: MessageSquare, label: 'Messages' },
    { to: '/orange/otps', icon: ShieldCheck, label: 'OTP Logs' },
    { to: '/orange/referrals', icon: Gift, label: 'Referrals' },
];

interface AdminSidebarProps {
    closeSidebar: () => void;
    isSidebarOpen: boolean;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ closeSidebar, isSidebarOpen }) => {
    const dispatch = useDispatch<typeof store.dispatch>();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const avatarUrl = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'Admin')}&background=00333e&color=fff`;

    return (
        <>
            <aside
                className={`bg-[#00333e] flex flex-col shadow-xl overflow-hidden transition-all duration-300 ease-in-out
          ${isSidebarOpen
                        ? 'fixed md:sticky top-0 left-0 h-screen w-64 z-50 md:z-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl md:top-4'
                        : 'fixed md:sticky top-0 left-0 h-screen w-0 md:w-64 -translate-x-full md:translate-x-0 z-50 md:z-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-2xl md:top-4'
                    }`}
            >
                <div className="flex flex-col h-full py-4">
                    {/* Logo Section */}
                    <div className="px-5 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#fddf0d] rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-5 h-5 text-[#00333e]" />
                            </div>
                            <h1 className="text-lg font-bold text-white">Briq Admin</h1>
                        </div>
                        <button onClick={closeSidebar} className="md:hidden text-gray-300 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 overflow-y-auto custom-scrollbar">
                        {adminNavItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group ${isActive
                                        ? 'bg-[#fddf0d] text-[#00333e] shadow-lg'
                                        : 'text-gray-300 hover:bg-[#004d5c] hover:text-white'
                                    }`
                                }
                                onClick={closeSidebar}
                            >
                                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </NavLink>
                        ))}
                    </nav>

                    {/* Footer Section */}
                    <div className="mt-auto px-4 pt-4 border-t border-[#004d5c] space-y-4">
                        <div className="flex items-center gap-3 p-2 rounded-xl bg-[#004d5c]">
                            <img
                                src={avatarUrl}
                                alt={user?.username}
                                className="w-9 h-9 rounded-full border border-[#005d6c]"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user?.username || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-300 truncate">
                                    {user?.email || 'admin@example.com'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-300 hover:text-[#fddf0d] transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;
