// src/components/Navbar.tsx
import { useState, useEffect } from "react";
import ThemeToggle from "./ThemeToggle";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigationStore } from "../stores/navigationStore";
import { useContentStore } from "../stores/contentStore";

function scrollToHash(hash: string | null) {
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Get navigation from store
    const { navLinks, fetchNavigation } = useNavigationStore();
    const { content } = useContentStore();
    const siteMeta = content.siteMeta || { name: 'AURUMHIVE' };

    // Fetch navigation on mount
    useEffect(() => {
        if (navLinks.length === 0) {
            fetchNavigation();
        }
    }, [navLinks.length, fetchNavigation]);

    const handleNavClick = (path: string, hash?: string | null) => {
        setIsMenuOpen(false);
        if (path === "/" && hash) {
            // Navigate to home and scroll to section
            if (location.pathname !== "/") {
                navigate("/", { replace: false });
                setTimeout(() => scrollToHash(hash), 100);
            } else {
                scrollToHash(hash);
            }
        } else if (path === "/") {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate(path);
        }
    };

    const handleContactClick = () => {
        handleNavClick("/", "contact");
    };

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[1000px] bg-white/30 dark:bg-off-white/10 backdrop-blur-2xl border border-white/20 dark:border-white/10 shadow-glass rounded-3xl z-[1000] transition-all duration-300">
            <div className="flex justify-between items-center px-6 py-3">
                <button
                    onClick={() => handleNavClick("/", null)}
                    className="text-2xl font-brand font-bold bg-gradient-text bg-clip-text text-transparent animate-gradient cursor-pointer border-none bg-transparent p-0"
                >
                    {siteMeta.name}
                </button>

                {/* Desktop Menu */}
                <div className="hidden md:flex gap-8 items-center">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => handleNavClick(link.path, link.hash)}
                            className="font-primary font-medium text-text hover:text-primary transition-colors no-underline bg-transparent border-none cursor-pointer"
                        >
                            {link.name}
                        </button>
                    ))}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={handleContactClick}
                            className="btn-primary rounded-full !py-2 !px-6 bg-gradient-primary shadow-md hover:shadow-lg"
                        >
                            CONTACT
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Toggle */}
                <div className="flex md:hidden items-center gap-4">
                    <ThemeToggle />
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-text hover:text-primary transition-colors bg-transparent border-none p-1"
                        aria-label="Toggle Menu"
                    >
                        {isMenuOpen ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="md:hidden overflow-hidden border-t border-white/10"
                    >
                        <div className="flex flex-col p-6 gap-4 items-center bg-white/5 dark:bg-black/5">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleNavClick(link.path, link.hash)}
                                    className="font-primary font-medium text-lg text-text hover:text-primary transition-colors bg-transparent border-none cursor-pointer w-full text-center"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <button
                                onClick={handleContactClick}
                                className="btn-primary rounded-full w-full !py-3 bg-gradient-primary shadow-md"
                            >
                                CONTACT
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
