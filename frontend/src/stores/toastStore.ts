import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

interface ToastState {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
    clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],

    addToast: (message: string, type: ToastType = 'info', duration: number = 4000) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        set((state) => ({
            toasts: [...state.toasts, { id, message, type, duration }]
        }));

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },

    removeToast: (id: string) => {
        set((state) => ({
            toasts: state.toasts.filter((toast) => toast.id !== id)
        }));
    },

    clearAll: () => {
        set({ toasts: [] });
    }
}));

// Convenience functions
export const toast = {
    success: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'success', duration),
    error: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'error', duration),
    info: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'info', duration),
    warning: (message: string, duration?: number) =>
        useToastStore.getState().addToast(message, 'warning', duration),
};
