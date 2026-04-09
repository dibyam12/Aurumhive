import { create } from 'zustand';
import { useContentStore } from './contentStore';
import { navLinks as staticNavLinks } from '../data';

export interface NavLink {
    name: string;
    path: string;
    hash?: string | null;
}

interface NavigationState {
    navLinks: NavLink[];
    isLoading: boolean;

    fetchNavigation: () => Promise<void>;
    getRoutes: () => NavLink[];
}

// Map page names to their route paths (lowercase, hyphenated)
const generatePath = (name: string): string => {
    if (name.toLowerCase() === 'home') return '/';
    return '/' + name.toLowerCase().replace(/\s+/g, '-');
};

export const useNavigationStore = create<NavigationState>((set, get) => ({
    navLinks: [],
    isLoading: false,

    fetchNavigation: async () => {
        set({ isLoading: true });

        // First ensure content is fetched
        await useContentStore.getState().fetchContent();

        const content = useContentStore.getState().content;
        const navLinksData = (content.navLinks && content.navLinks.length > 0) ? content.navLinks : staticNavLinks;

        // Process nav links - handle both {label, href, hash} and {name, path} formats
        const processedLinks: NavLink[] = navLinksData.map((link: any) => {
            // Handle the database format: {label, href, hash}
            if (link.label) {
                return {
                    name: link.label,
                    path: link.href || generatePath(link.label),
                    hash: link.hash || null
                };
            }
            // Handle simple format: {name, path}
            return {
                name: link.name || link,
                path: link.path || generatePath(link.name || link),
                hash: link.hash || null
            };
        });

        set({ navLinks: processedLinks, isLoading: false });
    },

    getRoutes: () => {
        return get().navLinks;
    }
}));
