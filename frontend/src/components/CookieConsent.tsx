import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || '';

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const storedConsent = localStorage.getItem('cookieConsent');

        if (storedConsent) {
            try {
                const { expiry } = JSON.parse(storedConsent);
                const now = new Date().getTime();

                // If cookie has expired (older than 1 day), clear it and show popup
                if (now > expiry) {
                    localStorage.removeItem('cookieConsent');
                    setTimeout(() => setIsVisible(true), 1500);
                }
            } catch (e) {
                // If parsing fails (old format), clear and reset
                localStorage.removeItem('cookieConsent');
                setTimeout(() => setIsVisible(true), 1500);
            }
        } else {
            // No consent found, show popup
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const setConsentWithExpiry = (value: string) => {
        const now = new Date();
        // Set expiry for 1 day (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
        const expiryTime = now.getTime() + 24 * 60 * 60 * 1000;

        const consentData = {
            value: value,
            expiry: expiryTime
        };

        localStorage.setItem('cookieConsent', JSON.stringify(consentData));
        setIsVisible(false);
    };

    const handleAccept = async () => {
        setConsentWithExpiry('accepted');
        // Track visitor consent in backend
        try {
            await fetch(`${API_URL}/api/visitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent_type: 'accepted' })
            });
        } catch (err) {
            console.error('Failed to track consent:', err);
        }
    };

    const handleReject = async () => {
        setConsentWithExpiry('rejected');
        // Track rejection in backend too
        try {
            await fetch(`${API_URL}/api/visitors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consent_type: 'rejected' })
            });
        } catch (err) {
            console.error('Failed to track consent:', err);
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="fixed bottom-6 left-6 max-w-[400px] w-[calc(100%-48px)] bg-white/90 backdrop-blur-md border border-white/50 shadow-glass p-6 rounded-2xl z-[1001] flex flex-col gap-4"
                >
                    <button
                        onClick={() => setIsVisible(false)}
                        aria-label="Close"
                        className="absolute top-3 right-3 bg-transparent border-none cursor-pointer text-secondary flex items-center justify-center p-1 rounded-full transition-colors duration-200 hover:bg-black/5"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>

                    <div>
                        <h4 className="text-lg mb-2 text-text font-brand">
                            We Value Your Privacy
                        </h4>
                        <p className="text-sm text-secondary leading-normal">
                            We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleAccept}
                            className="btn-primary flex-1 !py-2.5 !text-sm"
                        >
                            Accept All
                        </button>
                        <button
                            onClick={handleReject}
                            className="flex-1 py-2.5 px-5 text-sm rounded-lg border border-border bg-transparent cursor-pointer font-primary font-semibold text-text hover:bg-border hover:text-primary transition-colors"
                        >
                            Reject
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
