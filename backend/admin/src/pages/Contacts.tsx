import { useEffect, useState } from 'react';
import { useContactsStore } from '../stores/contactsStore';
import { MessagesPageSkeleton } from '../components/Skeleton';
import {
    Mail,
    MailOpen,
    Archive,
    Trash2,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Contacts() {
    const {
        contacts,
        pagination,
        selectedContact,
        isLoading,
        fetchContacts,
        getContact,
        markAsRead,
        archiveContact,
        deleteContact,
        clearSelectedContact
    } = useContactsStore();

    const [unreadOnly, setUnreadOnly] = useState(false);

    useEffect(() => {
        fetchContacts(1, unreadOnly);
    }, [fetchContacts, unreadOnly]);

    const handleViewContact = async (id: number) => {
        await getContact(id);
        await markAsRead(id);
    };

    const handleArchive = async (id: number) => {
        await archiveContact(id);
        clearSelectedContact();
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this message?')) {
            await deleteContact(id);
            clearSelectedContact();
        }
    };

    if (isLoading && contacts.length === 0) {
        return <MessagesPageSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
                    <p className="text-slate-400">
                        {pagination ? `${pagination.total} total messages` : 'Loading...'}
                    </p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={unreadOnly}
                        onChange={(e) => setUnreadOnly(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-amber-500 focus:ring-amber-500"
                    />
                    <span className="text-sm text-slate-300">Unread only</span>
                </label>
            </div>

            {/* Messages List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* List */}
                <div className="space-y-3">
                    {contacts.length === 0 ? (
                        <div className="admin-card p-12 text-center">
                            <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400">No messages</p>
                        </div>
                    ) : (
                        contacts.map((contact) => (
                            <div
                                key={contact.id}
                                onClick={() => handleViewContact(contact.id)}
                                className={`bg-slate-800/50 backdrop-blur-sm rounded-xl border transition-all cursor-pointer ${selectedContact?.id === contact.id
                                    ? 'border-amber-500/50 ring-1 ring-amber-500/20'
                                    : 'border-slate-700/50 hover:border-slate-600'
                                    } p-4`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${contact.is_read
                                        ? 'bg-slate-700/50 text-slate-400'
                                        : 'bg-amber-500/20 text-amber-500'
                                        }`}>
                                        {contact.is_read ? <MailOpen className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className={`font-medium truncate ${contact.is_read ? 'text-slate-300' : 'text-white'
                                                }`}>
                                                {contact.name}
                                            </h3>
                                            <span className="text-xs text-slate-500 whitespace-nowrap">
                                                {new Date(contact.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">{contact.subject}</p>
                                        <p className="text-sm text-slate-500 mt-1 truncate">{contact.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Pagination */}
                    {pagination && pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-4">
                            <button
                                onClick={() => fetchContacts(pagination.page - 1, unreadOnly)}
                                disabled={pagination.page === 1}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-slate-400">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => fetchContacts(pagination.page + 1, unreadOnly)}
                                disabled={pagination.page === pagination.totalPages}
                                className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Detail View */}
                <div className="admin-card p-6">
                    {selectedContact ? (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">{selectedContact.subject}</h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        From: {selectedContact.name} &lt;{selectedContact.email}&gt;
                                    </p>
                                    <p className="text-slate-500 text-xs mt-1">
                                        {new Date(selectedContact.created_at).toLocaleString()}
                                    </p>
                                </div>
                                <button
                                    onClick={clearSelectedContact}
                                    className="p-2 text-slate-400 hover:text-white rounded-lg"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="border-t border-slate-700 pt-4">
                                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedContact.message}
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-4 border-t border-slate-700">
                                <a
                                    href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`}
                                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-4 py-2 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all"
                                >
                                    <Mail className="w-4 h-4" />
                                    Reply
                                </a>
                                <button
                                    onClick={() => handleArchive(selectedContact.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                                >
                                    <Archive className="w-4 h-4" />
                                    Archive
                                </button>
                                <button
                                    onClick={() => handleDelete(selectedContact.id)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex items-center justify-center text-center py-20">
                            <div>
                                <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-400">Select a message to view</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
