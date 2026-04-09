import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

interface StatsOverview {
    totalVisitors: number;
    unreadContacts: number;
    totalContacts: number;
    activeJobs: number;
}

interface VisitorsByDay {
    date: string;
    count: number;
}

interface VisitorsByCountry {
    country: string;
    country_code: string;
    count: number;
}

interface StatsData {
    overview: StatsOverview;
    visitorsByDay: VisitorsByDay[];
    visitorsByCountry: VisitorsByCountry[];
    visitorsByCity: Array<{ city: string; region: string; country: string; count: number }>;
    consentStats: Array<{ consent_type: string; count: number }>;
    recentVisitors: Array<{
        ip_address: string;
        city: string;
        region: string;
        country: string;
        consent_type: string;
        created_at: string;
    }>;
    period: string;
}

interface StatsState {
    stats: StatsData | null;
    isLoading: boolean;
    error: string | null;

    fetchStats: (days?: number) => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
    stats: null,
    isLoading: false,
    error: null,

    fetchStats: async (days = 30) => {
        set({ isLoading: true, error: null });

        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/stats?days=${days}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            set({ stats: data.data, isLoading: false });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch stats',
                isLoading: false
            });
        }
    }
}));
