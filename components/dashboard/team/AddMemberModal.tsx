'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { PROJECTS, User } from '@/lib/mockData';
import { Search, Loader2 } from 'lucide-react';
import { useMemberStore } from '@/store/memberStore';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface AddMemberModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    memberToEdit?: User | null;
}

export default function AddMemberModal({ isOpen, onClose, onSuccess, memberToEdit }: AddMemberModalProps) {
    const { createMember, updateMember, isLoading } = useMemberStore();
    const [formData, setFormData] = useState({
        name: '',
        role: 'developer',
        email: '',
        initialPassword: '',
        phone: '',
        salary: '',
        joinDate: new Date().toISOString().split('T')[0],
        status: 'Active' as 'Active' | 'Inactive' | 'Away' | 'Terminated',
        department: 'Engineering'
    });
    const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (memberToEdit) {
            setFormData({
                name: memberToEdit.name || '',
                role: memberToEdit.role || 'developer',
                email: memberToEdit.email || '',
                initialPassword: '', // Not used in edit
                phone: memberToEdit.phone || '',
                salary: memberToEdit.salary?.toString() || '',
                joinDate: memberToEdit.joinDate ? new Date(memberToEdit.joinDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                status: (memberToEdit.status || 'Active') as any,
                department: memberToEdit.department || 'Engineering'
            });
        } else {
            setFormData({
                name: '',
                role: 'developer',
                email: '',
                initialPassword: '',
                phone: '',
                salary: '',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'Active',
                department: 'Engineering'
            });
        }
    }, [memberToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const memberPayload: any = {
            email: formData.email,
            name: formData.name,
            role: formData.role,
            phone: formData.phone,
            salary: Number(formData.salary) || 0,
            joinDate: formData.joinDate,
            department: formData.department,
            status: formData.status,
            assignedProjectId: selectedProjectIds.length > 0 ? selectedProjectIds[0] : null
        };

        // Only include password in update if user actually typed something
        if (memberToEdit && formData.initialPassword) {
            // Validate password if it's being reset
            const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
            if (formData.initialPassword.length < 8) {
                toast.error("Password must be at least 8 characters long");
                return;
            }
            if (!passwordRegex.test(formData.initialPassword)) {
                toast.error("Password must contain uppercase, lowercase, and a number");
                return;
            }
            memberPayload.initialPassword = formData.initialPassword;
        }

        // Validate password for new members
        if (!memberToEdit) {
            const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
            if (formData.initialPassword.length < 8) {
                toast.error("Password must be at least 8 characters long");
                return;
            }
            if (!passwordRegex.test(formData.initialPassword)) {
                toast.error("Password must contain uppercase, lowercase, and a number");
                return;
            }
        }

        let success = false;

        if (memberToEdit) {
            success = await updateMember(memberToEdit.id, memberPayload);
        } else {
            success = await createMember({
                ...memberPayload,
                initialPassword: formData.initialPassword,
            });
        }

        if (!success) return;

        onSuccess?.();

        onClose();
    };

    const toggleProject = (projectId: string) => {
        if (selectedProjectIds.includes(projectId)) {
            setSelectedProjectIds(selectedProjectIds.filter(id => id !== projectId));
        } else {
            setSelectedProjectIds([...selectedProjectIds, projectId]);
        }
    };

    const filteredProjects = PROJECTS.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.client.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={memberToEdit ? "Edit Team Member" : "Add New Team Member"}>
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Basic Details */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">Basic Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Full Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Role *</label>
                            <select
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm appearance-none"
                            >
                                <option value="admin">Admin</option>
                                <option value="manager">Project Manager</option>
                                <option value="developer">Developer</option>

                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="john@quicksite.local"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">
                                {memberToEdit ? "Reset Password" : "Initial Password *"}
                            </label>
                            <input
                                type="password"
                                required={!memberToEdit}
                                minLength={8}
                                value={formData.initialPassword}
                                onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder={memberToEdit ? "Leave blank to keep current" : "••••••••"}
                            />
                            <p className="mt-1.5 text-[9px] font-medium text-gray-400 uppercase tracking-wider leading-relaxed">
                                Min 8 chars, with uppercase, lowercase & number
                            </p>
                        </div>
                        <div className={memberToEdit ? "col-span-2" : "col-span-2"}>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Phone</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>
                </div>
                {/* HR & Compensation */}
                <div className="space-y-4">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-primary border-b border-border pb-2">HR Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Department</label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Engineering">Engineering</option>
                                <option value="Design">Design</option>
                                <option value="Management">Management</option>
                                <option value="Marketing">Marketing</option>
                                <option value="Sales">Sales</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Salary (PKR) *</label>
                            <div className="flex items-center bg-surface-hover border border-border rounded-xl overflow-hidden focus-within:border-primary transition-all">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, salary: String(Math.max(0, Number(formData.salary) - 1000)) })}
                                    className="px-3 py-3 text-gray-400 hover:text-foreground hover:bg-surface-active transition-colors text-lg font-bold select-none"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.salary}
                                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                                    className="flex-1 bg-transparent px-2 py-3 text-foreground focus:outline-none text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    placeholder="80000"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, salary: String(Number(formData.salary) + 1000) })}
                                    className="px-3 py-3 text-gray-400 hover:text-foreground hover:bg-surface-active transition-colors text-lg font-bold select-none"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Join Date *</label>
                            <input
                                type="date"
                                required
                                value={formData.joinDate}
                                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none text-sm"
                            >
                                <option value="Active">Active</option>
                                <option value="Away">Away</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Terminated">Terminated</option>
                            </select>
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
                        className="px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest bg-primary hover:bg-orange-600 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {memberToEdit ? "Update Member" : "Add Member"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
