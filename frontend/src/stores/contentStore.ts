import { create } from 'zustand';
import * as staticData from '../data';

const API_URL = import.meta.env.VITE_API_URL || '';

// Composite static content for fallback
const fallbackContent = {
    siteMeta: staticData.siteMeta,
    navLinks: staticData.navLinks,
    heroContent: staticData.heroContent,
    services: staticData.services,
    contactCopy: staticData.contactCopy,
    footerLinks: staticData.footerLinks,
    aboutSection: staticData.aboutSection,
    processSteps: staticData.processSteps,
    techStackGroups: staticData.techStackGroups,
    testimonials: staticData.testimonials,
    careersContent: staticData.careersContent,
    lifeAtAurumhive: staticData.lifeAtAurumhive,
    aurumhiveValues: staticData.aurumhiveValues,
};

interface ContentState {
    content: Record<string, any>;
    isLoading: boolean;
    error: string | null;
    lastFetched: number | null;

    fetchContent: () => Promise<void>;
    getSection: <T>(key: string) => T | null;
}

export const useContentStore = create<ContentState>((set, get) => ({
    content: fallbackContent, // Initialize with fallback content
    isLoading: false,
    error: null,
    lastFetched: null,

    fetchContent: async () => {
        // Don't refetch if we have recent data (within 5 minutes)
        const now = Date.now();
        const lastFetched = get().lastFetched;
        if (lastFetched && now - lastFetched < 5 * 60 * 1000 && Object.keys(get().content).length > 0) {
            return;
        }

        set({ isLoading: true, error: null });

        try {
            const response = await fetch(`${API_URL}/api/content`);

            if (!response.ok) {
                throw new Error('Failed to fetch content');
            }

            const data = await response.json();
            const fetchedContent = data.data && Object.keys(data.data).length > 0 ? data.data : fallbackContent;
            
            set({
                content: fetchedContent,
                isLoading: false,
                lastFetched: now
            });
        } catch (error) {
            set({
                content: fallbackContent, // Use fallback on error
                error: error instanceof Error ? error.message : 'Failed to fetch content',
                isLoading: false
            });
        }
    },

    getSection: <T>(key: string): T | null => {
        return (get().content[key] as T) || (fallbackContent[key as keyof typeof fallbackContent] as unknown as T) || null;
    }
}));
