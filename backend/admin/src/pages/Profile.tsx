import { useState, useEffect } from 'react';
import { useAuthStore, type User } from '../stores/authStore';
import { ProfilePageSkeleton } from '../components/Skeleton';
import {
    User as UserIcon,
    Mail,
    Lock,
    Save,
    Plus,
    Trash2,
    Shield,
    Check
} from 'lucide-react';

export default function Profile() {
    const { user, isLoading, updateProfile, changePassword, createUser, getUsers, deleteUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'team'>('profile');

    // Profile State
    const [profileForm, setProfileForm] = useState({
        username: user?.username || '',
        email: user?.email || ''
    });

    // Password State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Team State
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [newMember, setNewMember] = useState({
        username: '',
        email: '',
        password: '',
        role: 'admin'
    });

    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Load team members
    useEffect(() => {
        if (activeTab === 'team') {
            loadTeam();
        }
    }, [activeTab]);

    const loadTeam = async () => {
        const members = await getUsers();
        // Filter out current user from list if needed, but usually good to see everyone
        setTeamMembers(members);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await updateProfile(profileForm);
        if (success) {
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } else {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        const success = await changePassword(passwordForm.newPassword);
        if (success) {
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } else {
            setMessage({ type: 'error', text: 'Failed to change password' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await createUser(newMember);
        if (success) {
            setMessage({ type: 'success', text: 'Team member added successfully' });
            setIsAddingMember(false);
            setNewMember({ username: '', email: '', password: '', role: 'admin' });
            loadTeam();
        } else {
            setMessage({ type: 'error', text: 'Failed to add team member' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleDeleteMember = async (id: number) => {
        if (confirm('Are you sure you want to remove this team member?')) {
            const success = await deleteUser(id);
            if (success) {
                setMessage({ type: 'success', text: 'Team member removed' });
                loadTeam();
            } else {
                setMessage({ type: 'error', text: 'Failed to remove team member' });
            }
            setTimeout(() => setMessage(null), 3000);
        }
    };

    if (isLoading && !user) {
        return <ProfilePageSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Profile & Settings</h1>
                <p className="text-slate-400">Manage your account and team access</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-slate-800/50 p-2 rounded-xl w-fit border border-slate-700/50">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-8 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap relative ${activeTab === 'profile'
                        ? 'bg-slate-700 text-white shadow-lg shadow-black/20 z-10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    My Profile
                </button>
                <button
                    onClick={() => setActiveTab('team')}
                    className={`px-8 py-3 rounded-lg font-medium text-sm transition-all whitespace-nowrap relative ${activeTab === 'team'
                        ? 'bg-slate-700 text-white shadow-lg shadow-black/20 z-10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                >
                    Team Management
                </button>
            </div>

            {/* Notification Message */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <Check className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            {/* Profile Content */}
            {activeTab === 'profile' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Edit Profile */}
                    <div className="admin-card p-6 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-2xl font-bold">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white">{user?.username}</h2>
                                <p className="text-slate-400 text-sm">Administrator</p>
                            </div>
                        </div>

                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={profileForm.username}
                                        onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                        className="w-full h-11 bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        value={profileForm.email}
                                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                        className="w-full h-11 bg-slate-900/50 border border-slate-600 rounded-lg pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                Save Changes
                            </button>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="admin-card p-6 space-y-6">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Lock className="w-5 h-5 text-amber-500" />
                            Change Password
                        </h2>

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    className="w-full h-11 bg-slate-900/50 border border-slate-600 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
                                <input
                                    type="password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                    className="w-full h-11 bg-slate-900/50 border border-slate-600 rounded-lg px-4 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-11 flex items-center justify-center gap-2 bg-slate-800 border border-slate-600 text-slate-300 px-4 rounded-lg hover:bg-slate-700 hover:border-slate-500 hover:text-white transition-all disabled:opacity-50"
                            >
                                <Shield className="w-4 h-4" />
                                Update Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Team Content */}
            {activeTab === 'team' && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-white">Team Members</h2>
                        <button
                            onClick={() => setIsAddingMember(!isAddingMember)}
                            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Member
                        </button>
                    </div>

                    {/* Add Member Form */}
                    {isAddingMember && (
                        <div className="admin-card p-6 border-amber-500/30">
                            <h3 className="text-white font-semibold mb-4">New Team Member</h3>
                            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={newMember.username}
                                    onChange={(e) => setNewMember({ ...newMember, username: e.target.value })}
                                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={newMember.email}
                                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={newMember.password}
                                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                                    className="bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                    required
                                />
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Create Account
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsAddingMember(false)}
                                        className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Members List */}
                    <div className="grid gap-4">
                        {teamMembers.map((member) => (
                            <div key={member.id} className="admin-card p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                        {member.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{member.username}</p>
                                        <p className="text-slate-400 text-sm">{member.email || 'No email'}</p>
                                    </div>
                                    <span className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs border border-amber-500/20">
                                        Admin
                                    </span>
                                </div>
                                {member.id !== user?.id && (
                                    <button
                                        onClick={() => handleDeleteMember(member.id)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
