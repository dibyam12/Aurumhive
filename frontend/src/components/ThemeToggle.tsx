import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    // State purely for UI (icon) sync. Initial value comes from the DOM if possible.
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        // 1. Initialize from storage on mount (idempotent check)
        // We only do this once to ensure user preference is respected on reload.
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // If local storage says dark OR (no local storage and system prefers dark)
        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            if (!document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.add('dark');
            }
        } else {
            // Default to light
            if (savedTheme === 'light' && document.documentElement.classList.contains('dark')) {
                document.documentElement.classList.remove('dark');
            }
        }

        // 2. Observer to sync icon with global class changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const isDark = document.documentElement.classList.contains('dark');
                    setTheme(isDark ? 'dark' : 'light');
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = () => {
        // Always check REALITY (DOM), not state, to prevent desync
        const isCurrentlyDark = document.documentElement.classList.contains('dark');
        const newTheme = isCurrentlyDark ? 'light' : 'dark';

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        localStorage.setItem('theme', newTheme);
        // State will update via Observer automatically.
    };

    return (
        <button
            onClick={toggleTheme}
            className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-off-white text-text border border-border hover:border-primary hover:text-primary transition-colors duration-200 cursor-pointer shadow-sm"
            aria-label="Toggle Dark Mode"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
            <div className="relative w-5 h-5">
                {/* Sun Icon - Show when Dark (to switch to Light) */}
                <svg
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                </svg>

                {/* Moon Icon - Show when Light (to switch to Dark) */}
                <svg
                    className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-100'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                </svg>
            </div>
        </button>
    );
}
