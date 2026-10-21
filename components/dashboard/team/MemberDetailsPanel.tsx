'use client';

import { X, Briefcase, Mail, Phone, Calendar, DollarSign, Building, AlertCircle, Edit, Trash2, Banknote } from 'lucide-react';
import { User, Project, Ticket } from '@/lib/mockData';
import { AnimatePresence, motion } from 'framer-motion';
import MemberAvatar from './MemberAvatar';

interface MemberDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    member: User | null;
    projects: Project[];
    tickets: Ticket[];
    onEdit?: (member: User) => void;
    onDelete?: (id: string) => void;
}

export default function MemberDetailsPanel({ isOpen, onClose, member, projects, tickets, onEdit, onDelete }: MemberDetailsPanelProps) {
    if (!member) return null;

    // Prioritize high/critical tickets
    const highPriorityTickets = tickets.filter(t => t.priority === 'High' || t.priority === 'Critical');

    // Sort logic
    const activeProjects = projects.filter(p => p.status === 'In Progress' || p.status === 'Planning');

    // Helper function to render priority badge with correct colors
    const renderPriorityBadge = (priority: string) => {
        const priorityColors: Record<string, string> = {
            'Low': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            'Medium': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            'High': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            'Critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            'Urgent': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        const colorClass = priorityColors[priority] || 'bg-gray-100 text-gray-700 bg-background dark:text-zinc-400';

        return (
            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${colorClass}`}>
                {priority}
            </span>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    />

                    {/* Slide-over Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col border-l border-zinc-200 dark:border-zinc-800"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-foreground">Member Profile</h2>
                                <div className="flex items-center gap-1.5 ml-2">
                                    <button
                                        onClick={() => member && onEdit?.(member)}
                                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                        title="Edit Member"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => member && onDelete?.(member.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 rounded-lg transition-all"
                                        title="Delete Member"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-gray-400 hover:text-foreground hover:bg-background dark:hover:bg-background rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                            {/* Profile Header */}
                            <div className="flex items-center gap-5">
                                <MemberAvatar user={member} size={20} />
                                <div>
                                    <h1 className="text-2xl font-black text-foreground tracking-tight">{member.name}</h1>
                                    <p className="text-sm font-medium text-primary mt-0.5">{member.role.toUpperCase()}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider
                                            ${member.status === 'Active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                member.status === 'Away' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                                    member.status === 'Inactive' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                        'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400'}`}
                                        >
                                            {member.status || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Info Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        <Mail size={12} className="text-primary" /> Email
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate">{member.email}</p>
                                </div>
                                <div className="bg-background p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        <Phone size={12} className="text-primary" /> Phone
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate">{member.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-background p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        <Building size={12} className="text-primary" /> Department
                                    </div>
                                    <p className="text-sm font-medium text-foreground truncate">{member.department || 'General'}</p>
                                </div>
                                <div className="bg-background p-3 rounded-xl border border-zinc-200 dark:border-zinc-800/50">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                                        <Calendar size={12} className="text-primary" /> Joined
                                    </div>
                                    <p className="text-sm font-medium text-foreground">{member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>

                            {/* Salary (HR Admin Only visually - showing for demo purposes) */}
                            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <Banknote size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">Annual Salary</p>
                                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                                            PKR {member.salary?.toLocaleString() || '0'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Projects */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                                    <Briefcase size={16} className="text-primary" />
                                    Active Projects ({activeProjects.length})
                                </h3>
                                {activeProjects.length > 0 ? (
                                    <div className="space-y-3 block">
                                        {activeProjects.map(project => (
                                            <div key={project.id} className="p-3 bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl flex justify-between items-center shadow-sm">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">{project.title}</p>
                                                    <p className="text-xs font-medium text-gray-500">{project.client}</p>
                                                </div>
                                                <span className="text-xs font-bold text-primary">{project.progress}%</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center border border-dashed bg-background border-zinc-300 dark:border-zinc-700 rounded-xl text-sm text-gray-500">
                                        No active projects assigned.
                                    </div>
                                )}
                            </div>

                            {/* Tickets */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                                    <AlertCircle size={16} className="text-primary" />
                                    Assigned Tickets ({tickets.length})
                                </h3>
                                {tickets.length > 0 ? (
                                    <div className="space-y-3">
                                        {tickets.map(ticket => (
                                            <div key={ticket.id} className="p-3 bg-background border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-[10px] font-black text-gray-400 group-hover:text-primary transition-colors">{ticket.ticketNumber}</p>
                                                    {renderPriorityBadge(ticket.priority)}
                                                </div>
                                                <p className="text-sm font-semibold text-foreground leading-snug truncate">{ticket.title}</p>
                                                <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                                                    <span className="text-xs font-medium text-gray-500">{ticket.status}</span>
                                                    {ticket.dueDate && (
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Calendar size={10} />
                                                            {new Date(ticket.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center border border-dashed border-zinc-300 bg-background dark:border-zinc-700 rounded-xl text-sm text-gray-500">
                                        No active tickets assigned.
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}