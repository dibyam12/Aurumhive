import { query, closePool } from './connection.js';

// Initial site content from data.ts
const siteContent = [
    {
        section_key: 'siteMeta',
        content: {
            name: "AURUMHIVE",
            year: 2026,
            owner: "Dibyam Raj Ghimire"
        }
    },
    {
        section_key: 'navLinks',
        content: [
            { label: "Services", href: "/", hash: "services" },
            { label: "About", href: "/", hash: "about" },
            { label: "Careers", href: "/careers", hash: null }
        ]
    },
    {
        section_key: 'heroContent',
        content: {
            headline: "Turning Ideas Into Digital Gold",
            subtext: "Build, automate, and scale your business with AURUMHIVE. We provide premium digital solutions tailored to your unique needs.",
            primaryCta: { label: "Get Started", href: "#contact" },
            secondaryCta: { label: "Learn More", href: "#services" }
        }
    },
    {
        section_key: 'services',
        content: [
            {
                id: "web",
                title: "WEB & DIGITAL SOLUTIONS",
                description: "Custom websites, web apps, and portals that power your business online – from marketing sites to full web‑based management systems.",
                bullets: [
                    "Business websites and landing pages",
                    "Custom web applications & dashboards",
                    "Web‑based ERP / CRM / HR systems"
                ],
                cta: { label: "Explore Web Solutions", href: "#contact" }
            },
            {
                id: "mobile",
                title: "MOBILE DEVELOPMENT",
                description: "Native and cross‑platform mobile apps that keep your users connected anywhere – fast, secure, and designed for real‑world use.",
                bullets: [
                    "iOS & Android app development",
                    "Cross‑platform apps (React Native / Flutter)",
                    "API‑driven apps connected to your backend systems"
                ],
                cta: { label: "Build Mobile Apps", href: "#contact" }
            },
            {
                id: "automation",
                title: "AUTOMATION & MANAGEMENT SYSTEMS",
                description: "End‑to‑end systems and automation that connect your tools, remove manual work, and keep your operations running smoothly.",
                bullets: [
                    "Custom management systems (inventory, projects, finance, HR)",
                    "Workflow automation & integrations between your apps",
                    "Monitoring, maintenance & continuous improvements"
                ],
                cta: { label: "Automate Your Operations", href: "#contact" }
            }
        ]
    },
    {
        section_key: 'contactCopy',
        content: {
            titleLine1: "Let's Build Something",
            titleLine2: "Extraordinary",
            description: "Ready to start your project? Fill out the form below and we'll get back to you shortly.",
            namePlaceholder: "Name",
            emailPlaceholder: "Email",
            subjectPlaceholder: "Subject",
            messagePlaceholder: "Tell us about your project...",
            buttonLabel: "Send Message",
            rightPlaceholder: "[ Reserved Space for 3D Model / Image ]"
        }
    },
    {
        section_key: 'footerLinks',
        content: [
            { label: "Twitter", href: "#" },
            { label: "LinkedIn", href: "#" },
            { label: "Instagram", href: "#" },
            { label: "Careers", href: "careers" }
        ]
    },
    {
        section_key: 'aboutSection',
        content: {
            heading: "About AURUMHIVE",
            body1: "AURUMHIVE is a digital product studio focused on transforming ideas into fast, reliable, and beautiful software. From MVPs to enterprise systems, we ship products that feel premium and perform under load.",
            body2: "We blend strategy, design, and engineering so you get a single team that can understand your business, craft the experience, and deliver the technology behind it.",
            highlights: [
                {
                    title: "Product‑first mindset",
                    description: "We care about real users and business outcomes, not just tickets and features."
                },
                {
                    title: "Long‑term partners",
                    description: "We prefer ongoing relationships where we can maintain, iterate, and scale with you."
                }
            ],
            stats: [
                { value: "5+", label: "Years Experience" },
                { value: "50+", label: "Projects Delivered" },
                { value: "100%", label: "Client Satisfaction" },
                { value: "24/7", label: "Support" }
            ]
        }
    },
    {
        section_key: 'processSteps',
        content: [
            { title: "Discover", description: "Workshops and research to understand your goals, users, and constraints." },
            { title: "Design", description: "Information architecture, user flows, and UI that make your product clear and intuitive." },
            { title: "Build", description: "Implementation with modern stacks, automated testing, and clean, maintainable code." },
            { title: "Launch & Evolve", description: "Deploy, monitor, and continuously improve based on real‑world usage and feedback." }
        ]
    },
    {
        section_key: 'techStackGroups',
        content: [
            { label: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
            { label: "Backend", items: ["Node.js", "Express", "NestJS", "REST / GraphQL APIs"] },
            { label: "Mobile", items: ["React Native", "Expo", "Flutter (on demand)"] },
            { label: "Cloud & DevOps", items: ["AWS", "Vercel", "Docker", "CI/CD pipelines"] }
        ]
    },
    {
        section_key: 'testimonials',
        content: [
            {
                name: "Client Name",
                role: "Founder, Example Co.",
                quote: "AURUMHIVE helped us go from idea to launch with a clean, reliable product our customers love."
            },
            {
                name: "Client Name 2",
                role: "Operations Lead, Acme Inc.",
                quote: "Their automation work removed manual tasks and gave us a real‑time view of our operations."
            }
        ]
    },
    {
        section_key: 'careersContent',
        content: {
            heading: "Careers at AURUMHIVE",
            intro: "Join a product‑driven team building clean, performant web, mobile, and automation solutions for clients around the world.",
            perksTitle: "Why work with us?",
            perks: [
                "Remote‑friendly culture with flexible hours",
                "Challenging projects across web, mobile, and automation",
                "Room to experiment with modern tools and stacks",
                "Supportive team that cares about craft and learning"
            ],
            formTitle: "Open Application",
            formSubtitle: "Even if you don't see the perfect role yet, tell us about yourself and we'll reach out when there is a match."
        }
    },
    {
        section_key: 'lifeAtAurumhive',
        content: {
            heading: "Life at AURUMHIVE",
            paragraphs: [
                "We're a small, focused team that cares about craft, ownership, and building products that feel premium.",
                "Expect clear communication, flexible work, and an environment where good ideas can come from anyone on the team."
            ],
            highlights: [
                "Remote‑friendly with async communication.",
                "Weekly design and engineering share‑outs.",
                "Dedicated time for learning and side experiments.",
                "Support for conferences, courses, and tools."
            ]
        }
    },
    {
        section_key: 'aurumhiveValues',
        content: {
            heading: "Our Values",
            items: [
                { title: "Craft over shortcuts", description: "We care about details, performance, and maintainability, even when nobody is watching." },
                { title: "Clear & honest communication", description: "We prefer direct, respectful feedback and transparent updates over surprises." },
                { title: "Ownership mindset", description: "Everyone is trusted to make decisions, ask questions, and drive work to completion." },
                { title: "Curiosity & learning", description: "We experiment with new tools and approaches, but always in service of real problems." }
            ]
        }
    }
];

// Initial careers from data.ts
const initialCareers = [
    {
        title: "Graphic Designer",
        location: "Remote / Kathmandu, NP",
        type: "Full-time",
        level: "Mid-level",
        description: "Help shape the visual language of AURUMHIVE and our clients through brand identities, marketing assets, and product visuals.",
        responsibilities: [
            "Create visual concepts for web, social, and product marketing assets.",
            "Collaborate with product, marketing, and engineering to ship cohesive experiences.",
            "Maintain and extend design systems, iconography, and illustration styles.",
            "Prepare production-ready assets and basic motion graphics when needed."
        ],
        requirements: [
            "2+ years of experience as a graphic or visual designer.",
            "Strong portfolio showcasing digital design work.",
            "Fluency with Figma and Adobe Creative Cloud (Illustrator, Photoshop).",
            "Good understanding of typography, color, and layout."
        ]
    }
];

async function seed() {
    console.log('🌱 Starting database seeding...\n');

    try {
        // Seed site content
        console.log('📝 Seeding site content...');
        for (const item of siteContent) {
            await query(
                `INSERT INTO site_content (section_key, content) 
                 VALUES ($1, $2) 
                 ON CONFLICT (section_key) DO UPDATE SET content = $2, updated_at = CURRENT_TIMESTAMP`,
                [item.section_key, JSON.stringify(item.content)]
            );
            console.log(`   ✓ ${item.section_key}`);
        }

        // Seed careers
        console.log('\n💼 Seeding careers...');
        for (const career of initialCareers) {
            await query(
                `INSERT INTO careers (title, location, type, level, description, responsibilities, requirements)
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 ON CONFLICT DO NOTHING`,
                [
                    career.title,
                    career.location,
                    career.type,
                    career.level,
                    career.description,
                    career.responsibilities,
                    career.requirements
                ]
            );
            console.log(`   ✓ ${career.title}`);
        }

        console.log('\n✅ Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    } finally {
        await closePool();
    }
}

seed();
