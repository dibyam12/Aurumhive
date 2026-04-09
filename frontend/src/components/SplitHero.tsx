import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import SimpleNavbar from './SimpleNavbar';
import { useContentStore } from '../stores/contentStore';
import Skeleton from './ui/Skeleton';

interface SplitHeroProps {
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export default function SplitHero({ children, footer }: SplitHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const [footerHeight, setFooterHeight] = useState(0);

    // Global scroll for locking logic
    const { scrollY } = useScroll();

    // Calculate 150vh in pixels for the threshold
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 1000;

    // Transform scroll pixels to separation distance
    const yTop = useTransform(scrollY, [0, threshold], ['0%', '-100%']);
    const yBottom = useTransform(scrollY, [0, threshold], ['0%', '100%']);

    // State to track if we are in the "opening" phase
    const [isLocked, setIsLocked] = useState(true);
    const scrollThreshold = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 1000;

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest < scrollThreshold && !isLocked) {
            setIsLocked(true);
        } else if (latest >= scrollThreshold && isLocked) {
            setIsLocked(false);
        }
    });

    // Measure footer height for reveal effect
    useEffect(() => {
        if (!footerRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setFooterHeight(entry.contentRect.height);
            }
        });

        resizeObserver.observe(footerRef.current);
        return () => resizeObserver.disconnect();
    }, [footer]);

    return (
        <div ref={containerRef} className="relative min-h-[300vh]">

            {/* Ghost Track / Spacer */}
            <div className="h-[150vh] absolute top-0 w-px pointer-events-none" />

            {/* Sticky Container for the Doors */}
            <div className="sticky top-0 h-screen overflow-hidden z-50 pointer-events-none">
                {/* Top Panel */}
                <motion.div
                    style={{
                        y: yTop,
                        background: 'var(--bg-page-gradient)',
                        backgroundSize: '100% 200%',
                        backgroundPosition: 'top center'
                    }}
                    className="absolute top-0 left-0 w-full h-1/2 z-20 overflow-hidden pointer-events-auto"
                >
                    <div className="w-full h-[200%] absolute z-[100] top-0 left-0">
                        <HeroContentUp />
                    </div>
                </motion.div>

                {/* Bottom Panel */}
                <motion.div
                    style={{
                        y: yBottom,
                        background: 'var(--bg-page-gradient)',
                        backgroundSize: '100% 200%',
                        backgroundPosition: 'bottom center'
                    }}
                    className="absolute bottom-0 left-0 w-full h-1/2 z-20 overflow-hidden pointer-events-auto"
                >
                    <div className="w-full h-[200%] absolute bottom-0 left-0">
                        <HeroContentDown />
                    </div>
                </motion.div>
            </div>

            {/* The Main Content */}
            <div
                style={{
                    position: isLocked ? 'fixed' : 'relative',
                    marginTop: isLocked ? 0 : '50vh',
                    marginBottom: isLocked ? 0 : footerHeight
                }}
                className="top-0 left-0 w-full z-10 pt-0"
            >
                <div className="pt-[110px] min-h-screen shadow-2xl bg-white dark:bg-off-white" style={{ background: 'var(--bg-page-gradient)' }}>
                    {children}
                </div>
            </div>

            {/* Sticky Reveal Footer */}
            {footer && (
                <div
                    ref={footerRef}
                    className="fixed bottom-0 left-0 w-full z-0"
                    style={{ visibility: isLocked ? 'hidden' : 'visible' }}
                >
                    {footer}
                </div>
            )}

            {/* If locked, we need a spacer to maintain the page height */}
            {isLocked && <div className="h-screen" />}

        </div>
    );
}

// Logo Component
function LogoHeader() {
    return (
        <div className="absolute top-9 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center gap-2 md:gap-4 z-30 w-full justify-center px-4">
            <img
                src="/images/logo_1.png"
                alt="AURUMHIVE"
                className="w-10 h-10 md:w-16 md:h-16 object-contain drop-shadow-lg"
                onError={(e) => {
                    // Fallback if image fails
                    e.currentTarget.style.display = 'none';
                }}
            />
            <span className=" cursor-pointer font-brand font-bold text-xl md:text-4xl tracking-[0.2em] bg-gradient-text bg-clip-text text-transparent animate-gradient drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] whitespace-nowrap">
                AURUMHIVE
            </span>
        </div>
    );
}

// Hero Content - Top Half
function HeroContentUp() {
    const { content, isLoading } = useContentStore();
    const heroContent = content.heroContent || {};

    return (
        <div className="relative h-screen w-screen pt-0 pb-[50vh] flex flex-col justify-end items-center text-text p-10 min-h-[80vh]">
            <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-gradient-primary blur-[120px] opacity-25 rounded-full -z-10 animate-pulse" />

            {/* <SimpleNavbar /> */}
            <LogoHeader />

            {isLoading ? (
                <div className="flex flex-col items-center gap-4">
                    <Skeleton width="80%" height="4rem" className="max-w-[600px]" />
                </div>
            ) : (
                <h1 className="text-[clamp(36px,7vw,96px)] m-0 pb-5 font-brand font-bold bg-gradient-text bg-clip-text text-transparent leading-tight text-center animate-gradient">
                    {heroContent.titleTop || 'Turning Ideas Into'}<br />
                </h1>
            )}
        </div>
    );
}

// Hero Content - Bottom Half
function HeroContentDown() {
    const { content, isLoading } = useContentStore();
    const heroContent = content.heroContent || {};

    return (
        <div className="relative h-screen w-screen pt-[50vh] flex flex-col justify-start items-center text-text p-10 min-h-[80vh]">
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-primary blur-[120px] opacity-20 rounded-full -z-10 animate-pulse" />

            {isLoading ? (
                <div className="flex flex-col items-center gap-6">
                    <Skeleton width="60%" height="4rem" className="max-w-[400px]" />
                    <div className="space-y-3 max-w-[600px] w-full">
                        <Skeleton width="100%" height="1.25rem" />
                        <Skeleton width="90%" height="1.25rem" />
                        <Skeleton width="70%" height="1.25rem" />
                    </div>
                </div>
            ) : (
                <>
                    <h1 className="text-[clamp(36px,7vw,96px)] m-0 pb-5 font-brand font-bold bg-gradient-text bg-clip-text text-transparent leading-tight text-center animate-gradient">
                        {heroContent.titleBottom || 'Digital Gold'}
                    </h1>
                    <p className="font-primary text-xl mb-8 mt-8 text-secondary max-w-[600px] leading-relaxed text-center">
                        {heroContent.subtitle || 'Build, automate, and scale your business with AURUMHIVE. We provide premium digital solutions tailored to your unique needs.'}
                    </p>
                </>
            )}

            <motion.div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.5 }}
            >
                <span className="text-secondary text-sm">Scroll to explore</span>
                <motion.div
                    animate={{ y: [0, 8, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-6 h-6 border-2 border-primary rounded-full flex items-center justify-center"
                >
                    <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                </motion.div>
            </motion.div>

        </div>
    );
}
