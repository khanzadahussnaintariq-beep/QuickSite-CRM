'use client';

import { useState } from 'react';
import { X, Building2, UserCircle, Briefcase, MessageSquare, CreditCard, Flag, FileText, Phone, Mail, Calendar } from 'lucide-react';
import { Client, Project, Payment, Milestone, Meeting } from '@/lib/mockData';
import { AnimatePresence, motion } from 'framer-motion';

interface ClientDetailsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    client: Client | null;
    projects: Project[];
    payments: Payment[];
    milestones: Milestone[];
    meetings: Meeting[];
    onEditClient: () => void;
    onAddMilestone: () => void;
}

type TabType = 'overview' | 'projects' | 'communication' | 'payments' | 'milestones';

export default function ClientDetailsPanel({ isOpen, onClose, client, projects, payments, milestones, meetings, onEditClient, onAddMilestone }: ClientDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<TabType>('overview');

    if (!client) return null;

    const renderStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Active': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            'Prospect': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            'Ongoing': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            'Completed': 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border-purple-200 dark:border-purple-500/20',
            'Inactive': 'bg-gray-100 text-gray-700 dark:bg-gray-500/10 dark:text-gray-400 border-gray-200 dark:border-gray-500/20',
        };
        const style = styles[status] || styles['Active'];
        return (
            <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${style}`}>
                {status}
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

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-card shadow-2xl z-50 flex flex-col border-l border-border"
                    >
                        {/* Header Profile Area */}
                        <div className="p-6 border-b border-border bg-background">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl font-black text-primary">
                                        {client.company.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-black text-foreground tracking-tight">{client.company}</h2>
                                            {renderStatusBadge(client.status)}
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                                            {client.clientId} <span className="w-1 h-1 rounded-full bg-gray-300" /> {client.industry || 'General Options'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={onEditClient}
                                        className="text-xs font-bold text-gray-500 hover:text-foreground px-3 py-1.5 border border-border rounded-lg bg-surface-hover/50 hover:bg-surface-hover transition-colors"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="p-1.5 text-gray-400 hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Navigation Tabs */}
                            <div className="flex items-center gap-6 mt-6 border-b border-border overflow-y-auto custom-scrollbar">
                                {[
                                    { id: 'overview', icon: Building2, label: 'Overview' },
                                    { id: 'projects', icon: Briefcase, label: `Projects (${projects.length})` },
                                    { id: 'communication', icon: MessageSquare, label: 'Comms' },
                                    { id: 'payments', icon: CreditCard, label: 'Financials' },
                                    { id: 'milestones', icon: Flag, label: 'Milestones' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as TabType)}
                                        className={`pb-3 text-sm font-black uppercase tracking-widest transition-colors relative flex items-center gap-2
                                            ${activeTab === tab.id ? 'text-primary' : 'text-gray-400 hover:text-foreground'}`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-background">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-surface-card border border-border rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><UserCircle size={12} /> Contact Person</p>
                                            <p className="text-sm font-bold text-foreground">{client.name}</p>
                                        </div>
                                        <div className="p-4 bg-surface-card border border-border rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><Mail size={12} /> Email Address</p>
                                            <p className="text-sm font-bold text-foreground">{client.email}</p>
                                        </div>
                                        <div className="p-4 bg-surface-card border border-border rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><Phone size={12} /> Phone / Direct</p>
                                            <p className="text-sm font-bold text-foreground">{client.phone}</p>
                                        </div>
                                        <div className="p-4 bg-surface-card border border-border rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 flex items-center gap-2"><Building2 size={12} /> Address</p>
                                            <p className="text-sm font-medium text-gray-500">{client.address || 'No address provided'}</p>
                                        </div>
                                    </div>

                                    {client.notes && (
                                        <div className="p-5 bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/10 rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2"><FileText size={12} /> Internal Notes</p>
                                            <p className="text-sm text-foreground/80 leading-relaxed font-medium">{client.notes}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* PROJECTS TAB */}
                            {activeTab === 'projects' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {projects.length > 0 ? projects.map(project => (
                                        <div key={project.id} className="p-5 bg-surface-card border border-border rounded-xl hover:border-primary/30 transition-colors">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-lg font-black text-foreground">{project.title}</h3>
                                                    <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                                                        {project.budgetType} • {project.budgetType === 'Weekly' ? `$${project.hourlyRate || 0}/hr (${project.weeklyHours || 0} hrs/wk limit)` : `$${project.price}`}
                                                    </p>
                                                </div>
                                                <span className="px-2 py-1 bg-background text-[10px] font-black uppercase tracking-wider rounded">{project.status}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                                            <div className="pt-4 border-t border-border flex items-center justify-between">
                                                <div className="flex gap-2">
                                                    {project.team.map(member => (
                                                        <div key={member} className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary" title={member}>
                                                            {member.charAt(0)}
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${project.progress}%` }} />
                                                    </div>
                                                    <span className="text-xs font-black text-foreground">{project.progress}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center p-12 border border-dashed border-border rounded-xl">
                                            <p className="text-sm font-bold text-gray-400">No projects associated with this client.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* COMMUNICATION TAB */}
                            {activeTab === 'communication' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between p-4 bg-surface-card border border-border rounded-xl">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Preferred Channel</p>
                                            <p className="text-lg font-black text-foreground flex items-center gap-2">
                                                <MessageSquare size={16} className="text-primary" /> {client.preferredContact}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-4">Recent Meetings</h3>
                                        <div className="space-y-3">
                                            {meetings.length > 0 ? meetings.map(meeting => (
                                                <div key={meeting.id} className="p-4 bg-surface-card border border-border rounded-xl flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                            <Calendar size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-foreground">{meeting.title}</p>
                                                            <p className="text-xs text-gray-500 font-medium">{meeting.type} • {meeting.date} at {meeting.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <p className="text-sm font-medium text-gray-400 p-4 border border-dashed border-border rounded-xl text-center">No meeting history found.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* PAYMENTS TAB */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10 rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-1">Total Paid</p>
                                            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                                                ${payments.reduce((acc, curr) => acc + curr.paidAmount, 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="p-4 bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10 rounded-xl">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-500 mb-1">Outstanding Balance</p>
                                            <p className="text-2xl font-black text-red-700 dark:text-red-400">
                                                ${payments.reduce((acc, curr) => acc + (curr.totalAmount - curr.paidAmount), 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Invoice History</h3>
                                        {payments.length > 0 ? payments.map(payment => (
                                            <div key={payment.id} className="p-4 bg-surface-card border border-border rounded-xl flex items-center justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <p className="text-sm font-bold text-foreground">{payment.invoiceRef}</p>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                                                            ${payment.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                                                                payment.status === 'Pending' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}
                                                        >
                                                            {payment.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 font-medium">Due: {payment.dueDate} • {payment.method}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-foreground">${payment.totalAmount.toLocaleString()}</p>
                                                    <p className="text-xs font-bold text-gray-400">${payment.paidAmount.toLocaleString()} paid</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm font-medium text-gray-400 p-4 border border-dashed border-border rounded-xl text-center">No payment history.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* MILESTONES TAB */}
                            {activeTab === 'milestones' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500">Project Milestones</h3>
                                        <button onClick={onAddMilestone} className="text-xs font-bold text-primary hover:text-primary-hover border border-primary/20 px-3 py-1 bg-primary/5 rounded-md transition-colors">+ Add</button>
                                    </div>
                                    <div className="relative border-l-2 border-border ml-3 space-y-6">
                                        {milestones.length > 0 ? milestones.map(milestone => (
                                            <div key={milestone.id} className="relative pl-6">
                                                <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-background 
                                                    ${milestone.status === 'Completed' ? 'bg-emerald-500' :
                                                        milestone.status === 'In Progress' ? 'bg-amber-500' :
                                                            milestone.status === 'Blocked' ? 'bg-red-500' : 'bg-gray-300 dark:bg-zinc-600'}`
                                                } />
                                                <div className="p-4 bg-surface-card border border-border rounded-xl">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-sm font-bold text-foreground">{milestone.title}</p>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{milestone.dueDate}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-[10px] font-bold uppercase tracking-widest
                                                            ${milestone.status === 'Completed' ? 'text-emerald-600 dark:text-emerald-400' :
                                                                milestone.status === 'In Progress' ? 'text-amber-600 dark:text-amber-400' :
                                                                    milestone.status === 'Blocked' ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}
                                                        >
                                                            {milestone.status}
                                                        </span>
                                                        {milestone.paymentLinked && (
                                                            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded">Payment Linked</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-sm font-medium text-gray-400 p-4 ml-4 border border-dashed border-border rounded-xl text-center">No milestones found.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
