'use client';

import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Copy, Check, X as CloseIcon } from 'lucide-react';

export interface Credential {
    id: string;
    title: string;
    username: string; // Used for Email/Link
    value: string; // Password or Key
    type: 'password' | 'text' | 'key';
}

interface CredentialsManagerProps {
    credentials: Credential[];
    onChange: (credentials: Credential[]) => void;
}

export default function CredentialsManager({ credentials, onChange }: CredentialsManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newCred, setNewCred] = useState<Omit<Credential, 'id'>>({
        title: '',
        username: '',
        value: '',
        type: 'password'
    });

    const startAdding = () => {
        setIsAdding(true);
        setNewCred({
            title: '',
            username: '',
            value: '',
            type: 'password'
        });
    };

    const confirmAdd = () => {
        if (!newCred.title || !newCred.value) {
            alert("Title and Password are required.");
            return;
        }

        const credentialToAdd: Credential = {
            ...newCred,
            id: Math.random().toString(36).substr(2, 9),
        };

        onChange([...credentials, credentialToAdd]);
        setIsAdding(false);
    };

    const cancelAdd = () => {
        setIsAdding(false);
    };

    const removeCredential = (id: string) => {
        if (confirm('Delete this credential?')) {
            onChange(credentials.filter(c => c.id !== id));
        }
    };

    const togglePasswordVisibility = (id: string) => {
        onChange(credentials.map(c =>
            c.id === id ? { ...c, type: c.type === 'password' ? 'text' : 'password' } : c
        ));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500">Access & Credentials</h3>
                {!isAdding && (
                    <button
                        type="button"
                        onClick={startAdding}
                        className="group flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl transition-all duration-300 transform active:scale-95 shadow-lg shadow-primary/20 font-bold text-xs uppercase tracking-widest"
                    >
                        <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
                        Add New Access
                    </button>
                )}
            </div>

            {/* Credentials Table */}
            <div className="w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
                <table className="w-full border-collapse">
                    <tbody className="divide-y divide-border">
                        {credentials.map((cred) => (
                            <tr key={cred.id} className="group hover:bg-surface transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-bold text-foreground">{cred.title}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm text-gray-500 font-medium">{cred.username || '—'}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-primary font-bold">
                                            {cred.type === 'password' ? '••••••••' : cred.value}
                                        </span>
                                        <button 
                                            type="button"
                                            onClick={() => togglePasswordVisibility(cred.id)}
                                            className="p-1 hover:bg-primary/10 rounded transition-colors text-gray-400 hover:text-primary"
                                        >
                                            {cred.type === 'password' ? <Eye size={14} /> : <EyeOff size={14} />}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <button
                                        type="button"
                                        onClick={() => removeCredential(cred.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {credentials.length === 0 && !isAdding && (
                            <tr>
                                <td colSpan={4} className="py-24 text-center">
                                    <div 
                                        onClick={startAdding}
                                        className="flex flex-col items-center cursor-pointer group"
                                    >
                                        <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
                                            <Plus size={32} className="text-gray-400 group-hover:text-primary" />
                                        </div>
                                        <p className="text-gray-500 font-bold text-base uppercase tracking-widest">No credentials found</p>
                                        <p className="text-xs text-gray-400 mt-2 font-medium">Click here to add your first project access</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* New Credential Input Form (Visible when adding) */}
            {isAdding && (
                <div className="bg-background border-2 border-primary/20 rounded-2xl p-6 animate-in slide-in-from-top-2 duration-300 shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-primary mb-4">Entering New Credential Details...</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Name / Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Server Admin"
                                value={newCred.title}
                                onChange={(e) => setNewCred({ ...newCred, title: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none shadow-sm"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Email / Link</label>
                            <input
                                type="text"
                                placeholder="email@example.com"
                                value={newCred.username}
                                onChange={(e) => setNewCred({ ...newCred, username: e.target.value })}
                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none shadow-sm"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase text-muted-foreground ml-1 flex items-center gap-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={newCred.type === 'password' ? 'password' : 'text'}
                                    placeholder="••••••••"
                                    value={newCred.value}
                                    onChange={(e) => setNewCred({ ...newCred, value: e.target.value })}
                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:border-primary outline-none shadow-sm pr-10"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setNewCred({ ...newCred, type: newCred.type === 'password' ? 'text' : 'password' })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                >
                                    {newCred.type === 'password' ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={cancelAdd}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-border text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-bold"
                        >
                            <CloseIcon size={14} />
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmAdd}
                            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-hover shadow-xl shadow-primary/20 transform active:scale-95 transition-all font-bold"
                        >
                            <Check size={14} />
                            Confirm Add
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}