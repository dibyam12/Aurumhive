import { create } from 'zustand';
import { useAuthStore } from './authStore';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Contact {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    is_archived?: boolean;
    created_at: string;
}

interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

interface ContactsState {
    contacts: Contact[];
    pagination: Pagination | null;
    selectedContact: Contact | null;
    isLoading: boolean;
    error: string | null;

    fetchContacts: (page?: number, unreadOnly?: boolean) => Promise<void>;
    getContact: (id: number) => Promise<void>;
    markAsRead: (id: number) => Promise<boolean>;
    archiveContact: (id: number) => Promise<boolean>;
    deleteContact: (id: number) => Promise<boolean>;
    clearSelectedContact: () => void;
}

export const useContactsStore = create<ContactsState>((set, get) => ({
    contacts: [],
    pagination: null,
    selectedContact: null,
    isLoading: false,
    error: null,

    fetchContacts: async (page = 1, unreadOnly = false) => {
        set({ isLoading: true, error: null });

        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(
                `${API_URL}/api/contact?page=${page}&limit=20&unread_only=${unreadOnly}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to fetch contacts');
            }

            const data = await response.json();
            set({
                contacts: data.data,
                pagination: data.pagination,
                isLoading: false
            });
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : 'Failed to fetch contacts',
                isLoading: false
            });
        }
    },

    getContact: async (id) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/contact/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch contact');
            }

            const data = await response.json();
            set({ selectedContact: data.data });
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to fetch contact' });
        }
    },

    markAsRead: async (id) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/contact/${id}/read`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to mark as read');
            }

            // Update local state
            set(state => ({
                contacts: state.contacts.map(c =>
                    c.id === id ? { ...c, is_read: true } : c
                )
            }));

            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to mark as read' });
            return false;
        }
    },

    archiveContact: async (id) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/contact/${id}/archive`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to archive');
            }

            // Remove from local state
            set(state => ({
                contacts: state.contacts.filter(c => c.id !== id)
            }));

            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to archive' });
            return false;
        }
    },

    deleteContact: async (id) => {
        try {
            const token = useAuthStore.getState().accessToken;
            const response = await fetch(`${API_URL}/api/contact/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            set(state => ({
                contacts: state.contacts.filter(c => c.id !== id)
            }));

            return true;
        } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to delete' });
            return false;
        }
    },

    clearSelectedContact: () => set({ selectedContact: null })
}));
