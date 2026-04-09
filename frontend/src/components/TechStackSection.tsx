import { useContentStore } from '../stores/contentStore';
import { techStackGroups as staticTechStack } from '../data';
import SectionWrapper from './SectionWrapper';

export default function TechStackSection() {
    const { content } = useContentStore();
    const techStackGroups = content.techStackGroups || staticTechStack;
    return (
        <SectionWrapper className="w-full py-20">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="font-brand text-3xl md:text-5xl mb-8 bg-gradient-text bg-clip-text text-transparent animate-gradient text-center">
                    Tech We Love
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {techStackGroups.map((group: any) => (
                        <div
                            key={group.label}
                            className="rounded-2xl bg-card-gradient border border-border p-5 shadow-card"
                        >
                            <h3 className="font-brand text-xl mb-3 text-text">
                                {group.label}
                            </h3>
                            <ul className="text-secondary text-sm space-y-1">
                                {group.items.map((item: any) => (
                                    <li key={item}>• {item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
