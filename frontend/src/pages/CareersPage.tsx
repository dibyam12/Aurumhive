import { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import CareersSection from "../components/CareersSection";
import CareersApplicationForm from "../components/CareersApplicationForm";
import Footer from "../components/Footer";
import SectionWrapper from "../components/SectionWrapper";
import { useContentStore } from "../stores/contentStore";
import Skeleton from "../components/ui/Skeleton";

export default function CareersPage() {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const [footerHeight, setFooterHeight] = useState(0);
    const footerRef = useRef<HTMLDivElement>(null);

    const { content, isLoading } = useContentStore();
    const careersContent = content.careersContent || {};

    useEffect(() => {
        if (!footerRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setFooterHeight(entry.contentRect.height);
            }
        });
        observer.observe(footerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div className="min-h-screen text-text font-primary relative">
            {/* Shared navbar */}
            <div className="fixed top-5 left-0 w-full z-40 pointer-events-none mb-2.5">
                <div className="pointer-events-auto">
                    <Navbar />
                </div>
            </div>

            <main
                className="pt-[110px] relative z-10 bg-white dark:bg-off-white shadow-2xl"
                style={{ marginBottom: footerHeight }}
            >
                {/* Simple intro hero for Careers */}
                <SectionWrapper className="py-16 px-6 bg-white dark:bg-off-white">
                    <div className="max-w-5xl mx-auto text-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-4">
                                <Skeleton width="60%" height="3rem" className="mx-auto" />
                                <Skeleton width="80%" height="1.25rem" className="mx-auto" />
                            </div>
                        ) : (
                            <>
                                <h1 className="font-brand text-4xl md:text-6xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                                    {careersContent.title || 'Careers at AURUMHIVE'}
                                </h1>
                                <p className="text-secondary text-lg leading-relaxed">
                                    {careersContent.subtitle || 'Join a tight‑knit team crafting premium web, mobile, and automation products for ambitious clients.'}
                                </p>
                            </>
                        )}
                    </div>
                </SectionWrapper>

                <CareersSection onApplyForRole={setSelectedRole} />

                <CareersApplicationForm initialRole={selectedRole} />
            </main>

            {/* Fixed Footer */}
            <div ref={footerRef} className="fixed bottom-0 left-0 w-full -z-10">
                <Footer />
            </div>
        </div>
    );
}
