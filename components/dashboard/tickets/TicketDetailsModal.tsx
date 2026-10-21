'use client';

import { useState, useEffect } from 'react';
import { Ticket, TicketPriority, TicketStatus } from '@/store/ticketStore';
import { Calendar, Flag, Tag, Edit2, Check, X as XIcon, Trash2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';

interface ColumnConfig {
    id: string;
    title: string;
    statuses: string[];
}

interface TicketDetailsModalProps {
    ticket: Ticket | null;
    isOpen: boolean;
    onClose: () => void;
    onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
    onDeleteTicket: (ticketId: string) => void;
    columns: ColumnConfig[];
    members: Array<{ id: string; name: string; avatar?: string }>;
    canManageTickets: boolean;
}

export default function TicketDetailsModal({
    ticket,
    isOpen,
    onClose,
    onUpdateTicket,
    onDeleteTicket,
    columns,
    members,
    canManageTickets
}: TicketDetailsModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Partial<Ticket> | null>(null);

    useEffect(() => {
        if (isOpen && ticket) {
            setEditForm(ticket);
            setIsEditing(false);
        }
    }, [isOpen, ticket]);

    const handleSave = () => {
        if (ticket && editForm) {
            onUpdateTicket(ticket.id, editForm);
        }
        setIsEditing(false);
    };

    if (!ticket || !editForm) return null;

    const assignee = members.find(u => u.id === ticket.assignedToId);

    const getPriorityConfig = (p: TicketPriority) => {
        switch (p) {
            case 'Critical':
                return { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-500/10', border: 'border-red-200 dark:border-red-500/20' };
            case 'Urgent':
                return { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' };
            case 'High':
                return { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' };
            case 'Medium':
                return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200 dark:border-blue-500/20' };
            default:
                return { color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-500/10', border: 'border-gray-200 dark:border-gray-500/20' };
        }
    };

    const priority = getPriorityConfig(ticket.priority);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Ticket Details">
            <div className="space-y-6">
                {/* Action Bar */}
                <div className="flex justify-end mb-2">
                    {!canManageTickets ? null : isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-surface-hover rounded-lg transition-colors">
                                <XIcon size={14} /> Cancel
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white hover:bg-primary-hover rounded-lg shadow-sm transition-colors">
                                <Check size={14} /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors">
                                <Edit2 size={14} /> Edit Ticket
                            </button>
                            <button
                                onClick={() => onDeleteTicket(ticket.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                            >
                                <Trash2 size={14} /> Delete Ticket
                            </button>
                        </div>
                    )}
                </div>

                {/* Header */}
                <div>
                    <div className="flex items-center gap-3 mb-3">
                        <span className="text-xs font-bold text-primary/70 tracking-wide uppercase px-2 py-1 bg-primary/10 rounded-md border border-primary/20">
                            {ticket.ticketNumber}
                        </span>
                        
                        {isEditing ? (
                            <>
                                <select 
                                    value={editForm.priority}
                                    onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as TicketPriority })}
                                    className="text-xs font-semibold bg-surface-hover border border-border rounded-md px-2 py-1 outline-none focus:border-primary"
                                >
                                    <option value="Critical">Critical</option>
                                    <option value="Urgent">Urgent</option>
                                    <option value="High">High</option>
                                    <option value="Medium">Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                                <select 
                                    value={editForm.status}
                                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value as TicketStatus })}
                                    className="text-xs font-semibold bg-surface-hover border border-border rounded-md px-2 py-1 outline-none focus:border-primary"
                                >
                                    {columns.map(col => (
                                        <option key={col.id} value={col.statuses[0]}>{col.title}</option>
                                    ))}
                                </select>
                            </>
                        ) : (
                            <>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${priority.bg} ${priority.color} ${priority.border} border`}>
                                    <Flag size={12} />
                                    {ticket.priority}
                                </span>
                                <span className="text-xs font-medium text-gray-500 bg-surface-hover px-2.5 py-1 rounded-md border border-border">
                                    {columns.find(c => c.statuses.includes(ticket.status))?.title || ticket.status}
                                </span>
                            </>
                        )}
                    </div>

                    {isEditing ? (
                        <input 
                            type="text"
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full text-xl font-bold bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                        />
                    ) : (
                        <h2 className="text-xl font-bold text-foreground mb-4">{ticket.title}</h2>
                    )}
                </div>

                {/* Meta section */}
                <div className="grid grid-cols-2 gap-4 p-5 rounded-xl border border-border bg-surface-hover/30">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Assignee</p>
                        {isEditing ? (
                            <select
                                value={editForm.assignedToId || ''}
                                onChange={(e) => setEditForm({ ...editForm, assignedToId: e.target.value })}
                                className="w-full text-sm font-semibold bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
                            >
                                <option value="">Unassigned</option>
                                {members.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="flex items-center gap-3">
                                {assignee ? (
                                    <>
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20 shadow-sm">
                                            {assignee.avatar || assignee.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">{assignee.name}</span>
                                    </>
                                ) : (
                                    <span className="text-sm italic text-gray-400">Unassigned</span>
                                )}
                            </div>
                        )}
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Due Date</p>
                        {isEditing ? (
                            <input
                                type="date"
                                value={editForm.dueDate?.split('T')[0] || ''}
                                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                                className="w-full text-sm font-semibold bg-background border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
                            />
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                <Calendar size={16} className="text-gray-400" />
                                {formatDate(ticket.dueDate) || 'No date set'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</p>
                    {isEditing ? (
                        <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            rows={4}
                            className="w-full text-sm font-medium bg-background border border-border rounded-lg px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 resize-none"
                        />
                    ) : (
                        <div className="p-4 rounded-xl border border-border bg-surface-card text-sm text-foreground whitespace-pre-wrap leading-relaxed shadow-inner">
                            {ticket.description || <span className="text-gray-400 italic">No description provided.</span>}
                        </div>
                    )}
                </div>

                {/* Tags */}
                {ticket.tags && ticket.tags.length > 0 && (
                    <div>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Tags</p>
                        <div className="flex flex-wrap gap-2">
                            {ticket.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-hover border border-border text-xs font-medium text-foreground rounded-lg shadow-sm"
                                >
                                    <Tag size={12} className="text-gray-400" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
