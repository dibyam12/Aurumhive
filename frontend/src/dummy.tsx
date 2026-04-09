import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import SimpleNavbar from './SimpleNavbar';
import { heroContent } from '../data';

interface SplitHeroProps {
    children: React.ReactNode;
}

export default function SplitHero({ children }: SplitHeroProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    // Global scroll for locking logic
    const { scrollY } = useScroll();

    // Calculate 150vh in pixels for the threshold
    // We use a safe fallback for SSR, then update on mount/resize effectively via the hook
    const threshold = typeof window !== 'undefined' ? window.innerHeight * 1.5 : 1000;

    // Transform scroll pixels to separation distance
    // Using absolute pixels prevents jumps when container height changes
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

    return (
        <div ref={containerRef} className="relative min-h-[300vh]">

            {/* Ghost Track / Spacer */}
            <div className="h-[150vh] absolute top-0 w-px pointer-events-none" />

            {/* Sticky Container for the Doors */}
            <div className="sticky top-0 h-screen overflow-hidden z-50 pointer-events-none">
                {/* Top Panel */}
                <motion.div
                    style={{ y: yTop }}
                    className="absolute top-0 left-0 w-full h-1/2 bg-white z-20 overflow-hidden pointer-events-auto"
                >
                    <div className="w-full h-[200%] absolute z-[100] top-0 left-0">
                        <HeroContentUp />
                    </div>
                </motion.div>

                {/* Bottom Panel */}
                <motion.div
                    style={{ y: yBottom }}
                    className="absolute bottom-0 left-0 w-full h-1/2 bg-white z-20 overflow-hidden pointer-events-auto"
                >
                    <div className="w-full h-[200%] absolute bottom-0 left-0">
                        <HeroContentDown />
                    </div>
                </motion.div>
            </div>

            {/* The Main Content */}
            <div
                style={{ position: isLocked ? 'fixed' : 'relative', marginTop: isLocked ? 0 : '50vh' }}
                className="top-0 left-0 w-full z-10 pt-0"
            >
                <div className="bg-white pt-[110px] min-h-screen">
                    {children}
                </div>
            </div>

            {/* If locked, we need a spacer to maintain the page height so we can actually scroll 150vh! */}
            {isLocked && <div className="h-screen" />}

        </div>
    );
}

// Reusable Hero Content to ensure perfect alignment across split
// Reusable Hero Content to ensure perfect alignment across split
function HeroContentUp() {
    return (
        <div className="relative h-screen w-screen pt-0 pb-[50vh] flex flex-col justify-end items-center bg-white text-text p-10 min-h-[80vh]">
            <div className="absolute top-[-30%] left-[-10%] w-[70%] h-[70%] bg-gradient-primary blur-[120px] opacity-25 rounded-full -z-10 animate-pulse" />
            <SimpleNavbar />
            <h1 className="text-[clamp(48px,7vw,96px)] m-0 pb-5 font-brand font-bold bg-gradient-text bg-clip-text text-transparent leading-tight text-center animate-gradient">
                {heroContent.headline}
            </h1>
        </div>
    );
}

function HeroContentDown() {
    return (
        <div className="relative h-screen w-screen pt-[50vh] flex flex-col justify-start items-center bg-white text-text px-10">
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-primary blur-[120px] opacity-20 rounded-full -z-10 animate-pulse" />
            <p className="font-primary text-xl md:text-2xl mt-4 text-secondary max-w-[640px] leading-relaxed text-center mt-[5%]">
                {heroContent.subtext}
            </p>
            {/* buttons kept commented out */}
            {/*
      <div className="flex gap-4 mt-6">
        ...
      </div>
      */}
        </div>
    );
}

{/* <div className="flex gap-4">
                <a href={heroContent.primaryCta.href}>
                    <button className="btn-primary rounded-full">
                        {heroContent.primaryCta.label}
                    </button>
                </a>
                <a href={heroContent.secondaryCta.href}>
                    <button className="btn-secondary rounded-full bg-transparent border-2 border-border hover:border-primary hover:text-primary">
                        {heroContent.secondaryCta.label}
                    </button>
                </a>
            </div> */}