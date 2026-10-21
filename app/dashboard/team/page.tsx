'use client';

import { useState, useMemo, useEffect } from 'react';
import { User } from '@/lib/mockData';
import AddMemberModal from '@/components/dashboard/team/AddMemberModal';
import MemberDetailsPanel from '@/components/dashboard/team/MemberDetailsPanel';
import { useAuthStore } from '@/store/authStore';
import { useMemberStore } from '@/store/memberStore';
import { useProjectStore } from '@/store/projectStore';
import { ticketsService } from '@/lib/api/services/tickets.service';
import { useRouter } from 'next/navigation';
import { Search, Plus, Loader2 } from 'lucide-react';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';

function MemberAvatar({ user }: { user: any }) {
    const avatarUrl = useSignedUrl(user.avatar || '');
    if (avatarUrl) {
        return (
            <div className="w-12 h-12 rounded-full overflow-hidden border border-border shrink-0">
                <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div className="w-12 h-12 rounded-full bg-surface-hover border border-border flex items-center justify-center text-xl font-black text-gray-400 group-hover:text-primary transition-colors shrink-0">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
    );
}
export default function TeamPage() {
    const { user, isLoading: authLoading } = useAuthStore();
    const { members, fetchAllMembers, deleteMember, isLoading: membersLoading } = useMemberStore();
    const { projects, fetchAllProjects } = useProjectStore();
    const router = useRouter();

    const [allTickets, setAllTickets] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
    const [memberToEdit, setMemberToEdit] = useState<User | null>(null);

    const selectedMember = useMemo(() =>
        members.find(m => m.id === selectedMemberId) || null
        , [members, selectedMemberId]);

    useEffect(() => {
        if (!authLoading && user) {
            if (user.role !== 'admin') {
                router.push('/dashboard');
                return;
            }
            fetchAllMembers();
            fetchAllProjects();
        }
    }, [user, authLoading]);

    useEffect(() => {
        if (!authLoading && user && user.role === 'admin') {
            ticketsService.getAllTickets().then((data) => {
                const list = Array.isArray(data) ? data : (data.tickets || data.data || []);
                setAllTickets(list);
            }).catch(() => { });
        }
    }, [user, authLoading]);

    const filteredMembers = useMemo(() => {
        if (!searchQuery.trim()) return members;
        const q = searchQuery.toLowerCase();
        return members.filter(m =>
            m.name.toLowerCase().includes(q) ||
            m.role.toLowerCase().includes(q)
        );
    }, [members, searchQuery]);

    const isHighPriority = (p: string) => {
        const l = p.toLowerCase();
        return l === 'high' || l === 'critical' || l === 'urgent';
    };

    const selectedUserTickets = useMemo(() => {
        if (!selectedMember) return [];
        return allTickets.filter(t => t.assignedToId === selectedMember.id);
    }, [selectedMember, allTickets]);

    const selectedUserProjects = useMemo(() => {
        if (!selectedMember) return [];
        const projectIds = new Set(
            allTickets.filter(t => t.assignedToId === selectedMember.id).map(t => t.projectId).filter(Boolean)
        );
        return projects.filter(p => projectIds.has(p.id));
    }, [selectedMember, allTickets, projects]);

    // Redirect if not admin handled by useEffect above

    // Show loading only if we're doing the initial auth check and don't have a user yet
    // This prevents the whole page from flickering to a spinner when adding a member
    if (authLoading && !user) {
        return (
            <div className="h-full w-full flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full" />
                    <p className="text-gray-500 font-medium">Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (user && user.role !== 'admin') {
        return null;
    }

    // Handle adding/updating member
    const handleSuccess = () => {
        fetchAllMembers();
        setMemberToEdit(null);
    };

    const handleEdit = (member: User) => {
        setMemberToEdit(member);
        setIsAddModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to remove this team member?')) {
            const success = await deleteMember(id);
            if (success) {
                if (selectedMemberId === id) setSelectedMemberId(null);
            }
        }
    };


    return (
        <div className="space-y-6 h-full flex flex-col overflow-hidden">

            {/* Header & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Team Workload</h1>
                    <p className="text-gray-500 text-sm font-medium">Monitor team capacity, tickets, and details</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find member..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm min-w-[200px]"
                        />
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Member</span>
                    </button>
                </div>
            </div>

            {/* Grid Area - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
                {membersLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-background">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-bold">Loading team...</p>
                    </div>
                ) : filteredMembers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMembers.map(user => {
                            const userTickets = allTickets.filter(t => t.assignedToId === user.id);
                            const highPriority = userTickets.filter(t => isHighPriority(t.priority || '')).length;
                            const activeProjectCount = new Set(userTickets.map(t => t.projectId).filter(Boolean)).size;

                            return (
                                <button
                                    key={user.id}
                                    onClick={() => setSelectedMemberId(user.id)}
                                    className="text-left bg-surface-card border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/[0.03] rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110" />

                                    {/* User Head */}
                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                        <div className="flex items-center gap-3">
                                            <MemberAvatar user={user} />
                                            <div>
                                                <h3 className="text-foreground font-bold tracking-tight">{user.name}</h3>
                                                <p className="text-xs font-semibold text-primary">{user.role.toUpperCase()}</p>
                                            </div>
                                        </div>
                                        {/* Status Dot */}
                                        <div
                                            className={`w-2.5 h-2.5 rounded-full shadow-sm ${user.status === 'Active' ? 'bg-emerald-500' :
                                                user.status === 'Away' ? 'bg-amber-500' : 'bg-red-500'
                                                }`}
                                            title={user.status}
                                        />
                                    </div>

                                    {/* Stats block */}
                                    <div className="space-y-3 relative z-10 bg-background dark:bg-surface-hover/50 p-3 rounded-xl border border-border">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Total Tickets</span>
                                            <span className="text-foreground font-black bg-background px-2 py-0.5 rounded-md">{userTickets.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">High Priority</span>
                                            <span className="text-red-500 font-black bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md">{highPriority}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Projects</span>
                                            <span className="text-foreground font-black bg-background px-2 py-0.5 rounded-md">{activeProjectCount}</span>
                                        </div>
                                    </div>

                                    {/* Capacity Load visual */}
                                    <div className="pt-4 relative z-10">
                                        <div className="flex justify-between mb-1.5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Capacity Load</p>
                                            <p className="text-[10px] font-black text-gray-500">{Math.min(userTickets.length * 20, 100)}%</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${userTickets.length > 3 ? 'bg-red-500' :
                                                    userTickets.length > 1 ? 'bg-amber-500' : 'bg-emerald-500'
                                                    }`}
                                                style={{ width: `${Math.min(userTickets.length * 20, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-zinc-50 dark:bg-surface-hover/30">
                        <p className="text-sm font-semibold text-gray-400">No team members found</p>
                    </div>
                )}
            </div>

            {/* Overlays */}
            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    setMemberToEdit(null);
                }}
                onSuccess={handleSuccess}
                memberToEdit={memberToEdit}
            />

            <MemberDetailsPanel
                isOpen={!!selectedMemberId}
                onClose={() => setSelectedMemberId(null)}
                member={selectedMember as User}
                projects={selectedUserProjects as any}
                tickets={selectedUserTickets as any}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

        </div>
    );
}
