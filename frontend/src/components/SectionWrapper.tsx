import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface SectionWrapperProps {
    children: ReactNode;
    id?: string;
    className?: string;
    delay?: number;
}

export default function SectionWrapper({ children, id, className = "", delay = 0.1 }: SectionWrapperProps) {
    return (
        <motion.section
            style={{

                background: 'var(--bg-page-gradient)',
                backgroundSize: '100% 200%',
                backgroundPosition: 'top bottom'
            }}
            id={id}
            className={className}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.8, delay, ease: [0.21, 0.45, 0.15, 1.00] }} // Smooth easeOutCubic-ish
        >

            {children}
        </motion.section>
    );
}
