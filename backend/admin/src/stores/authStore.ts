import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const API_URL = import.meta.env.VITE_API_URL || '';

export interface User {
    id: number;
    username: string;
    email: string | null;
    role?: string;
    created_at?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<boolean>;
    checkAuth: () => Promise<void>;
    clearError: () => void;

    // User management
    updateProfile: (userData: Partial<User>) => Promise<boolean>;
    changePassword: (password: string) => Promise<boolean>;
    createUser: (user: { username: string; password: string; email?: string; role?: string }) => Promise<boolean>;
    getUsers: () => Promise<User[]>;
    deleteUser: (id: number) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (username, password) => {
                set({ isLoading: true, error: null });

                try {
                    const response = await fetch(`${API_URL}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ username, password })
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        set({
                            isLoading: false,
                            error: data.message || 'Login failed'
                        });
                        return false;
                    }

                    set({
                        user: data.user,
                        accessToken: data.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    return true;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: 'Network error. Please try again.'
                    });
                    return false;
                }
            },

            logout: async () => {
                try {
                    await fetch(`${API_URL}/api/auth/logout`, {
                        method: 'POST',
                        credentials: 'include'
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }

                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    error: null
                });
            },

            refreshToken: async () => {
                try {
                    const response = await fetch(`${API_URL}/api/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        get().logout();
                        return false;
                    }

                    const data = await response.json();
                    set({ accessToken: data.accessToken });
                    return true;
                } catch (error) {
                    get().logout();
                    return false;
                }
            },

            checkAuth: async () => {
                const { accessToken, refreshToken } = get();

                if (!accessToken) {
                    // Try to refresh
                    const refreshed = await refreshToken();
                    if (!refreshed) {
                        set({ isAuthenticated: false });
                    }
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/api/auth/me`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (!response.ok) {
                        const refreshed = await refreshToken();
                        if (!refreshed) {
                            set({ isAuthenticated: false, user: null, accessToken: null });
                        }
                        return;
                    }

                    const data = await response.json();
                    set({ user: data.user, isAuthenticated: true });
                } catch (error) {
                    set({ isAuthenticated: false });
                }
            },

            // User Management methods
            updateProfile: async (userData) => {
                set({ isLoading: true });
                try {
                    const accessToken = get().accessToken;
                    const response = await fetch(`${API_URL}/api/users/profile`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) throw new Error('Failed to update profile');

                    const data = await response.json();
                    set({ user: { ...get().user, ...data.user } as User, isLoading: false });
                    return true;
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to update profile' });
                    return false;
                }
            },

            changePassword: async (password) => {
                set({ isLoading: true });
                try {
                    const accessToken = get().accessToken;
                    const response = await fetch(`${API_URL}/api/users/password`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ password })
                    });

                    if (!response.ok) throw new Error('Failed to change password');

                    set({ isLoading: false });
                    return true;
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to change password' });
                    return false;
                }
            },

            createUser: async (userData) => {
                set({ isLoading: true });
                try {
                    const accessToken = get().accessToken;
                    const response = await fetch(`${API_URL}/api/users`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(userData)
                    });

                    if (!response.ok) throw new Error('Failed to create user');

                    set({ isLoading: false });
                    return true;
                } catch (error) {
                    set({ isLoading: false, error: 'Failed to create user' });
                    return false;
                }
            },

            getUsers: async () => {
                try {
                    const accessToken = get().accessToken;
                    const response = await fetch(`${API_URL}/api/users`, {
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    if (!response.ok) return [];
                    const data = await response.json();
                    return data.users || [];
                } catch (error) {
                    return [];
                }
            },

            deleteUser: async (id) => {
                try {
                    const accessToken = get().accessToken;
                    const response = await fetch(`${API_URL}/api/users/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    });

                    return response.ok;
                } catch (error) {
                    return false;
                }
            },

            clearError: () => set({ error: null })
        }),
        {
            name: 'aurumhive-auth',
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user,
                isAuthenticated: state.isAuthenticated
            })
        }
    )
);
