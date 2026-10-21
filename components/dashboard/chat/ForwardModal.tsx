'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Search, Send, Hash, User } from 'lucide-react';
import { PROJECTS, USERS } from '@/lib/mockData';

interface ForwardModalProps {
    isOpen: boolean;
    onClose: () => void;
    messageContent: string;
    onForward: (destinationId: string) => void;
}

export default function ForwardModal({ isOpen, onClose, messageContent, onForward }: ForwardModalProps) {
    const [search, setSearch] = useState('');

    const filteredProjects = PROJECTS.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
    const filteredUsers = USERS.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Forward Message">
            <div className="space-y-6">
                <div className="bg-surface-hover/50 border border-border rounded-xl p-4 italic text-sm text-gray-400">
                    "{messageContent}"
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search for channels or people..."
                        className="w-full bg-surface-hover border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {filteredProjects.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">Projects / Channels</h3>
                            <div className="space-y-1">
                                {filteredProjects.map(p => (
                                    <button
                                        key={p.id}
                                        onClick={() => onForward(p.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Hash size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{p.title}</span>
                                        </div>
                                        <Send size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {filteredUsers.length > 0 && (
                        <div>
                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 px-2">People</h3>
                            <div className="space-y-1">
                                {filteredUsers.map(u => (
                                    <button
                                        key={u.id}
                                        onClick={() => onForward(u.id)}
                                        className="w-full flex items-center justify-between p-3 hover:bg-surface-hover rounded-xl transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-gray-500 font-bold text-xs">
                                                {u.avatar}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{u.name}</span>
                                        </div>
                                        <Send size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
