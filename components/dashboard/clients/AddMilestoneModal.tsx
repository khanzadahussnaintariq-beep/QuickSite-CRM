'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Milestone, Project } from '@/lib/mockData';

interface AddMilestoneModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (milestone: Milestone) => void;
    clientId: string;
    clientProjects: Project[];
}

export default function AddMilestoneModal({ isOpen, onClose, onAdd, clientId, clientProjects }: AddMilestoneModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        projectId: clientProjects.length > 0 ? clientProjects[0].id : '',
        dueDate: new Date().toISOString().split('T')[0],
        status: 'Pending' as Milestone['status'],
        paymentLinked: false
    });

    useEffect(() => {
        if (isOpen) {
            setFormData({
                title: '',
                projectId: clientProjects.length > 0 ? clientProjects[0].id : '',
                dueDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                paymentLinked: false
            });
        }
    }, [isOpen, clientProjects]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.projectId) return;

        const newMilestone: Milestone = {
            id: 'm_' + Math.random().toString(36).substr(2, 9),
            clientId,
            ...formData
        };

        onAdd(newMilestone);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Project Milestone">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Milestone Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-bold"
                                placeholder="e.g. Phase 1 Design Delivery"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Linked Project *</label>
                            <select
                                required
                                value={formData.projectId}
                                onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="" disabled>Select a project</option>
                                {clientProjects.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Due Date *</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Initial Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Blocked">Blocked</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-2">
                            <label className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface-hover/50 hover:bg-surface-hover cursor-pointer transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={formData.paymentLinked}
                                    onChange={(e) => setFormData({ ...formData, paymentLinked: e.target.checked })}
                                    className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Link Payment</p>
                                    <p className="text-xs text-gray-500">Requires completion for invoice release</p>
                                </div>
                            </label>
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
                        disabled={!formData.projectId}
                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Add Milestone
                    </button>
                </div>
            </form>
        </Modal>
    );
}
