import { useContentStore } from '../stores/contentStore';
import { services as staticServices } from '../data';
import SectionWrapper from './SectionWrapper';

export default function FeatureSection() {
  const { content } = useContentStore();
  const services = content.services || staticServices;
  return (
    <SectionWrapper className="w-full py-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-brand font-bold bg-gradient-text bg-clip-text text-transparent animate-gradient text-4xl md:text-6xl inline-block">
            OUR SERVICES
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service: any) => (
            <div
              key={service.id}
              className="rounded-2xl bg-card-gradient border border-border p-8 shadow-card flex flex-col justify-between hover:shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <h3 className="font-brand text-2xl md:text-3xl text-text">
                  {service.title}
                </h3>
                <p className="text-secondary text-base leading-relaxed">
                  {service.description}
                </p>
                <ul className="text-secondary text-sm leading-relaxed list-disc list-inside space-y-2 my-6">
                  {service.bullets.map((item: any) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <a
                href={service.cta.href}
                className="inline-flex items-center gap-2 text-primary font-semibold text-lg hover:text-primary-dark transition-colors group mt-auto pt-4"
              >
                {service.cta.label}
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}