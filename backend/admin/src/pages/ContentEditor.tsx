import { useEffect, useState } from 'react';
import { useContentStore } from '../stores/contentStore';
import { ContentPageSkeleton } from '../components/Skeleton';
import {
    Save,
    RefreshCw,
    CheckCircle,
    FileText,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const sectionLabels: Record<string, string> = {
    siteMeta: 'Site Metadata',
    navLinks: 'Navigation Links',
    heroContent: 'Hero Section',
    services: 'Services',
    contactCopy: 'Contact Section Text',
    footerLinks: 'Footer Links',
    aboutSection: 'About Section',
    processSteps: 'Process Steps',
    techStackGroups: 'Tech Stack',
    testimonials: 'Testimonials',
    careersContent: 'Careers Page Content',
    lifeAtAurumhive: 'Life at Aurumhive',
    aurumhiveValues: 'Company Values'
};

export default function ContentEditor() {
    const { content, isLoading, isSaving, fetchContent, updateSection } = useContentStore();
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['heroContent']));
    const [editedContent, setEditedContent] = useState<Record<string, string>>({});
    const [savedSections, setSavedSections] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchContent();
    }, [fetchContent]);

    useEffect(() => {
        // Initialize edited content as JSON strings
        const initial: Record<string, string> = {};
        Object.entries(content).forEach(([key, value]) => {
            initial[key] = JSON.stringify(value, null, 2);
        });
        setEditedContent(initial);
    }, [content]);

    const toggleSection = (key: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(key)) {
                newSet.delete(key);
            } else {
                newSet.add(key);
            }
            return newSet;
        });
    };

    const handleContentChange = (key: string, value: string) => {
        setEditedContent(prev => ({ ...prev, [key]: value }));
        setSavedSections(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
        });
    };

    const handleSave = async (key: string) => {
        try {
            const parsed = JSON.parse(editedContent[key]);
            const success = await updateSection(key, parsed);
            if (success) {
                setSavedSections(prev => new Set(prev).add(key));
                setTimeout(() => {
                    setSavedSections(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(key);
                        return newSet;
                    });
                }, 2000);
            }
        } catch (error) {
            alert('Invalid JSON format. Please check your syntax.');
        }
    };

    const isValidJson = (str: string): boolean => {
        try {
            JSON.parse(str);
            return true;
        } catch {
            return false;
        }
    };

    if (isLoading) {
        return <ContentPageSkeleton />;
    }

    const sections = Object.keys(content).sort();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Site Content</h1>
                    <p className="text-slate-400">Edit website content (JSON format)</p>
                </div>
                <button
                    onClick={() => fetchContent()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-300 text-sm">
                    <strong>Note:</strong> Content is stored as JSON. Be careful with the syntax.
                    Changes will be reflected on the website immediately after saving.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-3">
                {sections.map((key) => {
                    const isExpanded = expandedSections.has(key);
                    const isSaved = savedSections.has(key);
                    const hasChanges = editedContent[key] !== JSON.stringify(content[key], null, 2);
                    const isValid = isValidJson(editedContent[key] || '{}');

                    return (
                        <div
                            key={key}
                            style={{ backgroundColor: 'rgba(30, 41, 59, 0.9)' }}
                            className="rounded-xl border border-slate-700 overflow-hidden"
                        >
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(key)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-amber-500" />
                                    <div>
                                        <h3 className="font-medium text-white">
                                            {sectionLabels[key] || key}
                                        </h3>
                                        <p className="text-xs text-slate-500">{key}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {hasChanges && (
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400">
                                            Unsaved
                                        </span>
                                    )}
                                    {isSaved && (
                                        <span className="flex items-center gap-1 text-green-400 text-sm">
                                            <CheckCircle className="w-4 h-4" />
                                            Saved
                                        </span>
                                    )}
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400" />
                                    )}
                                </div>
                            </button>

                            {/* Section Content */}
                            {isExpanded && (
                                <div className="p-4 pt-0 space-y-3">
                                    <textarea
                                        value={editedContent[key] || ''}
                                        onChange={(e) => handleContentChange(key, e.target.value)}
                                        className={`w-full bg-slate-900/50 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:ring-2 transition-all resize-none ${isValid
                                            ? 'border border-slate-600 focus:ring-amber-500/50 focus:border-amber-500'
                                            : 'border border-red-500 focus:ring-red-500/50'
                                            }`}
                                        rows={12}
                                        spellCheck={false}
                                    />
                                    {!isValid && (
                                        <p className="text-red-400 text-sm">Invalid JSON format</p>
                                    )}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => handleSave(key)}
                                            disabled={!hasChanges || !isValid || isSaving}
                                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
