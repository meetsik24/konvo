import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { Menu } from 'lucide-react';
import MobileBottomNav from './MobileBottomNav';

const AdminLayout: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
    const closeSidebar = () => setIsSidebarOpen(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex min-h-screen" style={{ zoom: '90%' }}>
                {/* Mobile Header */}
                <header className="fixed top-0 left-0 right-0 bg-[#00333e] text-white px-4 py-3 flex items-center gap-3 z-50 md:hidden shadow-md">
                    <button
                        onClick={toggleSidebar}
                        className="p-2 hover:bg-[#004d5c] rounded-lg transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <img src="/assets/briq.png" alt="Briq Logo" className="w-6 h-6" />
                        <h1 className="text-base font-bold text-white">Admin Console</h1>
                    </div>
                </header>

                {/* Sidebar */}
                <AdminSidebar isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />

                {/* Main Content Area */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Overlay for mobile */}
                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={closeSidebar}
                        />
                    )}

                    {/* Main Content */}
                    <main className="flex-1 overflow-y-auto pt-14 md:pt-0 pb-20 md:pb-0">
                        <div className="flex justify-center items-start px-4 md:px-6 py-6 h-full">
                            <div className="w-full max-w-7xl">
                                <Outlet />
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    );
};

export default AdminLayout;
