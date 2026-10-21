'use client';

import { useState, useEffect, Suspense } from 'react';
import { User as UserIcon, Key, Shield, CheckCircle2, Copy, RefreshCw, EyeOff, Eye, MailWarning, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useMemberStore } from '@/store/memberStore';
import toast from 'react-hot-toast';
import { uploadFile } from '@/lib/s3';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

function SettingsContent() {
    const searchParams = useSearchParams();
    const requestedTab = searchParams.get('tab');
    const initialTab = requestedTab === 'api' || requestedTab === 'panel' ? requestedTab : 'profile';

    const { user, updateProfile, isLoading: isProfileLoading } = useAuthStore();
    const { members, fetchAllMembers, updateMember, isLoading: isMembersLoading } = useMemberStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'panel'>(initialTab);

    // Sync tab with URL if it changes
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'api', 'panel'].includes(tab)) {
            setActiveTab(tab as any);
        }
    }, [searchParams]);

    // Profile State
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const avatarUrl = useSignedUrl(user?.avatar || user?.avatar_url);

    // Pre-populate fields from store
    useEffect(() => {
        if (user) {
            setEditName(user.name || '');
            setEditEmail(user.email || '');
        }
    }, [user]);

    // Fetch members when panel tab is active
    useEffect(() => {
        if (activeTab === 'panel' && user?.role === 'admin') {
            fetchAllMembers();
        }
    }, [activeTab, user?.role, fetchAllMembers]);

    // Role-based access control for the active tab
    useEffect(() => {
        if (activeTab === 'panel' && user?.role !== 'admin') {
            setActiveTab('profile');
        }
    }, [user?.role, activeTab]);

    // API State
    const [apiKey, setApiKey] = useState('');
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleUpdateProfile = async () => {
        if (!editName || !editEmail) {
            toast.error("Name and Email are required");
            return;
        }

        await updateProfile({
            name: editName,
            email: editEmail
        });
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image too large. Please use a file smaller than 5MB.");
            return;
        }

        setIsUploading(true);
        try {
            const key = await uploadFile(file);
            const success = await updateProfile({ avatar: key });
            if (success) toast.success("Profile picture updated!");
        } catch {
            toast.error("Failed to upload avatar. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRegenerateKey = () => {
        if (confirm('Are you sure you want to revoke and regenerate this API Key? Systems using the old key will instantly fail.')) {
            const newKey = 'sk_live_' + Array.from({ length: 32 }, () => Math.random().toString(36).charAt(2)).join('');
            setApiKey(newKey);
            setIsKeyVisible(true);
            setTimeout(() => setIsKeyVisible(false), 5000);
        }
    };

    const togglePanelAccess = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Terminated' : 'Active';
        await updateMember(userId, { status: newStatus });
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        await updateMember(userId, { role: newRole.toLowerCase() });
    };

    const handleResetCredentials = (userName: string) => {
        alert(`A password reset link has been queued for ${userName}.`);
    };

    return (
        <div className="space-y-6 w-full max-w-7xl mx-auto h-full flex flex-col overflow-hidden select-none">
            <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
            />
            <div className="shrink-0 px-1">
                <h1 className="text-2xl font-black text-foreground tracking-tight">System & Access Control</h1>
                <p className="text-gray-500 font-medium text-sm">Manage profile, API integrations, and team security clearances</p>
            </div>

            <div className="md:grid md:grid-cols-[280px_1fr] gap-8 flex-1 overflow-hidden min-h-0">
                <aside className="w-[280px] min-w-[280px] max-w-[280px] space-y-2 shrink-0">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full h-[52px] flex items-center gap-3 px-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all border whitespace-nowrap ${activeTab === 'profile'
                            ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                            : 'bg-surface-card text-gray-500 border-border hover:bg-surface-hover hover:text-foreground'
                            }`}
                    >
                        <UserIcon size={18} className="shrink-0" />
                        Profile
                    </button>
                    {user?.role === 'admin' && (
                        <>
                            <button
                                onClick={() => setActiveTab('api')}
                                className={`w-full h-[52px] flex items-center gap-3 px-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all border whitespace-nowrap ${activeTab === 'api'
                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                                    : 'bg-surface-card text-gray-500 border-border hover:bg-surface-hover hover:text-foreground'
                                    }`}
                            >
                                <Key size={18} className="shrink-0" />
                                API Access
                            </button>
                            <button
                                onClick={() => setActiveTab('panel')}
                                className={`w-full h-[52px] flex items-center gap-3 px-4 text-sm font-black uppercase tracking-widest rounded-xl transition-all border whitespace-nowrap ${activeTab === 'panel'
                                    ? 'bg-primary/10 text-primary border-primary/20 shadow-inner'
                                    : 'bg-surface-card text-gray-500 border-border hover:bg-surface-hover hover:text-foreground'
                                    }`}
                            >
                                <Shield size={18} className="shrink-0" />
                                Panel Access
                            </button>

                        </>
                    )}
                </aside>

                <main className="min-w-0 bg-surface-card border border-border rounded-2xl overflow-hidden flex flex-col h-full shadow-sm">
                    <div className="flex-1 overflow-y-scroll overflow-x-hidden custom-scrollbar min-w-0 p-8 space-y-10">

                        {activeTab === 'profile' && (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-border">
                                    <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                                        <div className="w-24 h-24 rounded-2xl bg-surface-hover border-2 border-dashed border-border flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 relative">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-3xl font-black text-gray-400 group-hover:text-primary transition-colors">
                                                    {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'AD'}
                                                </span>
                                            )}
                                            {isUploading && (
                                                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                                                    <Loader2 size={24} className="animate-spin text-white" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all scale-90 group-hover:scale-100 flex items-center justify-center">
                                            <RefreshCw size={14} className={isUploading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <h2 className="text-xl font-black tracking-tight text-foreground">{user?.name}</h2>
                                        <p className="text-primary font-black uppercase tracking-widest text-[10px] mt-1">{user?.role === 'admin' ? 'Super Admin Account' : 'Team Member Account'}</p>
                                        <p className="text-gray-500 text-sm mt-2 font-medium">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3.5 text-foreground font-bold text-sm focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                                        <input
                                            type="email"
                                            value={editEmail}
                                            onChange={(e) => setEditEmail(e.target.value)}
                                            className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3.5 text-foreground font-bold text-sm focus:outline-none focus:border-primary/50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Panel Role</label>
                                        <div className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3.5 text-gray-400 font-bold text-sm cursor-not-allowed uppercase tracking-wider">
                                            {user?.role || 'Member'}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Timezone</label>
                                        <select className="w-full bg-surface-hover border border-border rounded-xl px-4 py-3.5 text-foreground font-bold text-sm focus:outline-none focus:border-primary/50 appearance-none">
                                            <option>UTC+05:00 (Karachi)</option>
                                            <option>UTC+00:00 (GMT)</option>
                                            <option>UTC-05:00 (EST)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={isProfileLoading}
                                        className="px-10 py-4 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-black tracking-widest uppercase shadow-xl shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isProfileLoading && <Loader2 size={16} className="animate-spin" />}
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'api' && (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                <div>
                                    <h2 className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
                                        Production API Key
                                    </h2>
                                    <p className="text-sm text-gray-500 font-medium mt-1">
                                        Use this key to authenticate external services and scripts. Keep it secret.
                                    </p>
                                </div>

                                <div className="p-8 bg-background border border-border rounded-2xl">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Secret Key Identifier</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 relative">
                                            <input
                                                type={isKeyVisible ? "text" : "password"}
                                                value={apiKey}
                                                placeholder="No API key configured"
                                                readOnly
                                                className="w-full bg-surface-hover border border-border rounded-xl pl-5 pr-14 py-4 text-foreground font-mono text-sm focus:outline-none focus:border-primary/30"
                                            />
                                            <button
                                                onClick={() => setIsKeyVisible(!isKeyVisible)}
                                                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                                            >
                                                {isKeyVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                        <button
                                            onClick={handleCopy}
                                            disabled={!apiKey || copied}
                                            className="flex items-center justify-center gap-2 px-8 py-4 bg-surface-hover hover:bg-background text-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all border border-border shadow-sm active:scale-95"
                                        >
                                            {copied ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                            {copied ? 'Copied' : 'Copy Key'}
                                        </button>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-border">
                                    <h3 className="text-sm font-bold text-foreground mb-4">Security & Danger Zone</h3>
                                    <div className="p-6 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">Revoke & Regenerate Key</p>
                                            <p className="text-xs font-medium text-red-600/70 dark:text-red-400/70 mt-1 max-w-md">Warning: This will instantly break all current API connections for this environment.</p>
                                        </div>
                                        <button
                                            onClick={handleRegenerateKey}
                                            className="px-6 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-700 dark:text-red-400 font-black text-xs uppercase tracking-widest rounded-xl transition-colors shrink-0 flex items-center gap-2 border border-red-200 dark:border-red-500/10"
                                        >
                                            <RefreshCw size={14} />
                                            Regenerate
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'panel' && user?.role === 'admin' && (
                            <div className="space-y-10 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between pb-6 border-b border-border">
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight text-foreground">Team Access Matrix</h2>
                                        <p className="text-sm text-gray-500 font-medium mt-1">Manage panel credentials and security roles for registered members.</p>
                                    </div>
                                    {isMembersLoading && <Loader2 size={20} className="animate-spin text-primary" />}
                                </div>

                                <div className="overflow-x-auto min-w-0">
                                    <table className="w-full text-left border-collapse min-w-[700px]">
                                        <thead>
                                            <tr className="border-b border-border/50">
                                                <th className="pb-5 pr-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Identity</th>
                                                <th className="pb-5 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                <th className="pb-5 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400">Security Clearance</th>
                                                <th className="pb-5 pl-4 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {members.filter(m => m.id !== user?.id).map((member) => (
                                                <tr key={member.id} className="group hover:bg-surface-hover/20 transition-colors">
                                                    <td className="py-6 pr-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-11 h-11 rounded-xl bg-surface-hover border border-border flex items-center justify-center font-black text-gray-400 group-hover:text-primary transition-colors shrink-0">
                                                                {member.name ? member.name.charAt(0) : 'U'}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
                                                                <p className="text-xs text-gray-500 truncate">{member.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-6 px-4">
                                                        <button
                                                            onClick={() => togglePanelAccess(member.id, member.status || 'Active')}
                                                            disabled={isMembersLoading}
                                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${member.status === 'Active'
                                                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 active:bg-emerald-500/20'
                                                                : 'bg-red-500/5 text-red-600 dark:text-red-400 border border-red-500/10 active:bg-red-500/10'
                                                                }`}
                                                        >
                                                            <div className={`w-1.5 h-1.5 rounded-full ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
                                                            {member.status === 'Active' ? 'Authorized' : 'Restricted'}
                                                        </button>
                                                    </td>

                                                    <td className="py-6 px-4">
                                                        <select
                                                            value={member.role?.toLowerCase()}
                                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                                            disabled={member.status !== 'Active' || isMembersLoading}
                                                            className="bg-surface-hover border border-border text-foreground text-xs font-bold rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-all disabled:opacity-30 disabled:grayscale appearance-none min-w-[140px]"
                                                        >
                                                            <option value="admin">Admin</option>
                                                            <option value="manager">Project Manager</option>
                                                            <option value="developer">Developer</option>
                                                        </select>
                                                    </td>

                                                    <td className="py-6 pl-4 text-right">
                                                        <button
                                                            onClick={() => handleResetCredentials(member.name)}
                                                            className="p-3 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-transparent hover:border-primary/20"
                                                            title="Send Credentials Reset"
                                                        >
                                                            <MailWarning size={20} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                    </div>
                </main>
            </div>
        </div>
    );
}

export default function SettingsPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-primary" /></div>}>
            <SettingsContent />
        </Suspense>
    );
}
