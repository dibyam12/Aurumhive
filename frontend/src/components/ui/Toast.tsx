import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore, type Toast as ToastType } from '../../stores/toastStore';

const toastStyles = {
    success: {
        bg: 'bg-green-500/90',
        border: 'border-green-400',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        )
    },
    error: {
        bg: 'bg-red-500/90',
        border: 'border-red-400',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        )
    },
    warning: {
        bg: 'bg-amber-500/90',
        border: 'border-amber-400',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        )
    },
    info: {
        bg: 'bg-blue-500/90',
        border: 'border-blue-400',
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
};

function ToastItem({ toast }: { toast: ToastType }) {
    const removeToast = useToastStore((state) => state.removeToast);
    const style = toastStyles[toast.type];

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`${style.bg} backdrop-blur-sm border ${style.border} rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 min-w-[300px] max-w-[400px]`}
        >
            <span className="text-white flex-shrink-0">{style.icon}</span>
            <p className="text-white text-sm font-medium flex-1">{toast.message}</p>
            <button
                onClick={() => removeToast(toast.id)}
                className="text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
}

export default function ToastContainer() {
    const toasts = useToastStore((state) => state.toasts);

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} />
                ))}
            </AnimatePresence>
        </div>
    );
}
