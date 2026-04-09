import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ContentState {
    content: Record<string, any>;
    isLoading: boolean;
    isSaving: boolean;
    error: string | null;
    lastUpdated: string | null;

    fetchContent: () => Promise<void>;
    updateSection: (key: string, data: any) => Promise<boolean>;
    getSection: (key: string) => any;
}

export const useContentStore = create<ContentState>((set, get) => ({
    content: {},
    isLoading: false,
    isSaving: false,
    error: null,
    lastUpdated: null,

    fetchContent: async () => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/content`);

            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }

            const data = await response.json();
            set({
                content: data.data,
                isLoading: false,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch content',
                isLoading: false
            });
        }
    },

    updateSection: async (key, data) => {
        set({ isSaving: true, error: null });

        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/content/${key}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content: data })
            });

            if (!response.ok) {
                throw new Error('Failed to update content');
            }

            // Update local state
            set(state => ({
                content: { ...state.content, [key]: data },
                isSaving: false,
                lastUpdated: new Date().toISOString()
            }));

            return true;
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to update content',
                isSaving: false
            });
            return false;
        }
    },

    getSection: (key) => {
        return get().content[key] || null;
    }
}));
