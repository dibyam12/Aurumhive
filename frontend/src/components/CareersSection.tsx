import { useState, useEffect } from "react";
import SectionWrapper from "./SectionWrapper";
import { useContentStore } from "../stores/contentStore";
import { useCareersStore, type Career } from "../stores/careersStore";
import Skeleton, { SkeletonCard } from "./ui/Skeleton";

interface CareersSectionProps {
    onApplyForRole: (roleTitle: string) => void;
}

export default function CareersSection({ onApplyForRole }: CareersSectionProps) {
    const [expandedJobId, setExpandedJobId] = useState<number | null>(null);

    // Get content and careers from stores
    const { content, isLoading: contentLoading } = useContentStore();
    const { careers, isLoading: careersLoading, fetchCareers } = useCareersStore();

    const lifeAtAurumhive = content.lifeAtAurumhive || { heading: '', paragraphs: [], highlights: [] };
    const aurumhiveValues = content.aurumhiveValues || { heading: '', items: [] };

    const isLoading = contentLoading || careersLoading;

    useEffect(() => {
        fetchCareers();
    }, [fetchCareers]);

    const hasJobs = careers.length > 0;

    const handleToggleJob = (id: number) => {
        setExpandedJobId((prev) => (prev === id ? null : id));
    };

    const handleApply = (job: Career) => {
        onApplyForRole(job.title);
        const element = document.getElementById("careers-application-form");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    // Skeleton loading state
    if (isLoading) {
        return (
            <SectionWrapper className="w-full py-16 px-6 bg-off-white/40 dark:bg-off-white/5">
                <div className="max-w-6xl mx-auto space-y-16">
                    {/* Life section skeleton */}
                    <div className="grid md:grid-cols-2 gap-10 items-start">
                        <div className="space-y-4">
                            <Skeleton width="60%" height="2.5rem" />
                            <Skeleton width="100%" height="1rem" />
                            <Skeleton width="95%" height="1rem" />
                            <Skeleton width="70%" height="1rem" />
                        </div>
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>

                    {/* Values skeleton */}
                    <div>
                        <Skeleton width="40%" height="2rem" className="mb-6" />
                        <div className="grid md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>

                    {/* Jobs skeleton */}
                    <div className="space-y-4">
                        <Skeleton width="30%" height="2rem" className="mb-4" />
                        {[1, 2].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                </div>
            </SectionWrapper>
        );
    }

    return (
        <SectionWrapper className="w-full py-16 px-6 bg-off-white/40 dark:bg-off-white/5">
            <div className="max-w-6xl mx-auto space-y-16">
                {/* Top: Life at AURUMHIVE */}
                <div className="grid md:grid-cols-2 gap-10 items-start">
                    <div>
                        <h2 className="font-brand text-3xl md:text-5xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                            {lifeAtAurumhive.heading}
                        </h2>
                        {lifeAtAurumhive.paragraphs?.map((p: string, idx: number) => (
                            <p
                                key={idx}
                                className="text-secondary text-lg leading-relaxed mb-3 last:mb-0"
                            >
                                {p}
                            </p>
                        ))}
                    </div>
                    <div className="space-y-3">
                        {lifeAtAurumhive.highlights?.map((item: string, idx: number) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-card-gradient border border-border p-4 shadow-card"
                            >
                                <p className="text-secondary text-sm">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Values */}
                <div>
                    <h3 className="font-brand text-2xl md:text-3xl mb-6 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                        {aurumhiveValues.heading}
                    </h3>
                    <div className="grid md:grid-cols-4 gap-6">
                        {aurumhiveValues.items?.map((v: any, idx: number) => (
                            <div
                                key={idx}
                                className="rounded-2xl bg-card-gradient border border-border p-4 shadow-card"
                            >
                                <h4 className="font-brand text-lg mb-2 text-text">
                                    {v.title}
                                </h4>
                                <p className="text-secondary text-sm leading-relaxed">
                                    {v.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Open roles */}
                <div className="space-y-4">
                    <h3 className="font-brand text-2xl md:text-3xl mb-2 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                        Open Positions
                    </h3>

                    {!hasJobs && (
                        <p className="text-secondary text-base">
                            There are currently no open positions at AURUMHIVE. Check back
                            soon or send us an open application using the form below.
                        </p>
                    )}

                    {hasJobs && (
                        <div className="space-y-3">
                            {careers.map((job) => {
                                const isOpen = expandedJobId === job.id;
                                return (
                                    <div
                                        key={job.id}
                                        className="rounded-2xl bg-card-gradient border border-border shadow-card overflow-hidden"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => handleToggleJob(job.id)}
                                            className="w-full flex justify-between items-center px-5 py-4 text-left hover:bg-off-white dark:hover:bg-off-white/10 transition-colors"
                                        >
                                            <div>
                                                <div className="font-brand text-lg text-text">
                                                    {job.title}
                                                </div>
                                                <div className="text-secondary text-xs mt-1">
                                                    {job.location} · {job.type} · {job.level}
                                                </div>
                                            </div>
                                            <span className="text-secondary text-xl">
                                                {isOpen ? "−" : "+"}
                                            </span>
                                        </button>

                                        {isOpen && (
                                            <div className="px-5 pb-5 pt-1 space-y-4 border-t border-border">
                                                <p className="text-secondary text-sm leading-relaxed">
                                                    {job.description}
                                                </p>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-brand text-sm mb-2 text-text">
                                                            Responsibilities
                                                        </h4>
                                                        <ul className="text-secondary text-sm list-disc list-inside space-y-1">
                                                            {job.responsibilities.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-brand text-sm mb-2 text-text">
                                                            Requirements
                                                        </h4>
                                                        <ul className="text-secondary text-sm list-disc list-inside space-y-1">
                                                            {job.requirements.map((item, idx) => (
                                                                <li key={idx}>{item}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleApply(job)}
                                                    className="btn-primary rounded-full mt-2"
                                                >
                                                    Apply for {job.title}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </SectionWrapper>
    );
}
