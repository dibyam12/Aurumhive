import { useRef, useState, useEffect } from 'react';
import { useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useContentStore } from '../stores/contentStore';
import { footerLinks as staticFooterLinks, siteMeta as staticSiteMeta, contactCopy as staticContact } from '../data';
import ThemeToggle from './ThemeToggle';

export default function Footer() {
    const { content } = useContentStore();
    const siteMeta = content.siteMeta || staticSiteMeta;
    const footerLinks = content.footerLinks || staticFooterLinks;
    const contactCopy = content.contactCopy || staticContact;

    const currentYear = new Date().getFullYear();
    const containerRef = useRef<HTMLDivElement>(null);
    const windowWidth = useWindowWidth();

    // Scroll Physics
    const { scrollY } = useScroll();
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });
    const velocityFactor = useTransform(smoothVelocity, [-1000, 0, 1000], [-5, 0, 5], {
        clamp: false
    });

    // We want the delta to drive force.

    const physicsWobble = useSpring(velocityFactor, {
        stiffness: 200,
        damping: 8,
        mass: 0.5
    });

    const [path, setPath] = useState("");

    useEffect(() => {
        // Animation loop to update path based on physics value
        const unsubscribe = physicsWobble.on("change", (latest) => {
            if (containerRef.current) {
                const width = windowWidth || window.innerWidth;
                // Base height of the curve peak usually 0 relative to the start line
                // The "start line" of the footer block is essentially 100px from top of SVG
                // SVG height is 150px approx?

                // Let's define the top straight line y = 50.
                // Control point varies around 50.

                // Standard: M0,50 Q{width/2},{50 + latest} {width},50 ...

                const base = 50;

                // Limit typical wobble
                const curve = latest * 50; // Scale velocity factor to pixels

                const newPath = `
M0, ${base} 
                    Q${width / 2},${base + curve} ${width},${base} 
                    L${width}, 500
L0, 500
Z
                `;
                setPath(newPath);
            }
        });
        return () => unsubscribe();
    }, [physicsWobble, windowWidth]);

    return (
        <footer
            ref={containerRef}
            className="relative text-white pt-24 pb-14 px-10 text-center font-primary w-full"
            style={{ background: 'transparent' }} // Handled by SVG
        >
            {/* Liquid Background SVG */}
            <div className="absolute top-[-50px] left-0 w-full h-[calc(100%+50px)] -z-10 overflow-visible pointer-events-none">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="footer-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#FF9966" />
                            <stop offset="50%" stopColor="#FF5E62" />
                            <stop offset="100%" stopColor="#DAA520" />
                        </linearGradient>
                    </defs>
                    <path
                        d={path || `M0, 50 Q100, 50 200, 50 L200, 500 L0, 500 Z`}
                        fill="url(#footer-grad)"
                    />
                </svg>
            </div>

            {/* Gradient Overlay (Optional - simplified as CSS inside container matching shape is hard) */}
            <div
                className="absolute inset-0 top-[50px] opacity-0 dark:opacity-0 transition-opacity duration-300 pointer-events-none -z-[5]"
                style={{
                    background: "transparent",
                }}
            />

            <div className="relative z-10">
                <h2 className="font-brand text-2xl text-white mb-4">{siteMeta.name}</h2>
                <p className="opacity-70 text-sm">
                    &copy; {siteMeta.year} {siteMeta.name}. All rights reserved.
                </p>
                <p className="opacity-70 mb-6 text-sm">
                    Designed and Developed by{" "}
                    <a
                        href="https://dibyam-portfolio.netlify.app/"
                        target="_blank" rel="noopener noreferrer"
                        className="text-white hover:underline transition-colors no-underline"
                    >
                        {siteMeta.owner}
                    </a>
                    .
                </p>
                <div className="flex justify-center gap-6">
                    {footerLinks.map(link => (
                        <a
                            key={link.label}
                            href={link.href}
                            className="text-white hover:underline transition-colors no-underline"
                            target="_blank" rel="noopener noreferrer"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

// Hook for window width
function useWindowWidth() {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);
    useEffect(() => {
        const handleResize = () => setWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return width;
}


