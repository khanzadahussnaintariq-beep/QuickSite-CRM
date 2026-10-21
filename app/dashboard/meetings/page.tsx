'use client';

import { useState, useMemo, useEffect } from 'react';
import { Plus, Video, Calendar as CalendarIcon, Clock, Search, Link as LinkIcon, Pencil, Trash2, Loader2 } from 'lucide-react';
import AddMeetingModal from '@/components/dashboard/meetings/AddMeetingModal';
import MeetingDetailsPanel from '@/components/dashboard/meetings/MeetingDetailsPanel';
import { useMeetingStore, Meeting } from '@/store/meetingStore';
import { useAuthStore } from '@/store/authStore';
import { useMemberStore } from '@/store/memberStore';
import { useClientStore } from '@/store/clientStore';
import { useProjectStore } from '@/store/projectStore';

export default function MeetingsPage() {
    const { meetings, fetchMeetings, deleteMeeting, isLoading } = useMeetingStore();
    const { user } = useAuthStore();
    const isAdmin = user?.accessRole === 'Admin' || user?.role === 'admin';
    const { members, fetchAllMembers } = useMemberStore();
    const { clients, fetchAllClients } = useClientStore();
    const { projects, fetchAllProjects } = useProjectStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('All');
    const [typeFilter, setTypeFilter] = useState<string>('All');
    const [employeeFilter, setEmployeeFilter] = useState<string>('All');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchMeetings();      // fetch all meetings; "Mine" filter is applied client-side
        fetchAllMembers();
        fetchAllClients();
        fetchAllProjects();
    }, [fetchMeetings, fetchAllMembers, fetchAllClients, fetchAllProjects]);

    const handleDelete = async (meetingId: string) => {
        const success = await deleteMeeting(meetingId);
        if (success) {
            setPendingDeleteId(null);
            if (selectedMeeting?.id === meetingId) setSelectedMeeting(null);
        }
    };

    const handleEdit = (meeting: Meeting) => {
        setSelectedMeeting(null);
        setEditingMeeting(meeting);
    };

    const meetingAssignee = useMemo(() => {
        if (!selectedMeeting) return undefined;
        return members.find(u => u.id === selectedMeeting.assignedTo);
    }, [selectedMeeting, members]);

    const meetingOrganizer = useMemo(() => {
        if (!selectedMeeting) return undefined;
        return members.find(u => u.id === selectedMeeting.organizer);
    }, [selectedMeeting, members]);

    const meetingClient = useMemo(() => {
        if (!selectedMeeting?.relatedClient) return undefined;
        return clients.find(c => c.id === selectedMeeting.relatedClient);
    }, [selectedMeeting, clients]);

    const meetingProject = useMemo(() => {
        if (!selectedMeeting?.relatedProject) return undefined;
        return projects.find(p => p.id === selectedMeeting.relatedProject);
    }, [selectedMeeting, projects]);

    const filteredMeetings = useMemo(() => {
        return meetings.filter(meeting => {
            const title = meeting.title?.toLowerCase() || '';
            const purpose = meeting.purpose?.toLowerCase() || '';
            const search = searchQuery.toLowerCase();
            const matchesSearch = title.includes(search) || purpose.includes(search);
            const matchesStatus = statusFilter === 'All' || meeting.status === statusFilter;
            const matchesType = typeFilter === 'All' || meeting.type === typeFilter;

            let matchesEmployee = true;
            if (isAdmin && employeeFilter !== 'All') {
                matchesEmployee = meeting.assignedTo === employeeFilter || meeting.organizer === employeeFilter;
            }

            const isMine = isAdmin ? true : (meeting.assignedTo === user?.id || meeting.organizer === user?.id);

            return matchesSearch && matchesStatus && matchesType && isMine && matchesEmployee;
        });
    }, [meetings, searchQuery, statusFilter, typeFilter, employeeFilter, user?.id, isAdmin]);

    const renderStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Upcoming': 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20',
            'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
            'Rescheduled': 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
            'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 border-red-200 dark:border-red-500/20',
        };
        const style = styles[status] || styles['Upcoming'];
        return <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider border ${style}`}>{status}</span>;
    };

    return (
        <div className="space-y-6 h-full flex flex-col overflow-hidden">

            {/* Header & Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-foreground">Meetings & Scheduling</h1>
                    <p className="text-gray-500 font-medium text-sm">Manage client calls, internal syncs, and project links</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find meetings..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm w-45 lg:w-60"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-background border border-border text-foreground text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="Rescheduled">Rescheduled</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="bg-background border border-border text-foreground text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer hidden md:block"
                    >
                        <option value="All">All Types</option>
                        <option value="Internal">Internal</option>
                        <option value="Client Related">Client Related</option>
                        <option value="Project Related">Project Related</option>
                    </select>

                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <select
                                value={employeeFilter}
                                onChange={(e) => setEmployeeFilter(e.target.value)}
                                className="bg-background border border-border text-foreground text-sm font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-primary transition-colors cursor-pointer hidden md:block"
                            >
                                <option value="All">All Employees</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>{member.name}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setEmployeeFilter(employeeFilter === user?.id ? 'All' : (user?.id || 'All'))}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-colors border ${employeeFilter === user?.id ? 'bg-primary text-white border-primary' : 'bg-background text-foreground border-border hover:border-primary'}`}
                            >
                                My Meetings
                            </button>
                        </div>
                    )}

                    <button
                        onClick={() => { setEditingMeeting(null); setIsAddModalOpen(true); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-xl text-sm font-black tracking-widest uppercase shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all"
                    >
                        <Plus size={16} />
                        <span className="hidden sm:inline">Add Meeting</span>
                    </button>
                </div>
            </div>

            {/* Grid Area - Scrollable */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2">
                {isLoading && meetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-background">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground font-bold">Loading Meetings...</p>
                    </div>
                ) : filteredMeetings.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMeetings.map(meeting => {
                            const assignedUser = members.find(u => u.id === meeting.assignedTo);
                            const connectedClient = meeting.relatedClient
                                ? clients.find(c => c.id === meeting.relatedClient)?.company
                                : null;
                            const connectedProject = meeting.relatedProject
                                ? projects.find(p => p.id === meeting.relatedProject)?.title
                                : null;
                            const contextString = connectedClient || connectedProject || meeting.department || 'General';
                            const isOwner = user?.id === meeting.organizer || isAdmin;
                            const isPendingDelete = pendingDeleteId === meeting.id;

                            return (
                                <div key={meeting.id} className="bg-surface-card border border-border rounded-xl p-5 hover:border-primary/50 transition-all group relative flex flex-col h-full shadow-sm hover:shadow-md">

                                    {/* Delete Confirmation Overlay */}
                                    {isPendingDelete && (
                                        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center gap-4 z-10">
                                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                                                <Trash2 size={20} className="text-red-500" />
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-sm font-black text-foreground mb-1">Delete meeting?</p>
                                                <p className="text-xs text-gray-500 line-clamp-1">{meeting.title}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setPendingDeleteId(null)}
                                                    className="px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground bg-surface-hover rounded-lg border border-border transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(meeting.id)}
                                                    className="px-4 py-2 text-xs font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                                            <Video size={18} />
                                        </div>
                                        <div className="flex flex-col items-end gap-1.5">
                                            {renderStatusBadge(meeting.status)}
                                            <span className="px-2 py-0.5 bg-background text-gray-500 dark:text-zinc-400 text-[9px] font-black uppercase tracking-wider rounded border border-border">
                                                {meeting.type}
                                            </span>
                                            {/* Owner-only action icons — appear on hover */}
                                            {isOwner && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleEdit(meeting); }}
                                                        title="Edit meeting"
                                                        className="p-1.5 rounded-lg bg-surface-hover hover:bg-blue-500/10 hover:text-blue-500 text-gray-400 transition-colors"
                                                    >
                                                        <Pencil size={12} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setPendingDeleteId(meeting.id); }}
                                                        title="Delete meeting"
                                                        className="p-1.5 rounded-lg bg-surface-hover hover:bg-red-500/10 hover:text-red-500 text-gray-400 transition-colors"
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <h3
                                        className="text-foreground font-black tracking-tight text-lg leading-tight mb-1 cursor-pointer hover:text-primary transition-colors"
                                        onClick={() => setSelectedMeeting(meeting)}
                                    >
                                        {meeting.title}
                                    </h3>
                                    <p className="text-[10px] font-black tracking-widest uppercase text-gray-400 mb-4 line-clamp-1 border-l-2 border-primary/50 pl-2">
                                        {contextString}
                                    </p>

                                    <div className="flex items-center gap-3 mb-4 bg-background/50 p-2.5 rounded-xl border border-border">
                                        <div className="w-7 h-7 rounded-lg bg-surface-hover flex items-center justify-center text-[10px] font-bold text-gray-500 border border-border">
                                            {assignedUser?.name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary">Assigned To</span>
                                            <span className="text-xs font-bold text-foreground">{assignedUser?.name || 'Unassigned'}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 mb-6 flex-1">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <CalendarIcon size={14} className="text-gray-400" />
                                            {meeting.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                            <Clock size={14} className="text-gray-400" />
                                            {meeting.time} <span className="text-xs opacity-50">({meeting.duration})</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-border">
                                        <button
                                            onClick={() => setSelectedMeeting(meeting)}
                                            className="py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-foreground bg-surface-hover/50 hover:bg-surface-hover rounded-lg transition-colors border border-transparent hover:border-border"
                                        >
                                            Details
                                        </button>
                                        {meeting.link ? (
                                            <a
                                                href={meeting.link}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="py-2 flex items-center justify-center gap-1.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-black uppercase tracking-widest rounded-lg transition-colors border border-primary/20 hover:border-primary"
                                            >
                                                Join <LinkIcon size={10} />
                                            </a>
                                        ) : (
                                            <span className="py-2 flex items-center justify-center text-xs font-black uppercase tracking-widest text-gray-400 rounded-lg border border-border">
                                                No Link
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-surface-card bg-opacity-50 mt-4">
                        <Video size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                        <h3 className="text-lg font-bold text-foreground mb-1">No meetings found</h3>
                        <p className="text-sm text-gray-500">You have no meetings assigned to you or organised by you.</p>
                    </div>
                )}
            </div>

            {/* Add / Edit Modal */}
            <AddMeetingModal
                isOpen={isAddModalOpen || !!editingMeeting}
                onClose={() => { setIsAddModalOpen(false); setEditingMeeting(null); }}
                users={members}
                projects={projects}
                clients={clients}
                initialData={editingMeeting}
                currentUserId={user?.id}
            />

            {/* Detail Side Panel */}
            <MeetingDetailsPanel
                isOpen={!!selectedMeeting}
                onClose={() => setSelectedMeeting(null)}
                meeting={selectedMeeting}
                assignee={meetingAssignee}
                organizer={meetingOrganizer}
                client={meetingClient}
                project={meetingProject}
                isOwner={user?.id === selectedMeeting?.organizer || isAdmin}
                onEdit={() => selectedMeeting && handleEdit(selectedMeeting)}
                onDelete={() => selectedMeeting && handleDelete(selectedMeeting.id)}
            />
        </div>
    );
}
