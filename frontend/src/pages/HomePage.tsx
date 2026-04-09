// src/pages/HomePage.tsx
import SplitHero from '../components/SplitHero';
import FeatureSection from '../components/FeatureSection';
import AboutSection from '../components/AboutSection';
import ProcessSection from '../components/ProcessSection';
import TechStackSection from '../components/TechStackSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

export default function HomePage() {
    return (
        <>
            <div id="top" />
            <SplitHero footer={<Footer />}>
                <div id="about" />
                <AboutSection />
                <div id="services" />
                <FeatureSection />
                <ProcessSection />
                <TechStackSection />
                <TestimonialsSection />
                <ContactSection />
                <div id="contact" />
            </SplitHero>
        </>
    );
}