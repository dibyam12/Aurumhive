import { useState, useEffect } from "react";
import type { FormEvent, ChangeEvent } from "react";
import SectionWrapper from "./SectionWrapper";
import { careersContent, openJobs } from "../data";
import { toast } from '../stores/toastStore';

interface CareersApplicationFormProps {
    initialRole: string | null;
}

interface CareersFormData {
    name: string;
    email: string;
    phone: string;
    role: string;
    about: string;
    resumeUrl: string;
    consent: boolean;
}

interface CareersFormErrors {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    about?: string;
    resumeUrl?: string;
    consent?: string;
}

export default function CareersApplicationForm({
    initialRole,
}: CareersApplicationFormProps) {
    const [formData, setFormData] = useState<CareersFormData>({
        name: '',
        email: '',
        phone: '',
        role: initialRole || '',
        about: '',
        resumeUrl: '',
        consent: false
    });

    const [errors, setErrors] = useState<CareersFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    useEffect(() => {
        if (initialRole) {
            setFormData(prev => ({ ...prev, role: initialRole }));
        }
    }, [initialRole]);

    const availableRoles = openJobs.map((job) => job.title);

    const validate = (): boolean => {
        const newErrors: CareersFormErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Full Name is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        // Phone is optional, but if provided, could validate simple format (optional step)
        if (formData.phone && !/^\+?[\d\s-]{8,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
            isValid = false;
        }

        if (!formData.role) {
            newErrors.role = 'Please select a role';
            isValid = false;
        }

        if (!formData.about.trim()) {
            newErrors.about = 'Please tell us about yourself';
            isValid = false;
        }

        if (!formData.resumeUrl.trim()) {
            newErrors.resumeUrl = 'Resume/Portfolio URL is required';
            isValid = false;
        } else {
            try {
                new URL(formData.resumeUrl);
            } catch (e) {
                newErrors.resumeUrl = 'Please enter a valid URL (include http:// or https://)';
                isValid = false;
            }
        }

        if (!formData.consent) {
            newErrors.consent = 'You must agree to the data processing policy';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        let checked = false;
        if (type === 'checkbox') {
            checked = (e.target as HTMLInputElement).checked;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user types
        if (errors[name as keyof CareersFormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);
        setSubmissionStatus('idle');

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmissionStatus('success');
            setFormData({
                name: '', email: '', phone: '', role: '', about: '', resumeUrl: '', consent: false
            });
            toast.success('Application submitted! We\'ll review it and get back to you soon.');
        } catch (error) {
            setSubmissionStatus('error');
            toast.error('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SectionWrapper
            id="careers-application-form"
            className="w-full py-16 px-6"
        >
            <div className="max-w-5xl mx-auto">
                <h2 className="font-brand text-3xl md:text-5xl mb-4 bg-gradient-text bg-clip-text text-transparent animate-gradient">
                    {careersContent.formTitle}
                </h2>
                <p className="text-secondary text-sm mb-6">
                    {careersContent.formSubtitle}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                className={`w-full p-3 rounded-lg border ${errors.name ? 'border-red-500' : 'border-border'} bg-off-white text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            />
                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={`w-full p-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-border'} bg-off-white text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone (optional)"
                                className={`w-full p-3 rounded-lg border ${errors.phone ? 'border-red-500' : 'border-border'} bg-off-white text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            />
                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                        </div>
                        <div>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={`w-full p-3 rounded-lg border ${errors.role ? 'border-red-500' : 'border-border'} bg-off-white text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            >
                                <option value="">Role you're applying for</option>
                                {availableRoles.map((title) => (
                                    <option key={title} value={title}>
                                        {title}
                                    </option>
                                ))}
                                <option value="Other">Other / Open Application</option>
                            </select>
                            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                        </div>
                    </div>

                    <div>
                        <textarea
                            name="about"
                            value={formData.about}
                            onChange={handleChange}
                            placeholder="Tell us briefly about your experience, key projects, and what you’d like to work on at AURUMHIVE..."
                            rows={5}
                            className={`w-full p-3 rounded-lg border ${errors.about ? 'border-red-500' : 'border-border'} bg-off-white text-base resize-none outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                        />
                        {errors.about && <p className="text-red-500 text-xs mt-1">{errors.about}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-secondary">
                            Resume / Portfolio (URL)
                        </label>
                        <input
                            type="url"
                            name="resumeUrl"
                            value={formData.resumeUrl}
                            onChange={handleChange}
                            placeholder="https://"
                            className={`w-full p-3 rounded-lg border ${errors.resumeUrl ? 'border-red-500' : 'border-border'} bg-off-white text-base outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                        />
                        {errors.resumeUrl && <p className="text-red-500 text-xs mt-1">{errors.resumeUrl}</p>}
                    </div>

                    <div>
                        <div className="flex items-start gap-2 text-xs text-secondary">
                            <input
                                type="checkbox"
                                id="careers-consent"
                                name="consent"
                                checked={formData.consent}
                                onChange={handleChange}
                                className="mt-1"
                            />
                            <label htmlFor="careers-consent">
                                I agree that AURUMHIVE may store and process my data for the
                                purpose of evaluating my application.
                            </label>
                        </div>
                        {errors.consent && <p className="text-red-500 text-xs mt-1">{errors.consent}</p>}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary rounded-full mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                        </button>
                        {submissionStatus === 'success' && (
                            <p className="text-green-600 font-medium text-sm">Application submitted successfully!</p>
                        )}
                        {submissionStatus === 'error' && (
                            <p className="text-red-600 font-medium text-sm">Failed to submit. Please try again.</p>
                        )}
                    </div>
                </form>
            </div>
        </SectionWrapper>
    );
}
