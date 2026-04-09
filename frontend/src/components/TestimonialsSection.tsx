import SectionWrapper from './SectionWrapper';
import { useContentStore } from '../stores/contentStore';
import { testimonials as staticTestimonials } from '../data';

export default function TestimonialsSection() {
    const { content } = useContentStore();
    const testimonials = content.testimonials || staticTestimonials;
    if (!testimonials.length) return null;

    return (
        <SectionWrapper className="w-full py-20">
            <div className="max-w-5xl mx-auto px-6 text-center">
                <h2 className="font-brand text-3xl md:text-5xl mb-8 bg-gradient-text bg-clip-text text-transparent animate-gradient text-center">
                    What Clients Say
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {testimonials.map((t: any) => (
                        <div
                            key={t.name}
                            className="rounded-2xl bg-card-gradient border border-border p-6 shadow-card"
                        >
                            <p className="text-secondary italic mb-4">“{t.quote}”</p>
                            <p className="font-brand text-lg text-text">{t.name}</p>
                            <p className="text-secondary text-sm">{t.role}</p>
                        </div>
                    ))}
                </div>
            </div>
        </SectionWrapper>
    );
}
