'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import { Client } from '@/lib/mockData';

interface AddClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    initialData?: Client | null;
}

export default function AddClientModal({ isOpen, onClose, onSave, initialData }: AddClientModalProps) {
    const generateId = () => `CLT-${Math.floor(1000 + Math.random() * 9000)}`;

    const [formData, setFormData] = useState({
        clientId: initialData?.clientId || generateId(),
        name: initialData?.name || '',
        company: initialData?.company || '',
        email: initialData?.email || '',
        phone: initialData?.phone || '',
        address: initialData?.address || '',
        industry: initialData?.industry || '',
        tier: initialData?.tier || 'Starter',
        status: initialData?.status || 'Prospect',
        preferredContact: initialData?.preferredContact || 'Email',
        notes: initialData?.notes || ''
    });

    // Reset when modal opens/closes or initialData changes
    useEffect(() => {
        if (isOpen) {
            setFormData({
                clientId: initialData?.clientId || generateId(),
                name: initialData?.name || '',
                company: initialData?.company || '',
                email: initialData?.email || '',
                phone: initialData?.phone || '',
                address: initialData?.address || '',
                industry: initialData?.industry || '',
                tier: initialData?.tier || 'Starter',
                status: initialData?.status || 'Prospect',
                preferredContact: initialData?.preferredContact || 'Email',
                notes: initialData?.notes || ''
            });
        }
    }, [isOpen, initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        const clientObj: Client = {
            id: initialData?.id || Math.random().toString(36).substr(2, 9),
            ...formData
        } as Client;

        onSave(clientObj);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Client" : "Add New Client"}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Client ID *</label>
                            <input
                                type="text"
                                required
                                value={formData.clientId}
                                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Company Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="e.g. Acme Corp"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Data */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border p b-2">Contact Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Contact Person *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="e.g. Jane Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="jane@acme.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                            <input
                                type="text"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Communication</label>
                            <select
                                value={formData.preferredContact}
                                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Email">Email</option>
                                <option value="WhatsApp">WhatsApp</option>
                                <option value="Slack">Slack</option>
                                <option value="Phone">Phone</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Physical Address</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="123 Business St, Suite 100, City, Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Business Context */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Business Context</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Industry</label>
                            <input
                                type="text"
                                value={formData.industry}
                                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="e.g. Healthcare, Tech..."
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Prospect">Prospect</option>
                                <option value="Active">Active</option>
                                <option value="Ongoing">Ongoing</option>
                                <option value="Completed">Completed</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Internal Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows={2}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm resize-none"
                                placeholder="Add any specific context or relationship details..."
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
                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl shadow-primary/20 transition-all active:scale-95"
                    >
                        {initialData ? "Save Changes" : "Save Client"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
