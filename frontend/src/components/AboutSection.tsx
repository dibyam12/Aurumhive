import { useRef, useState, useEffect } from 'react';
import { motion, useInView, useScroll, useMotionValueEvent, useMotionValue, useTransform, animate } from 'framer-motion';
import { useContentStore } from '../stores/contentStore';
import { aboutSection } from "../data";
import ScrollFloat from './ScrollFloat';

export default function AboutSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { amount: 0.2 });

    const { scrollY } = useScroll();
    const [isGateOpen, setIsGateOpen] = useState(false);
    const { content: storeContent } = useContentStore();
    const content = storeContent.aboutSection || aboutSection;

    // Logic to sync with SplitHero: Gate is fully open at 1.5 * vh.
    // We want to trigger when it is 90% open.
    const updateGateStatus = (latest: number) => {
        if (typeof window === 'undefined') return;
        const threshold = window.innerHeight * 1.5 * 0.9;
        setIsGateOpen(latest > threshold);
    };

    // Initial check on mount
    useEffect(() => {
        updateGateStatus(scrollY.get());
    }, []);

    useMotionValueEvent(scrollY, "change", (latest) => {
        updateGateStatus(latest);
    });

    const shouldShow = isGateOpen && isInView;

    return (
        <motion.section
            ref={ref}
            id="about"
            className="w-full min-h-screen py-20 "
            initial={{ opacity: 0, y: 50 }}
            animate={shouldShow ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 0.8, ease: [0.21, 0.45, 0.15, 1.00] }}
        >
            {/* Main Content Grid */}
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center ">
                <div>
                    <h1 className="font-brand text-3xl md:text-5xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                        {content.heading}
                    </h1>
                    {/* <ScrollFloat
                        containerClassName="font-brand text-3xl md:text-5xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient"
                        textClassName="font-brand text-3xl md:text-5xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient"
                        animationDuration={1}
                        ease="back.inOut(2)"
                        scrollStart="center bottom+=50%"
                        scrollEnd="bottom bottom-=40%"
                        stagger={0.03}
                    >
                        
                    </ScrollFloat> */}
                    <p className="text-secondary text-lg leading-relaxed mb-4">
                        {content.body1}
                    </p>
                    <p className="text-secondary text-lg leading-relaxed">
                        {content.body2}
                    </p>
                </div>

                <div className="space-y-4">
                    {content.highlights.map((h: any) => (
                        <div
                            key={h.title}
                            className="rounded-2xl bg-card-gradient border border-border p-5 shadow-card"
                        >
                            <h3 className="font-brand text-xl mb-2 text-text">{h.title}</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                {h.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Stats Row - Visual Flourish */}
            <div className="max-w-6xl mx-auto px-6 mt-20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border pt-12">
                    {content.stats.map((stat: any) => (
                        <StatItem key={stat.label} value={stat.value} label={stat.label} />
                    ))}
                </div>
            </div>
        </motion.section>
    );
}

function StatItem({ value, label }: { value: string; label: string }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    // Parse numeric part and suffix more intelligently
    // Matches start with digits, captures rest as suffix
    // e.g. "24/7" -> 24, "/7"
    // e.g. "50+" -> 50, "+"
    const match = value.match(/^(\d+)(.*)$/);
    const numericValue = match ? parseInt(match[1]) : 0;
    const suffix = match ? match[2] : value;

    // Motion value for the count
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest) + suffix);

    useEffect(() => {
        if (isInView) {
            animate(count, numericValue, { duration: 2, ease: "easeOut" });
        }
    }, [isInView, numericValue, count]);

    return (
        <div ref={ref} className="text-center">
            <motion.p className="font-brand font-bold text-4xl md:text-5xl bg-gradient-text bg-clip-text text-transparent animate-gradient mb-2">
                {rounded}
            </motion.p>
            <p className="text-secondary text-sm uppercase tracking-wider font-medium">
                {label}
            </p>
        </div>
    );
}