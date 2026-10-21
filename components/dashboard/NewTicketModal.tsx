'use client';

import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import { TicketType, TicketPriority, TicketStatus } from '@/store/ticketStore';

interface NewTicketModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (ticket: any) => void;
    members: Array<{ id: string; name: string; role?: string }>;
    projects: Array<{ id: string; title: string }>;
    defaultAssigneeId?: string;
    defaultStatus?: TicketStatus;
}

const STATUSES: TicketStatus[] = ['To Do', 'In Progress', 'Review', 'Complete'];

export default function NewTicketModal({ isOpen, onClose, onCreate, members, projects, defaultStatus = 'To Do' }: NewTicketModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        projectId: '',
        assignedToId: '',
        status: defaultStatus as TicketStatus,
        priority: 'Medium' as TicketPriority,
        type: 'Question' as TicketType,
        dueDate: ''
    });
    const [projectSearch, setProjectSearch] = useState('');
    const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const projectInputRef = useRef<HTMLInputElement>(null);

    // Sync status when the modal opens with a new defaultStatus
    useEffect(() => {
        if (isOpen) {
            setFormData(prev => ({ ...prev, status: defaultStatus, assignedToId: '' }));
            setProjectSearch('');
            setProjectDropdownOpen(false);
        }
    }, [isOpen, defaultStatus]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTicket = {
            ...formData,
            dueDate: formData.dueDate || undefined,
            source: 'Portal',
            tags: []
        };
        onCreate(newTicket);
        setFormData({
            title: '',
            description: '',
            projectId: '',
            assignedToId: '',
            status: defaultStatus,
            priority: 'Medium',
            type: 'Question',
            dueDate: ''
        });
        setProjectSearch('');
        setProjectDropdownOpen(false);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Support Ticket">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Subject / Title</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                            placeholder="e.g. Cannot access billing dashboard"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                            placeholder="Provide detailed information about the issue..."
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Assign To</label>
                    <select
                        required
                        value={formData.assignedToId}
                        onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                        className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                        <option value="">Unassigned</option>
                        {members.map(u => (
                            <option key={u.id} value={u.id}>{u.name} — {u.role}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
                        className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Ticket Type</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value as TicketType })}
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                        >
                            <option value="Question">Question</option>
                            <option value="Problem">Problem</option>
                            <option value="Bug">Bug</option>
                            <option value="Feature Request">Feature Request</option>
                            <option value="Refund">Refund</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Priority</label>
                        <select
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                        >
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                            <option value="Urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Related Project</label>
                        <input
                            ref={projectInputRef}
                            type="text"
                            value={formData.projectId ? (projects.find(p => p.id === formData.projectId)?.title ?? projectSearch) : projectSearch}
                            onChange={(e) => {
                                setProjectSearch(e.target.value);
                                setFormData({ ...formData, projectId: '' });
                                if (!projectDropdownOpen) {
                                    const rect = projectInputRef.current?.getBoundingClientRect();
                                    if (rect) setDropdownPos({ top: rect.top - 4, left: rect.left, width: rect.width });
                                    setProjectDropdownOpen(true);
                                }
                            }}
                            onFocus={() => {
                                const rect = projectInputRef.current?.getBoundingClientRect();
                                if (rect) setDropdownPos({ top: rect.top - 4, left: rect.left, width: rect.width });
                                setProjectDropdownOpen(true);
                            }}
                            placeholder="Search project..."
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                        />
                        {projectDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-9998"
                                    onClick={() => { setProjectDropdownOpen(false); setProjectSearch(''); }}
                                />
                                <div
                                    className="fixed z-9999 bg-surface border border-border rounded-xl shadow-2xl overflow-hidden"
                                    style={{ bottom: `calc(100vh - ${dropdownPos.top}px)`, left: dropdownPos.left, width: dropdownPos.width }}
                                >
                                    <ul className="max-h-48 overflow-y-auto py-1">
                                        <li
                                            onMouseDown={(e) => { e.preventDefault(); setFormData({ ...formData, projectId: '' }); setProjectSearch(''); setProjectDropdownOpen(false); }}
                                            className="px-4 py-2.5 text-sm text-gray-400 hover:bg-surface-hover cursor-pointer"
                                        >
                                            None
                                        </li>
                                        {projects
                                            .filter(p => p.title.toLowerCase().includes(projectSearch.toLowerCase()))
                                            .map(p => (
                                                <li
                                                    key={p.id}
                                                    onMouseDown={(e) => { e.preventDefault(); setFormData({ ...formData, projectId: p.id }); setProjectSearch(''); setProjectDropdownOpen(false); }}
                                                    className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-surface-hover transition-colors ${formData.projectId === p.id ? 'text-primary font-semibold' : 'text-foreground'}`}
                                                >
                                                    {p.title}
                                                </li>
                                            ))}
                                    </ul>
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Due Date</label>
                        <input
                            required
                            type="date"
                            value={formData.dueDate}
                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground hover:bg-surface-hover transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        Create Ticket
                    </button>
                </div>
            </form>
        </Modal>
    );
}
