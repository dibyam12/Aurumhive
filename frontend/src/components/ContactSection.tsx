import { useState } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import SectionWrapper from './SectionWrapper';
import { toast } from '../stores/toastStore';

import { useContentStore } from '../stores/contentStore';
import { contactCopy as staticContact } from '../data';

const API_URL = import.meta.env.VITE_API_URL || '';

interface ContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface ContactFormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

export default function ContactSection() {
    const { content } = useContentStore();
    const contactCopy = content.contactCopy || staticContact;

    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<ContactFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const validate = (): boolean => {
        const newErrors: ContactFormErrors = {};
        let isValid = true;

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
            isValid = false;
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
            isValid = false;
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
            isValid = false;
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
            isValid = false;
        } else if (formData.message.length < 10) {
            newErrors.message = 'Message must be at least 10 characters long';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name as keyof ContactFormErrors]) {
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

        // Submit to backend API
        try {
            const response = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setSubmissionStatus('success');
                setFormData({ name: '', email: '', subject: '', message: '' });
                toast.success('Message sent successfully! We\'ll get back to you soon.');
            } else {
                setSubmissionStatus('error');
                toast.error('Failed to send message. Please try again.');
            }
        } catch (error) {
            setSubmissionStatus('error');
            toast.error('Failed to send message. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SectionWrapper id="contact" className="py-24 px-10 flex justify-center">
            <div className="max-w-[1200px] w-full grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
                {/* Left Side: Contact Form */}
                <div>
                    <h2 className="text-3xl md:text-5xl mb-4 text-text font-brand font-bold leading-tight">
                        {contactCopy.titleLine1}
                        <br />
                        <span className="font-brand font-bold bg-gradient-text bg-clip-text text-transparent text-3xl md:text-5xl">
                            {contactCopy.titleLine2}
                        </span>
                    </h2>
                    <p className="text-secondary mb-10 text-lg">
                        {contactCopy.description}
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder={contactCopy.namePlaceholder}
                                    className={`w-full p-4 rounded-lg border ${errors.name ? 'border-red-500' : 'border-border'} text-base font-primary outline-none bg-off-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>
                            <div className="flex-1">
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder={contactCopy.emailPlaceholder}
                                    className={`w-full p-4 rounded-lg border ${errors.email ? 'border-red-500' : 'border-border'} text-base font-primary outline-none bg-off-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        <div>
                            <input
                                type="text"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder={contactCopy.subjectPlaceholder}
                                className={`w-full p-4 rounded-lg border ${errors.subject ? 'border-red-500' : 'border-border'} text-base font-primary outline-none bg-off-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            />
                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                        </div>

                        <div>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder={contactCopy.messagePlaceholder}
                                rows={6}
                                className={`w-full p-4 rounded-lg border ${errors.message ? 'border-red-500' : 'border-border'} text-base font-primary resize-none outline-none bg-off-white focus:border-primary focus:ring-1 focus:ring-primary transition-colors`}
                            />
                            {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="btn-primary self-start min-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? 'Sending...' : contactCopy.buttonLabel}
                            </button>
                            {submissionStatus === 'success' && (
                                <p className="text-green-600 font-medium">Message sent successfully!</p>
                            )}
                            {submissionStatus === 'error' && (
                                <p className="text-red-600 font-medium">Failed to send. Please try again.</p>
                            )}
                        </div>
                    </form>
                </div>

                {/* Right Side: Placeholder */}
                <div className="h-full min-h-[500px] bg-off-white rounded-3xl flex justify-center items-center border-2 border-dashed border-border text-secondary font-medium">
                    <span className="text-secondary font-medium">
                        {contactCopy.rightPlaceholder}
                    </span>
                </div>
            </div>
        </SectionWrapper>
    );
}
