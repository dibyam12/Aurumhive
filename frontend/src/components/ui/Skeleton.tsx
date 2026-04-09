import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
    width?: string;
    height?: string;
    rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export default function Skeleton({
    className = '',
    width = '100%',
    height = '1rem',
    rounded = 'md'
}: SkeletonProps) {
    const roundedClasses = {
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        full: 'rounded-full'
    };

    return (
        <motion.div
            className={`bg-border/50 ${roundedClasses[rounded]} ${className}`}
            style={{ width, height }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
    );
}

// Preset skeleton variants
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="0.875rem"
                    width={i === lines - 1 ? '70%' : '100%'}
                />
            ))}
        </div>
    );
}

export function SkeletonHeading({ className = '' }: { className?: string }) {
    return <Skeleton height="2rem" width="60%" className={className} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
    return (
        <div className={`bg-card-bg border border-border rounded-xl p-6 space-y-4 ${className}`}>
            <SkeletonHeading />
            <SkeletonText lines={3} />
        </div>
    );
}

export function SkeletonButton({ className = '' }: { className?: string }) {
    return <Skeleton width="8rem" height="2.5rem" rounded="lg" className={className} />;
}
