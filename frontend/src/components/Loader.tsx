import { motion, useAnimation, type Variants } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LoaderProps {
    onFinish: () => void;
    dataReady?: boolean;
}

export default function Loader({ onFinish, dataReady = false }: LoaderProps) {
    const text = "AURUMHIVE";
    const letters = text.split("");
    const [lettersDone, setLettersDone] = useState(false);
    const lineControls = useAnimation();

    // Sequence Controller
    useEffect(() => {
        // Calculate when letters are effectively done
        // 9 letters * 0.1 stagger + 0.6 duration = ~1.5s
        const timer = setTimeout(() => {
            setLettersDone(true);
        }, 1600);
        return () => clearTimeout(timer);
    }, []);

    // Trigger Line Animation when both conditions met
    useEffect(() => {
        if (lettersDone && dataReady) {
            const sequence = async () => {
                await lineControls.start({
                    scaleX: 1,
                    opacity: 1,
                    transition: { duration: 1.0, ease: "easeInOut" }
                });
                // Small pause before unmounting
                setTimeout(onFinish, 200);
            };
            sequence();
        }
    }, [lettersDone, dataReady, lineControls, onFinish]);

    const containerVariants: Variants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        },
        exit: {
            opacity: 0,
            y: -50,
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] as any }
        }
    };

    const letterVariants: Variants = {
        hidden: { y: 40, opacity: 0, filter: "blur(8px)" },
        visible: {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: { duration: 0.6, ease: [0, 0, 0.2, 1] as any }
        }
    };

    return (
        <motion.div
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'var(--bg-page-gradient)' }}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
        >
            <div className="relative flex flex-col items-center justify-center p-8">
                {/* Letters */}
                <div className="flex overflow-hidden mb-4">
                    {letters.map((letter, index) => (
                        <motion.span
                            key={index}
                            variants={letterVariants}
                            className="font-brand font-bold text-4xl md:text-7xl bg-gradient-text bg-clip-text text-transparent animate-gradient inline-block"
                            style={{ backgroundSize: '200% auto' }}
                        >
                            {letter}
                        </motion.span>
                    ))}
                </div>

                {/* Line */}
                <motion.div
                    animate={lineControls}
                    className="h-[2px] w-full max-w-[300px] md:max-w-[500px] origin-left bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"
                    initial={{ scaleX: 0, opacity: 0 }}
                />
            </div>
        </motion.div>
    );
}
