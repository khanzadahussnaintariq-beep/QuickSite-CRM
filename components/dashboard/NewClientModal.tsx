'use client';

import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { useClientStore } from '@/store/clientStore';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

interface NewClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    client?: any;
    onCreate?: (client: any) => void;
}

export default function NewClientModal({ isOpen, onClose, client, onCreate }: NewClientModalProps) {
    const { createClient, updateClient, isLoading: isSaving } = useClientStore();

    const [formData, setFormData] = useState({
        name: '',
        company: '',
        email: '',
        phone: '',
        website: '',
        tier: 'Standard',
    });

    useEffect(() => {
        if (!isOpen) return;

        if (client) {
            setFormData({
                name: client.name || '',
                company: client.company || '',
                email: client.email || '',
                phone: client.phone || '',
                website: client.website || '',

                tier: client.tier
                    ? client.tier.charAt(0).toUpperCase() + client.tier.slice(1).toLowerCase()
                    : 'Standard',
            });
        } else {
            setFormData({
                name: '',
                company: '',
                email: '',
                phone: '',
                website: '',
                tier: 'Standard',
            });
        }
    }, [isOpen]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (client?.id) {
                await updateClient(client.id, formData);
                toast.success('Client updated successfully');
            } else {
                await createClient(formData);
                toast.success('Client added successfully');
            }
            if (onCreate) onCreate(formData);
            onClose();
        } catch (error) {
            toast.error(client?.id ? 'Failed to update client' : 'Failed to add client');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={client ? 'Edit Client' : 'Add New Client'}>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Contact Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Company Name</label>
                        <input
                            type="text"
                            required
                            value={formData.company}
                            onChange={(e) => handleChange('company', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                            placeholder="john@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Website</label>
                        <input
                            type="text"
                            value={formData.website}
                            onChange={(e) => handleChange('website', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                            placeholder="example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Tier</label>
                        <select
                            value={formData.tier}
                            onChange={(e) => handleChange('tier', e.target.value)}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                        >
                            <option value="Standard">Standard</option>
                            <option value="Premium">Premium</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-foreground hover:bg-surface-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-[#F26522] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                {client ? 'Saving...' : 'Adding...'}
                            </>
                        ) : (client ? 'Save Changes' : 'Add Client')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}