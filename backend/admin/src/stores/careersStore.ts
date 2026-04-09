import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Career {
    id: number;
    title: string;
    location: string;
    type: string;
    level: string;
    description: string;
    responsibilities: string[];
    requirements: string[];
    is_active: boolean;
    created_at: string;
}

interface CareersState {
    careers: Career[];
    isLoading: boolean;
    error: string | null;

    fetchCareers: (includeInactive?: boolean) => Promise<void>;
    createCareer: (career: Omit<Career, 'id' | 'created_at'>) => Promise<boolean>;
    updateCareer: (id: number, career: Partial<Career>) => Promise<boolean>;
    deleteCareer: (id: number) => Promise<boolean>;
}

export const useCareersStore = create<CareersState>((set, get) => ({
    careers: [],
    isLoading: false,
    error: null,

    fetchCareers: async (includeInactive = true) => {
        set({ isLoading: true, error: null });

        try {
            const response = await fetch(
                `${API_URL}/api/careers?include_inactive=${includeInactive}`
            );

            if (!response.ok) {
                throw new Error('Failed to fetch careers');
            }

            const data = await response.json();
            set({ careers: data.data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch careers',
                isLoading: false
            });
        }
    },

    createCareer: async (career) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/careers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(career)
            });

            if (!response.ok) {
                throw new Error('Failed to create career');
            }

            await get().fetchCareers();
            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to create career' });
            return false;
        }
    },

    updateCareer: async (id, career) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/careers/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(career)
            });

            if (!response.ok) {
                throw new Error('Failed to update career');
            }

            await get().fetchCareers();
            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to update career' });
            return false;
        }
    },

    deleteCareer: async (id) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/careers/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete career');
            }

            await get().fetchCareers();
            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete career' });
            return false;
        }
    }
}));
