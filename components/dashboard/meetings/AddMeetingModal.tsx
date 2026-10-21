'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Meeting } from '@/store/meetingStore';
import { useMeetingStore } from '@/store/meetingStore';
import { Loader2 } from 'lucide-react';

interface MemberOption { id: string; name: string; role: string; }
interface ClientOption { id: string; company: string; }
interface ProjectOption { id: string; title: string; }

interface AddMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: MemberOption[];
    projects: ProjectOption[];
    clients: ClientOption[];
    initialData?: Meeting | null;
    currentUserId?: string;
}

export default function AddMeetingModal({ isOpen, onClose, users, projects, clients, initialData, currentUserId }: AddMeetingModalProps) {
    const { addMeeting, updateMeeting, isLoading } = useMeetingStore();
    const currentDate = new Date().toISOString().split('T')[0];

    const emptyForm = (): Omit<Meeting, 'id'> => ({
        title: '',
        type: 'Internal',
        relatedClient: '',
        relatedProject: '',
        department: '',
        link: 'https://meet.google.com/',
        date: currentDate,
        time: '10:00',
        duration: '30m',
        assignedTo: users.length > 0 ? users[0].id : '',
        organizer: currentUserId || (users.length > 0 ? users[0].id : ''),
        purpose: '',
        agenda: '',
        status: 'Upcoming',
    });

    const [formData, setFormData] = useState<Omit<Meeting, 'id'>>(emptyForm());

    useEffect(() => {
        if (isOpen) {
            setFormData(initialData ? { ...initialData } : emptyForm());
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            relatedClient: formData.relatedClient || undefined,
            relatedProject: formData.relatedProject || undefined,
            department: formData.department || undefined,
            agenda: formData.agenda || undefined,
        };

        const success = initialData
            ? await updateMeeting(initialData.id, payload)
            : await addMeeting(payload as any);

        if (success) onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Meeting' : 'Schedule New Meeting'}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Core Details */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Meeting Basics</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Meeting Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-bold"
                                placeholder="e.g. Q1 Architecture Sync"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Meeting Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as Meeting['type'] })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Internal">Internal</option>
                                <option value="Client Related">Client Related</option>
                                <option value="Project Related">Project Related</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        {formData.type === 'Client Related' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Select Client</label>
                                <select
                                    value={formData.relatedClient || ''}
                                    onChange={(e) => setFormData({ ...formData, relatedClient: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                                >
                                    <option value="">-- Optional --</option>
                                    {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.type === 'Project Related' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Select Project</label>
                                <select
                                    value={formData.relatedProject || ''}
                                    onChange={(e) => setFormData({ ...formData, relatedProject: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                                >
                                    <option value="">-- Optional --</option>
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        )}

                        {formData.type === 'Internal' && (
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Department</label>
                                <input
                                    type="text"
                                    value={formData.department || ''}
                                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                    placeholder="e.g. Engineering"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Logistics */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Logistics</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Time *</label>
                            <input
                                type="time"
                                required
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Duration</label>
                            <select
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="15m">15 Minutes</option>
                                <option value="30m">30 Minutes</option>
                                <option value="45m">45 Minutes</option>
                                <option value="1h">1 Hour</option>
                                <option value="1.5h">1.5 Hours</option>
                                <option value="2h">2 Hours</option>
                            </select>
                        </div>
                        <div className="col-span-3">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Join Link (Zoom/Meet/Teams) *</label>
                            <input
                                type="url"
                                required
                                value={formData.link}
                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="https://meet.google.com/..."
                            />
                        </div>
                    </div>
                </div>

                {/* Ownership */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Responsibility</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Assigned Dev/Member *</label>
                            <select
                                required
                                value={formData.assignedTo}
                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="">-- Select Member --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Organizer *</label>
                            <select
                                disabled
                                value={formData.organizer}
                                onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="">-- Select Organizer --</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as Meeting['status'] })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Completed">Completed</option>
                                <option value="Rescheduled">Rescheduled</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Context */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Context</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Meeting Purpose *</label>
                            <input
                                type="text"
                                required
                                value={formData.purpose}
                                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="Why is this meeting happening?"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Agenda / Notes</label>
                            <textarea
                                value={formData.agenda || ''}
                                onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                                rows={3}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm resize-none"
                                placeholder="Bullet points, internal references..."
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-hover transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {initialData ? 'Save Changes' : 'Create Meeting'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
