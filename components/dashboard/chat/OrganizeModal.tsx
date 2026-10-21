'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Tag, Folder, Plus, Check } from 'lucide-react';

interface OrganizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOrganize: (category: string) => void;
}

export default function OrganizeModal({ isOpen, onClose, onOrganize }: OrganizeModalProps) {
    const categories = [
        { label: 'Important', color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Technical', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Design', color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { label: 'Requirement', color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { label: 'Feedback', color: 'text-green-500', bg: 'bg-green-500/10' },
    ];

    const folders = ['Project Assets', 'Meeting Notes', 'Client Briefs'];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Organize Message">
            <div className="space-y-6">
                <div>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Tags / Labels</h3>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => onOrganize(cat.label)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-border hover:border-primary transition-all group ${cat.bg}`}
                            >
                                <Tag size={14} className={cat.color} />
                                <span className="text-sm font-medium text-foreground">{cat.label}</span>
                            </button>
                        ))}
                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-dashed border-border hover:border-primary transition-all text-gray-500">
                            <Plus size={14} />
                            <span className="text-sm font-medium">New Tag</span>
                        </button>
                    </div>
                </div>

                <div>
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 px-2">Move to Folder</h3>
                    <div className="space-y-1">
                        {folders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => onOrganize(folder)}
                                className="w-full flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <Folder size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                                    <span className="text-sm font-medium text-foreground">{folder}</span>
                                </div>
                                <Check size={16} className="text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                        <button className="w-full flex items-center gap-3 p-3 text-primary hover:bg-primary/5 rounded-xl transition-colors text-sm font-medium">
                            <Plus size={18} />
                            <span>Create New Folder</span>
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
