import { useEffect } from 'react';
import { useStatsStore } from '../stores/statsStore';
import { DashboardSkeleton } from '../components/Skeleton';
import {
    Users,
    Mail,
    Briefcase,
    TrendingUp,
    Globe,
    MapPin
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

export default function Dashboard() {
    const { stats, isLoading, fetchStats } = useStatsStore();

    useEffect(() => {
        fetchStats(30);
    }, [fetchStats]);

    if (isLoading || !stats) {
        return <DashboardSkeleton />;
    }

    const statCards = [
        {
            label: 'Total Visitors',
            value: stats.overview.totalVisitors,
            icon: Users,
            color: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Unread Messages',
            value: stats.overview.unreadContacts,
            icon: Mail,
            color: 'from-amber-500 to-amber-600'
        },
        {
            label: 'Total Contacts',
            value: stats.overview.totalContacts,
            icon: TrendingUp,
            color: 'from-green-500 to-green-600'
        },
        {
            label: 'Active Jobs',
            value: stats.overview.activeJobs,
            icon: Briefcase,
            color: 'from-purple-500 to-purple-600'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400">{stats.period}</p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="admin-card p-6"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visitors Over Time */}
                <div className="admin-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-amber-500" />
                        Visitors Over Time
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.visitorsByDay}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                />
                                <YAxis stroke="#9CA3AF" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                    labelStyle={{ color: '#F3F4F6' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#F59E0B"
                                    strokeWidth={2}
                                    dot={{ fill: '#F59E0B', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Visitors by Country */}
                <div className="admin-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-amber-500" />
                        Top Countries
                    </h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.visitorsByCountry.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                                <YAxis
                                    type="category"
                                    dataKey="country"
                                    stroke="#9CA3AF"
                                    fontSize={12}
                                    width={100}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1F2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Visitors */}
            <div className="admin-card p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    Recent Visitors
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-slate-400 text-sm border-b border-slate-700">
                                <th className="pb-3 font-medium text-left bg-transparent">Location</th>
                                <th className="pb-3 font-medium text-left bg-transparent">IP (Masked)</th>
                                <th className="pb-3 font-medium text-left bg-transparent">Consent</th>
                                <th className="pb-3 font-medium text-left bg-transparent">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentVisitors.map((visitor, index) => (
                                <tr key={index} className="border-b border-slate-700/50 text-sm">
                                    <td className="py-3 text-white">
                                        {visitor.city && visitor.country
                                            ? `${visitor.city}, ${visitor.country}`
                                            : visitor.country || 'Unknown'}
                                    </td>
                                    <td className="py-3 text-slate-400 font-mono">{visitor.ip_address}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${visitor.consent_type === 'accepted'
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-red-500/20 text-red-400'
                                            }`}>
                                            {visitor.consent_type}
                                        </span>
                                    </td>
                                    <td className="py-3 text-slate-400">
                                        {new Date(visitor.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
