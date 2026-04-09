import SectionWrapper from './SectionWrapper';
import { useContentStore } from '../stores/contentStore';
import { processSteps as staticProcessSteps } from '../data';

export default function ProcessSection() {
    const { content } = useContentStore();
    const processSteps = content.processSteps || staticProcessSteps;
    return (
        <SectionWrapper className="w-full py-20">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="font-brand text-3xl md:text-5xl mb-8 bg-gradient-text bg-clip-text text-transparent animate-gradient text-center">
                    How We Work
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {processSteps.map((step: any, index: number) => (
                        <div
                            key={step.title}
                            className="rounded-2xl bg-card-gradient border border-border p-5 shadow-card flex flex-col gap-2"
                        >
                            <span className="text-primary font-mono text-sm">
                                {String(index + 1).padStart(2, "0")}
                            </span>
                            <h3 className="font-brand text-xl text-text">{step.title}</h3>
                            <p className="text-secondary text-sm leading-relaxed">
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
