import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { ReactNode } from "react";

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children }) => (
  <>{children}</>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  title?: ReactNode;
}

/**
 * One card in the stack
 */
const Card: React.FC<{
  index: number;
  total: number;
  progress: any;
  children: ReactNode;
  itemClassName?: string;
}> = ({ index, total, progress, children, itemClassName = "" }) => {
  const step = 1 / total;
  // Adjust range so first card is visible longer.
  // We can just use the index step, but with a larger container height it will feel slower.
  const start = index * step;
  const end = start + step;

  // Simplified Y Logic:
  // Cards slide up from bottom (100%) to their stacked position (0% - offset)
  // We use percentage of the container height now since the container itself is offset by top-40

  const y = useTransform(
    progress,
    [start, start + step * 0.3, end, end + step],
    ["100%", "0%", "0%", "-5%"] // Slight upward nudge when stacked
  );

  const opacity = useTransform(
    progress,
    [start, start + step * 0.1], // Faster fade in
    [0, 1]
  );

  // Scale down slightly when the NEXT card arrives
  const scale = useTransform(progress, (v: number) =>
    v >= end ? 0.96 - (index * 0.04) : 1
  );

  const zIndex = index + 1;

  return (
    <motion.div
      style={{
        top: 0,
        left: 0,
        right: 0,
        y,
        opacity,
        scale,
        zIndex,
        position: "absolute",
        margin: "0 auto",
        // removed will-change to let browser decide, reduces memory pressure on low-end
      }}
      className={[
        "scroll-stack-card",
        "w-[90%] md:w-[80%] max-w-5xl h-[500px] md:h-[60vh]",
        "rounded-3xl shadow-2xl transition-colors duration-300",
        "border border-gray-200 dark:border-gray-700",
        "flex flex-col justify-center px-6 md:px-10 py-8",
        "bg-card-gradient",
        itemClassName,
      ].join(" ")}
    >
      {children}
    </motion.div>
  );
};

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  title,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsArray = React.Children.toArray(children);

  const cards = cardsArray;
  const total = cards.length;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 200vh per card for a balanced, smooth scroll feel
  const containerHeight = `${total * 100}vh`;

  return (
    <div
      ref={containerRef}
      className={`${className} relative text-text transition-colors duration-300`}
      style={{ height: containerHeight }}
    >
      {/* 
        Title Section - Sticky at top
        Added z-20 to ensure it stays visually "above" but we basically want cards to NOT touch it.
      */}
      <div className="sticky top-0 w-full flex justify-center pt-12 z-20 pointer-events-none h-auto bg-transparent">
        <div className="relative">
          {title}
        </div>
      </div>

      {/* 
        Cards Container - Sticky below title
        Changed from 'top-0' to 'top-40' (approx 160px) to ensure cards stack BELOW the title.
        This physical offset prevents the overlap seen in the screenshot.
      */}
      <div className="sticky top-40 h-[calc(100vh-10rem)] w-full overflow-hidden">
        {cards.map((child, i) => (
          <Card
            key={i}
            index={i}
            total={total}
            progress={scrollYProgress}
            itemClassName={(child as any).props?.itemClassName}
          >
            {(child as any).props?.children}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScrollStack;
