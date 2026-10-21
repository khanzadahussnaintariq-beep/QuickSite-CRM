'use client';

import { useState, useEffect, useRef } from 'react';
import {
    User,

    History,

    LogOut,
    Smile,
    Check,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

interface ProfileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLDivElement | null>;
}

export default function ProfileMenu({ isOpen, onClose, anchorRef }: ProfileMenuProps) {
    const { user, updateStatus, getStatus } = useAuthStore();
    const avatarUrl = useSignedUrl(user?.avatar || user?.avatar_url);
    const [statusMessage, setStatusMessage] = useState(user?.statusMessage || '');
    const [isEditingStatus, setIsEditingStatus] = useState(false);
    const [tempStatus, setTempStatus] = useState(statusMessage);
    const [isSaving, setIsSaving] = useState(false); // used on the check button while persisting
    const isAway = user?.status === 'Away';
    const menuRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Fetch fresh status from API whenever the menu opens
    useEffect(() => {
        if (isOpen) getStatus();
    }, [isOpen]);

    // Keep local state in sync when user changes in the store
    useEffect(() => {
        setStatusMessage(user?.statusMessage || '');
    }, [user?.statusMessage]);

    const handleStatusClick = () => {
        setTempStatus(statusMessage);
        setIsEditingStatus(true);
    };

    const handleStatusSave = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const msg = tempStatus.trim();
        setIsEditingStatus(false);
        if (msg === statusMessage) return;
        setIsSaving(true);
        await updateStatus({ statusMessage: msg });
        setIsSaving(false);
    };

    const handleToggleAway = async () => {
        const newStatus = isAway ? 'Active' : 'Away';
        await updateStatus({ status: newStatus });
    };

    const handleStatusKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleStatusSave();
        } else if (e.key === 'Escape') {
            setIsEditingStatus(false);
        }
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={menuRef}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="absolute right-0 mt-2 w-72 bg-surface-card border border-border rounded-xl shadow-2xl overflow-hidden z-[100]"
                >
                    {/* User Profile Summary */}
                    <div className="p-4 border-b border-border bg-surface/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-primary to-primary-hover p-0.5 shadow-lg shadow-primary/10 overflow-hidden">
                                <div className="w-full h-full bg-surface rounded-lg flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-foreground text-sm">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate">{user?.name || "User"}</p>
                                <div className="flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${isAway ? 'bg-amber-500' : 'bg-green-500'}`} />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{isAway ? 'Away' : 'Active'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Update */}
                    <div
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-colors group ${!isEditingStatus ? 'hover:bg-surface-hover cursor-pointer' : ''}`}
                        onClick={() => !isEditingStatus && handleStatusClick()}
                    >
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary/50 transition-all shrink-0">
                            <Smile size={16} />
                        </div>
                        <div className="flex-1 min-w-0" onClick={(e) => isEditingStatus && e.stopPropagation()}>
                            {isEditingStatus ? (
                                <div className="flex items-center gap-1.5 w-full">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={tempStatus}
                                        onChange={(e) => setTempStatus(e.target.value)}
                                        onKeyDown={handleStatusKeyDown}
                                        className="flex-1 min-w-0 bg-surface border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary"
                                        placeholder="What's your status?"
                                    />
                                    <button
                                        onClick={handleStatusSave}
                                        disabled={isSaving}
                                        className="p-1 hover:bg-surface-card rounded text-green-500 transition-colors shrink-0 disabled:opacity-50"
                                    >
                                        <Check size={14} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setIsEditingStatus(false);
                                        }}
                                        className="p-1 hover:bg-surface-card rounded text-red-500 transition-colors shrink-0"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full text-left">
                                    <p className="text-xs font-bold text-foreground truncate">Update your status</p>
                                    <p className="text-[10px] text-muted-foreground truncate">{user?.statusMessage || 'No status set'}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="h-px bg-border my-1" />

                    {/* Section 1: Visibility & Notifications */}
                    <div className="py-1">
                        <button
                            onClick={handleToggleAway}
                            className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-surface-hover transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <History size={16} className="text-muted-foreground group-hover:text-primary" />
                                <span className="text-xs font-medium text-foreground">Set yourself as {isAway ? 'active' : 'away'}</span>
                            </div>
                        </button>

                    </div>

                    <div className="h-px bg-border my-1" />

                    {/* Section 2: Account & Settings */}
                    <div className="py-1">
                        <button className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface-hover transition-colors group text-foreground" onClick={() => router.push('/dashboard/settings')}>
                            <User size={16} className="text-muted-foreground group-hover:text-primary" />
                            <span className="text-xs font-medium">Profile</span>
                        </button>
                    </div>

                    <div className="h-px bg-border my-1" />

                    {/* Sign out */}
                    <div className="py-1">
                        <button onClick={async () => {
                            await useAuthStore.getState().logout();
                            router.push('/sign-in');
                        }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-500/10 transition-colors group text-red-500">
                            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                            <span className="text-xs font-bold">Sign out of QuickSite</span>
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
