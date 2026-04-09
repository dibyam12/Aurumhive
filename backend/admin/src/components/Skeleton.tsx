import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
}

export function Skeleton({ className = '', width = '100%', height = '1rem' }: SkeletonProps) {
    return (
        <motion.div
            className={`bg-slate-700/50 rounded-md ${className}`}
            style={{ width, height }}
            animate={{ opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4 ${className}`}>
            <Skeleton width="60%" height="1.5rem" />
            <div className="space-y-2">
                <Skeleton width="100%" height="0.875rem" />
                <Skeleton width="90%" height="0.875rem" />
                <Skeleton width="70%" height="0.875rem" />
            </div>
        </div>
    );
}

// Full page loading spinner
export function PageLoader() {
    return (
        <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <motion.div
                className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <p className="text-slate-400 text-sm">Loading...</p>
        </div>
    );
}

// Stats cards skeleton
export function SkeletonStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-3">
                    <Skeleton width="40%" height="0.875rem" />
                    <Skeleton width="60%" height="2rem" />
                    <Skeleton width="50%" height="0.75rem" />
                </div>
            ))}
        </div>
    );
}

// Dashboard page skeleton
export function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton width="200px" height="2rem" />
                <Skeleton width="300px" height="1rem" />
            </div>
            <SkeletonStats />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        </div>
    );
}

// Careers page skeleton - shows job listing cards
export function CareersPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton width="150px" height="2rem" />
                    <Skeleton width="200px" height="1rem" />
                </div>
                <Skeleton width="100px" height="2.5rem" className="rounded-lg" />
            </div>
            {/* Job cards */}
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center gap-3">
                                    <Skeleton width="200px" height="1.25rem" />
                                    <Skeleton width="60px" height="1.25rem" className="rounded-full" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <Skeleton width="120px" height="0.875rem" />
                                    <Skeleton width="80px" height="0.875rem" />
                                    <Skeleton width="80px" height="0.875rem" />
                                </div>
                                <Skeleton width="90%" height="0.875rem" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton width="36px" height="36px" className="rounded-lg" />
                                <Skeleton width="36px" height="36px" className="rounded-lg" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Messages page skeleton - two column layout
export function MessagesPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton width="200px" height="2rem" />
                    <Skeleton width="150px" height="1rem" />
                </div>
                <Skeleton width="120px" height="1.5rem" />
            </div>
            {/* Two columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Messages list */}
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <Skeleton width="40px" height="40px" className="rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between">
                                        <Skeleton width="120px" height="1rem" />
                                        <Skeleton width="80px" height="0.75rem" />
                                    </div>
                                    <Skeleton width="180px" height="0.875rem" />
                                    <Skeleton width="100%" height="0.75rem" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Detail panel */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <Skeleton width="48px" height="48px" className="rounded-full" />
                        <Skeleton width="180px" height="1rem" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Site Content page skeleton
export function ContentPageSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton width="180px" height="2rem" />
                <Skeleton width="280px" height="1rem" />
            </div>
            {/* Content sections */}
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                        <div className="flex justify-between items-start">
                            <div className="flex-1 space-y-3">
                                <Skeleton width="150px" height="1.25rem" />
                                <Skeleton width="100%" height="0.875rem" />
                                <Skeleton width="80%" height="0.875rem" />
                            </div>
                            <Skeleton width="36px" height="36px" className="rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Profile page skeleton
export function ProfilePageSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton width="150px" height="2rem" />
                <Skeleton width="250px" height="1rem" />
            </div>
            {/* Profile card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-6 mb-6">
                    <Skeleton width="80px" height="80px" className="rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton width="200px" height="1.5rem" />
                        <Skeleton width="150px" height="1rem" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Skeleton width="100%" height="2.5rem" className="rounded-lg" />
                    <Skeleton width="100%" height="2.5rem" className="rounded-lg" />
                    <Skeleton width="100%" height="2.5rem" className="rounded-lg" />
                    <Skeleton width="100%" height="2.5rem" className="rounded-lg" />
                </div>
            </div>
        </div>
    );
}

// Keep old name for backward compatibility
export const TablePageSkeleton = CareersPageSkeleton;
