import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
    LayoutDashboard,
    Briefcase,
    Mail,
    FileText,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/careers', label: 'Careers', icon: Briefcase },
    { path: '/contacts', label: 'Messages', icon: Mail },
    { path: '/content', label: 'Site Content', icon: FileText },
];

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo_1.png" alt="Aurumhive" className="w-8 h-8" />
                        <h1 className="text-xl font-brand bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                            Aurumhive Admin
                        </h1>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-slate-400 hover:text-white"
                    >
                        {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <aside className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700/50 transform transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <img src="/images/logo_1.png" alt="Aurumhive" className="w-10 h-10" />
                            <div>
                                <h1 className="text-2xl font-brand bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                    Aurumhive
                                </h1>
                                <p className="text-slate-500 text-sm">Admin Dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-amber-500/20 text-amber-500'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="p-4 border-t border-slate-700/50">
                        <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-semibold group-hover:from-amber-400 group-hover:to-amber-500 transition-all">
                                {user?.username?.charAt(0).toUpperCase() || 'A'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate">{user?.username}</p>
                                <p className="text-slate-500 text-sm truncate group-hover:text-slate-400 transition-colors">{user?.email || 'Admin'}</p>
                            </div>
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 mt-2 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
