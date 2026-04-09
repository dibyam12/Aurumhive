import { create } from 'zustand';
import { openJobs } from '../data';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface Career {
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

    fetchCareers: () => Promise<void>;
}

export const useCareersStore = create<CareersState>((set, get) => ({
    careers: [],
    isLoading: false,
    error: null,

    fetchCareers: async () => {
        // Don't refetch if we already have careers
        if (get().careers.length > 0) return;

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/careers`);

            if (!response.ok) {
                throw new Error('Failed to fetch careers');
            }

            const data = await response.json();
            set({ careers: data.data && data.data.length > 0 ? data.data : (openJobs as unknown as Career[]), isLoading: false });
        } catch (error) {
            set({
                careers: openJobs as unknown as Career[],
                error: error instanceof Error ? error.message : 'Failed to fetch careers',
                isLoading: false
            });
        }
    }
}));
