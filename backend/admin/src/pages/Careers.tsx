import { useEffect, useState } from 'react';
import { useCareersStore } from '../stores/careersStore';
import { CareersPageSkeleton } from '../components/Skeleton';
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Check,
    Briefcase,
    MapPin,
    Clock
} from 'lucide-react';

interface CareerFormData {
    title: string;
    location: string;
    type: string;
    level: string;
    description: string;
    responsibilities: string;
    requirements: string;
    is_active: boolean;
}

const emptyForm: CareerFormData = {
    title: '',
    location: '',
    type: 'Full-time',
    level: 'Mid-level',
    description: '',
    responsibilities: '',
    requirements: '',
    is_active: true
};

export default function Careers() {
    const { careers, isLoading, fetchCareers, createCareer, updateCareer, deleteCareer } = useCareersStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<CareerFormData>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchCareers(true);
    }, [fetchCareers]);

    const openCreateModal = () => {
        setFormData(emptyForm);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (career: typeof careers[0]) => {
        setFormData({
            title: career.title,
            location: career.location || '',
            type: career.type || 'Full-time',
            level: career.level || 'Mid-level',
            description: career.description || '',
            responsibilities: career.responsibilities?.join('\n') || '',
            requirements: career.requirements?.join('\n') || '',
            is_active: career.is_active
        });
        setEditingId(career.id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const careerData = {
            title: formData.title,
            location: formData.location,
            type: formData.type,
            level: formData.level,
            description: formData.description,
            responsibilities: formData.responsibilities.split('\n').filter(r => r.trim()),
            requirements: formData.requirements.split('\n').filter(r => r.trim()),
            is_active: formData.is_active
        };

        let success = false;
        if (editingId) {
            success = await updateCareer(editingId, careerData);
        } else {
            success = await createCareer(careerData);
        }

        setIsSaving(false);
        if (success) {
            setIsModalOpen(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this job listing?')) {
            await deleteCareer(id);
        }
    };

    if (isLoading) {
        return <CareersPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Careers</h1>
                    <p className="text-slate-400">Manage job listings</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Job
                </button>
            </div>

            {/* Jobs List */}
            <div className="grid gap-4">
                {careers.length === 0 ? (
                    <div className="admin-card p-12 text-center">
                        <Briefcase className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                        <p className="text-slate-400">No job listings yet</p>
                        <button
                            onClick={openCreateModal}
                            className="mt-4 text-amber-500 hover:underline"
                        >
                            Create your first job listing
                        </button>
                    </div>
                ) : (
                    careers.map((career) => (
                        <div
                            key={career.id}
                            className="admin-card p-6"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-lg font-semibold text-white">{career.title}</h3>
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${career.is_active
                                            ? 'bg-green-500/20 text-green-400'
                                            : 'bg-slate-500/20 text-slate-400'
                                            }`}>
                                            {career.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {career.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {career.type}
                                        </span>
                                        <span>{career.level}</span>
                                    </div>
                                    <p className="mt-3 text-slate-300 text-sm line-clamp-2">
                                        {career.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => openEditModal(career)}
                                        className="p-2 text-slate-400 hover:text-amber-500 hover:bg-slate-700/50 rounded-lg transition-colors"
                                    >
                                        <Pencil className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(career.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-700/50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <h2 className="text-xl font-semibold text-white">
                                {editingId ? 'Edit Job Listing' : 'Create Job Listing'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                        placeholder="Remote / City"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    >
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Level</label>
                                    <select
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    >
                                        <option>Entry-level</option>
                                        <option>Mid-level</option>
                                        <option>Senior</option>
                                        <option>Lead</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Responsibilities (one per line)
                                </label>
                                <textarea
                                    value={formData.responsibilities}
                                    onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-mono text-sm"
                                    placeholder="Build features&#10;Review code&#10;Collaborate with team"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Requirements (one per line)
                                </label>
                                <textarea
                                    value={formData.requirements}
                                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none font-mono text-sm"
                                    placeholder="3+ years experience&#10;React proficiency&#10;Team player"
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-300">
                                    Active (visible on website)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all"
                                >
                                    <Check className="w-4 h-4" />
                                    {isSaving ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
