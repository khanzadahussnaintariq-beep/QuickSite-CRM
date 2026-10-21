'use client';

import { X, Calendar, Clock, Link as LinkIcon, UserCircle, Target, StickyNote, Building2, Briefcase, Users, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Meeting } from '@/store/meetingStore';
import { AnimatePresence, motion } from 'framer-motion';

interface PersonInfo { name: string; }
interface ClientInfo { company: string; name: string; }
interface ProjectInfo { title: string; }

interface MeetingDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    meeting: Meeting | null;
    assignee?: PersonInfo;
    organizer?: PersonInfo;
    client?: ClientInfo;
    project?: ProjectInfo;
    isOwner?: boolean;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function MeetingDetailsPanel({ isOpen, onClose, meeting, assignee, organizer, client, project, isOwner, onEdit, onDelete }: MeetingDetailsPanelProps) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    if (!meeting) return null;

    const renderStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Upcoming': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            'Rescheduled': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
        };
        const style = styles[status] || styles['Upcoming'];
        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${style}`}>
                {status}
            </span>
        );
    };

    const renderTypeBadge = (type: string) => (
        <span className="px-2 py-0.5 bg-background text-gray-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-wider rounded border border-border">
            {type}
        </span>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setConfirmDelete(false); onClose(); }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-[500px] bg-background shadow-2xl z-50 flex flex-col border-l border-border overflow-hidden"
                    >
                        {/* Header Area */}
                        <div className="p-6 border-b border-border bg-surface-card shrink-0">
                            <div className="flex justify-between items-start mb-4">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        {renderStatusBadge(meeting.status)}
                                        {renderTypeBadge(meeting.type)}
                                    </div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight leading-tight">{meeting.title}</h2>
                                </div>
                                <button
                                    onClick={() => { setConfirmDelete(false); onClose(); }}
                                    className="p-2 -mr-2 text-gray-400 hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {meeting.link && (
                                <a
                                    href={meeting.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full mt-4 flex items-center justify-center gap-2 bg-primary hover:bg-orange-600 text-white rounded-xl py-3 text-sm font-black tracking-widest uppercase transition-colors shadow-lg shadow-primary/20"
                                >
                                    <LinkIcon size={16} />
                                    Join Meeting
                                </a>
                            )}

                            {/* Owner-only actions */}
                            {isOwner && (
                                <div className="flex gap-2 mt-3">
                                    <button
                                        onClick={() => { setConfirmDelete(false); onEdit?.(); }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-border text-gray-500 hover:text-blue-500 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all"
                                    >
                                        <Pencil size={13} /> Edit
                                    </button>

                                    {confirmDelete ? (
                                        <div className="flex-1 flex gap-1.5">
                                            <button
                                                onClick={() => setConfirmDelete(false)}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-border text-gray-500 hover:text-foreground hover:bg-surface-hover transition-all"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => { onDelete?.(); setConfirmDelete(false); onClose(); }}
                                                className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white transition-all"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setConfirmDelete(true)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest border border-border text-gray-500 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 transition-all"
                                        >
                                            <Trash2 size={13} /> Delete
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Scrollable Details */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-background">

                            {/* Schedule & Logistics */}
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2 mb-4">Schedule Logistics</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-card border border-border rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Date</p>
                                            <p className="text-sm font-bold text-foreground">{meeting.date}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-surface-card border border-border rounded-xl flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Time</p>
                                            <p className="text-sm font-bold text-foreground">{meeting.time} ({meeting.duration})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Relationship & Context */}
                            {(meeting.relatedClient || meeting.relatedProject || meeting.department) && (
                                <div>
                                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2 mb-4">Connection</h3>
                                    <div className="space-y-3">
                                        {meeting.relatedClient && client && (
                                            <div className="p-4 bg-surface-card border border-border rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Building2 size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Linked Client</p>
                                                        <p className="text-sm font-bold text-foreground">{client.company} ({client.name})</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {meeting.relatedProject && project && (
                                            <div className="p-4 bg-surface-card border border-border rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Briefcase size={16} className="text-gray-400" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Linked Project</p>
                                                        <p className="text-sm font-bold text-foreground">{project.title}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {meeting.department && (
                                            <div className="p-4 bg-surface-card border border-border rounded-xl flex items-center gap-3">
                                                <Users size={16} className="text-gray-400" />
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Department</p>
                                                    <p className="text-sm font-bold text-foreground">{meeting.department}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Accountability */}
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2 mb-4">Accountability</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-surface-card border border border-border rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-1 flex items-center gap-1"><Target size={12} /> Responsible Dev</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-400">
                                                {assignee?.name.charAt(0) || '?'}
                                            </div>
                                            <p className="text-sm font-bold text-foreground">{assignee?.name || 'Unknown'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-surface-card border border-border rounded-xl">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1 flex items-center gap-1"><UserCircle size={12} /> Organizer</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-xs font-bold text-gray-500">
                                                {organizer?.name.charAt(0) || '?'}
                                            </div>
                                            <p className="text-sm font-bold text-foreground">{organizer?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Meeting Context */}
                            <div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2 mb-4">Agenda & Notes</h3>
                                <div className="space-y-4">
                                    {meeting.purpose && (
                                        <div className="p-4 bg-surface-card border border-border rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Purpose</p>
                                            <p className="text-sm font-semibold text-foreground leading-relaxed">{meeting.purpose}</p>
                                        </div>
                                    )}
                                    {meeting.agenda && (
                                        <div className="p-5 bg-surface-card border  border-border rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2"><StickyNote size={12} /> Notes / Agenda</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium whitespace-pre-wrap">{meeting.agenda}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
