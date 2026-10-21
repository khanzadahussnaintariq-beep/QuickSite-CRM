'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Hash,
    Info,
    Users as UsersIcon,
    Pin,
    Bookmark,
    File,
    Search,
    Settings2,
    X,
    Layout,
    Sparkles,
    Bell,
    ExternalLink,
    Copy,
    ChevronRight,
    FolderTree,
    FileText,
    Zap,
    LogOut,
    MessageSquareText,
    Plus,
    Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PROJECTS } from '@/lib/mockData';
import ProjectChat from '@/components/dashboard/ProjectChat';
import ProjectCanvas from '@/components/dashboard/ProjectCanvas';
import ProjectFiles from '@/components/dashboard/ProjectFiles';
import CredentialsManager from '@/components/dashboard/CredentialsManager';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import { useProjectStore } from '@/store/projectStore';
import { useMemberStore } from '@/store/memberStore';
import { ticketsService } from '@/lib/api/services/tickets.service';

export default function ProjectDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;
    const { projects, fetchAllProjects, isLoading } = useProjectStore();
    const project = projects.find((p) => p.id === id) || PROJECTS.find((p) => p.id === id) || null;
    const { members: allMembers, fetchAllMembers } = useMemberStore();
    const [tickets, setTickets] = useState<any[]>([]);

    useEffect(() => {
        fetchAllProjects();
    }, [fetchAllProjects]);

    useEffect(() => {
        fetchAllMembers();
    }, [fetchAllMembers]);

    useEffect(() => {
        ticketsService.getAllTickets().then((data) => {
            const list = Array.isArray(data) ? data : (data.tickets || data.data || []);
            setTickets(list);
        }).catch(() => { });
    }, []);

    const projectAssignees = useMemo(() => {
        const projectTickets = tickets.filter((t) => t.projectId === id);
        const seen = new Set<string>();
        return projectTickets
            .filter((t) => t.assignedToId && !seen.has(t.assignedToId) && seen.add(t.assignedToId))
            .map((t) => {
                const member = allMembers.find((m) => m.id === t.assignedToId);
                return { id: t.assignedToId, name: member?.name || 'Unknown' };
            });
    }, [tickets, id, allMembers]);

    const [showRightSidebar, setShowRightSidebar] = useState(false);
    const [activeView, setActiveView] = useState('Messages');
    const [activeTab, setActiveTab] = useState<'about' | 'members' | 'pins' | 'bookmarks' | 'files' | 'settings'>('about');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showMoreMenu, setShowMoreMenu] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [isHuddleActive, setIsHuddleActive] = useState(false);
    const [showAddTabMenu, setShowAddTabMenu] = useState(false);
    const [addTabMenuPos, setAddTabMenuPos] = useState({ top: 0, left: 0 });

    const [members, setMembers] = useState([
        { id: '1', name: 'Ahmed Sheikh', role: 'Channel Manager', avatar: 'A', online: true },
        { id: '2', name: 'Anas Iqbal', role: 'Business Developer', avatar: 'A', online: true },
        { id: '3', name: 'Khanzada Tariq', role: 'Developer', avatar: 'K', online: true },
        { id: '4', name: 'Nouman M', role: 'Developer', avatar: 'N', online: false },
        { id: '5', name: 'Rimsha Fatima', role: 'Designer', avatar: 'R', online: true },
        { id: '6', name: 'Zaid', role: 'Developer', avatar: 'Z', online: false },
    ]);

    const [credentials, setCredentials] = useState<any[]>([]);

    // Load credentials from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(`project-creds-${id}`);
        if (saved) {
            try {
                setCredentials(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse credentials", e);
            }
        }
    }, [id]);

    // Save credentials to localStorage
    const handleCredentialsChange = (newCreds: any[]) => {
        setCredentials(newCreds);
        localStorage.setItem(`project-creds-${id}`, JSON.stringify(newCreds));
    };



    const addDeveloper = () => {
        const name = prompt("Enter developer name:");
        if (name) {
            const newMember = {
                id: Date.now().toString(),
                name: name,
                role: 'Developer',
                avatar: name[0].toUpperCase(),
                online: true
            };
            setMembers([...members, newMember]);
        }
    };

    if (isLoading && !project) return <div className="text-foreground p-4">Loading project...</div>;
    if (!project) return <div className="text-foreground p-4">Project not found</div>;

    return (
        <div className="h-full flex flex-col bg-background overflow-visible rounded-2xl border border-border shadow-sm">
            {/* Project Header (Slack-style with all actions) */}
            <div className="flex-none bg-surface relative">
                <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-[#F26522]/5 shadow-sm overflow-visible">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Hash size={20} className="text-primary" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-foreground tracking-tight">{project.title}</h1>

                            </div>
                            <p className="text-xs text-muted-foreground truncate max-w-[400px] font-medium">{project.description || 'Project workspace'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {/* Ticket Assignees */}
                        {projectAssignees.length > 0 && (
                            <div className="flex items-center gap-1 mr-1">
                                {projectAssignees.map((assignee) => (
                                    <div key={assignee.id} className="relative group/avatar">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center cursor-default select-none">
                                            <span className="text-xs font-bold text-primary">{assignee.name[0].toUpperCase()}</span>
                                        </div>
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                            {assignee.name}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-900 rotate-45 -translate-y-0.75" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="h-6 w-px bg-border mx-2" />

                        {/* Start Huddle */}
                        <button
                            onClick={() => setIsHuddleActive(!isHuddleActive)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors border ${isHuddleActive
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'hover:bg-surface-hover text-gray-500 hover:text-foreground border-transparent hover:border-border'
                                }`}
                            data-tooltip="Start huddle"
                            data-tooltip-pos="bottom"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" x2="12" y1="19" y2="22" />
                            </svg>
                            {isHuddleActive && <span className="text-sm font-bold">End Huddle</span>}
                        </button>

                        {/* Notifications Bell */}
                        <button
                            onClick={() => { setActiveTab('settings'); setShowRightSidebar(true); }}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors relative border border-transparent hover:border-border"
                            data-tooltip="Edit notifications"
                            data-tooltip-pos="bottom"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                            </svg>
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-surface"></span>
                        </button>

                        {/* Search */}
                        <button
                            onClick={() => setShowSearchModal(true)}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors border border-transparent hover:border-border"
                            data-tooltip="Search in channel"
                            data-tooltip-pos="bottom"
                        >
                            <Search size={18} className="text-gray-500" />
                        </button>

                        {/* More Options */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMoreMenu(!showMoreMenu)}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors border border-transparent hover:border-border"
                                title="More options"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                                    <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>

                            {showMoreMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                                    <div className="absolute top-full right-0 mt-2 w-64 bg-surface-card border border-border rounded-xl shadow-2xl z-50 py-2 scroll-sm animate-in zoom-in-95 duration-200">
                                        <button
                                            onClick={() => { setShowRightSidebar(true); setActiveTab('about'); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors font-medium group"
                                        >
                                            <Layout size={16} className="text-muted-foreground group-hover:text-primary" />
                                            Open channel details
                                        </button>
                                        <button
                                            onClick={() => { toast.loading("AI is summarizing...", { duration: 2000 }); setShowMoreMenu(false); }}
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors font-medium group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Sparkles size={16} className="text-muted-foreground group-hover:text-primary" />
                                                Summarize channel
                                            </div>
                                            <ChevronRight size={14} className="text-gray-400" />
                                        </button>
                                        <button
                                            onClick={() => { setShowRightSidebar(true); setActiveTab('settings'); setShowMoreMenu(false); }}
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-primary/5 hover:text-primary transition-colors font-medium group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Bell size={16} className="text-muted-foreground group-hover:text-primary" />
                                                Edit notifications
                                            </div>
                                            <ChevronRight size={14} className="text-gray-400" />
                                        </button>
                                        <div className="text-[10px] text-gray-500 px-11 py-0.5 font-bold uppercase tracking-wider">All new posts</div>

                                        <div className="h-px bg-border my-2 mx-2" />

                                        <button
                                            onClick={() => { setShowRightSidebar(true); setActiveTab('settings'); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors font-medium group"
                                        >
                                            <Settings2 size={16} className="text-muted-foreground group-hover:text-primary" />
                                            Edit settings
                                        </button>
                                        <div className="h-px bg-border my-2 mx-2" />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(`${window.location.origin}/dashboard/projects/${id}`);
                                                toast.success('Link copied to clipboard!');
                                                setShowMoreMenu(false);
                                            }}
                                            className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors font-medium group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Copy size={16} className="text-muted-foreground group-hover:text-primary" />
                                                Copy
                                            </div>

                                        </button>
                                        <button
                                            onClick={() => { setShowSearchModal(true); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors font-medium group"
                                        >
                                            <Search size={16} className="text-muted-foreground group-hover:text-primary" />
                                            Search in channel
                                        </button>
                                        <button
                                            onClick={() => { window.open(`/dashboard/projects/${id}`, '_blank'); setShowMoreMenu(false); }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-surface-hover transition-colors font-medium group"
                                        >
                                            <ExternalLink size={16} className="text-muted-foreground group-hover:text-primary" />
                                            Open in new window
                                        </button>
                                        <div className="h-px bg-border my-2 mx-2" />
                                        <button
                                            onClick={async () => {
                                                setShowMoreMenu(false);
                                                await useAuthStore.getState().logout();
                                                router.push('/login');
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors font-bold group"
                                        >
                                            <LogOut size={16} className="group-hover:scale-110 transition-transform" />
                                            Leave channel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-header / Channel Tabs (Slack-style) */}
                <div className="flex items-center gap-1 px-6 border-b border-border bg-background/50 backdrop-blur-sm relative group/tabs">
                    {[
                        { id: 'Messages', label: 'Messages', icon: MessageSquareText },
                        { id: 'Overview', label: 'Project Overview', icon: FileText },
                        { id: 'Credentials', label: 'Credentials', icon: Lock },
                        { id: 'Files', label: 'Files', icon: FolderTree },
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeView === tab.id;
                        return (
                            <div key={tab.id} className="relative group/tab">
                                <button
                                    onClick={() => setActiveView(tab.id)}
                                    className={`
                                        flex items-center gap-2 px-3 py-2.5 text-sm font-semibold transition-all
                                        ${isActive
                                            ? 'text-foreground'
                                            : 'text-gray-500 hover:text-foreground hover:bg-surface-hover rounded-md'
                                        }
                                    `}
                                >
                                    <Icon size={16} className={isActive ? 'text-primary' : ''} />
                                    {tab.label}
                                    {isActive && (
                                        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-t-full shadow-[0_-2px_6px_rgba(242,101,34,0.3)]" />
                                    )}
                                </button>

                                {tab.id === 'Overview' && (
                                    <div className="hidden group-hover/tab:block" />
                                )}
                            </div>
                        );
                    })}
                    <div className="w-px h-4 bg-border mx-2" />
                    <div className="relative">
                        <button
                            type="button"
                            onClick={(e) => {
                                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                let calculatedLeft = rect.left;
                                // If it would clip off the right edge, align it to the right of the button instead
                                if (calculatedLeft + 260 > window.innerWidth) {
                                    calculatedLeft = rect.right - 256; // 256px = w-64
                                }
                                setAddTabMenuPos({ top: rect.bottom + 8, left: calculatedLeft });
                                setShowAddTabMenu(prev => !prev);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-foreground hover:bg-surface-hover transition-all"
                            title="Add a view"
                        >
                            <Plus size={18} />
                        </button>

                        {showAddTabMenu && typeof document !== 'undefined' && createPortal(
                            <>
                                <div className="fixed inset-0 z-[9990]" onClick={() => setShowAddTabMenu(false)} />
                                <div
                                    className="fixed z-[9999] w-64 bg-surface-card border border-border rounded-xl shadow-2xl py-2 animate-in fade-in zoom-in-95 duration-150"
                                    style={{ top: addTabMenuPos.top, left: addTabMenuPos.left }}
                                >
                                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-4 py-2">Add a view</p>
                                    {[
                                        { icon: Zap, label: 'Timeline', desc: 'Gantt-style project timeline', view: 'Messages' },
                                        { icon: FileText, label: 'Docs', desc: 'Rich-text project notes', view: 'Files' },
                                        { icon: Sparkles, label: 'AI Summary', desc: 'Auto-generated project insights', view: 'Messages' },
                                        { icon: FolderTree, label: 'File Tree', desc: 'Organized file browser', view: 'Files' },
                                        { icon: MessageSquareText, label: 'Threads', desc: 'Focused discussion threads', view: 'Messages' },
                                    ].map(({ icon: Icon, label, desc, view }) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveView(view);
                                                setShowAddTabMenu(false);
                                                toast.success(`Switched to ${label}`);
                                            }}
                                            className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-surface-hover transition-colors text-left group"
                                        >
                                            <div className="mt-0.5 p-1.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Icon size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-foreground">{label}</p>
                                                <p className="text-xs text-gray-500">{desc}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>,
                            document.body
                        )}
                    </div>
                </div>
            </div>

            {/* Members Modal (Slack-style) */}
            {showMembersModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowMembersModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-surface-card border border-border rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-bold text-foreground"># {project.title}</h2>
                            </div>
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="p-1 hover:bg-surface-hover rounded transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-4 px-4 py-2 border-b border-border bg-surface-hover/30">
                            <button className="px-3 py-1 text-sm font-medium text-foreground border-b-2 border-[#F26522]">
                                About
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-foreground">
                                Members {members.length}
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-foreground">
                                Tabs
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-foreground">
                                Integrations
                            </button>
                            <button className="px-3 py-1 text-sm font-medium text-gray-500 hover:text-foreground">
                                Settings
                            </button>
                        </div>

                        {/* Members List */}
                        <div className="p-4 overflow-y-auto max-h-[500px]">
                            <div className="flex items-center gap-3 mb-4">
                                <input
                                    type="text"
                                    placeholder="Find members"
                                    className="flex-1 bg-surface-hover border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-[#F26522]"
                                />
                                <select className="bg-surface-hover border border-border rounded-lg px-4 py-2 text-sm text-foreground">
                                    <option>Everyone</option>
                                    <option>Online</option>
                                    <option>Offline</option>
                                </select>
                            </div>

                            <button
                                onClick={addDeveloper}
                                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-surface-hover rounded-lg transition-colors mb-4"
                            >
                                <div className="w-10 h-10 bg-[#F26522] rounded flex items-center justify-center">
                                    <UsersIcon size={20} className="text-white" />
                                </div>
                                <span className="text-sm font-medium text-foreground">Add People</span>
                            </button>

                            <div className="space-y-2">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-hover rounded-lg transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-surface-hover border border-border rounded flex items-center justify-center">
                                                    <span className="text-sm font-bold text-foreground">{member.avatar}</span>
                                                </div>
                                                {member.online && (
                                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-card" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                                                    {member.id === '1' && (
                                                        <span className="text-xs text-[#F26522] font-medium">(you)</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500">{member.role}</p>
                                            </div>
                                        </div>
                                        {member.role === 'Channel Manager' && (
                                            <span className="text-xs bg-surface-hover px-2 py-1 rounded text-gray-500">
                                                Channel Manager
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Search Modal */}
            {showSearchModal && (
                <>
                    <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm" onClick={() => setShowSearchModal(false)} />
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-surface-card border border-border rounded-xl shadow-2xl z-50">
                        <div className="p-4">
                            <input
                                type="text"
                                placeholder="Search in QuickSite..."
                                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:outline-none focus:border-[#F26522]"
                                autoFocus
                            />
                        </div>
                        <div className="p-4 text-sm text-gray-500 text-center">
                            Start typing to search messages, files, and more
                        </div>
                    </div>
                </>
            )}

            {/* Huddle Active Banner */}
            {isHuddleActive && (
                <div className="bg-green-500/10 border-b border-green-500/30 px-6 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm text-green-600 font-medium">Huddle in progress</span>
                        <span className="text-xs text-gray-500">You're in the huddle</span>
                    </div>
                    <button
                        onClick={() => setIsHuddleActive(false)}
                        className="text-xs text-green-600 hover:underline"
                    >
                        Leave huddle
                    </button>
                </div>
            )}

            {/* Main Layout */}
            <div className="flex-1 flex min-h-0 overflow-hidden">


                <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-background/30 dark:bg-[#0a0a0a]/30 backdrop-blur-sm relative transition-all duration-500">

                    {/* Background Grid for Project Section */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none z-0" />
                    {activeView === 'Messages' && <ProjectChat />}
                    {activeView === 'Overview' && <ProjectCanvas />}
                    {activeView === 'Files' && <ProjectFiles />}
                    {activeView === 'Credentials' && (
                        <div className="flex-1 overflow-y-auto pt-6 pb-12 px-6 bg-background/50 backdrop-blur-md relative z-10 custom-scrollbar">
                            <div className="max-w-5xl mx-auto space-y-6">

                                <div className="bg-surface border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                            <Lock size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-foreground">Project Credentials</h3>
                                            <p className="text-sm text-muted-foreground">Store and manage access keys, logins, and environment variables safely.</p>
                                        </div>
                                    </div>

                                    <CredentialsManager
                                        credentials={credentials}
                                        onChange={handleCredentialsChange}
                                    />

                                    <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                        <Zap size={12} className="text-primary" />
                                        <span>Encrypted data is only stored locally on your device</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Right Sidebar (Slack's details panel) - Togglable */}
                {showRightSidebar && (
                    <div className="w-80 border-l border-border bg-surface flex flex-col">
                        {/* Tabs Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h2 className="font-bold text-foreground">Details</h2>
                            <button
                                onClick={() => setShowRightSidebar(false)}
                                className="p-1 hover:bg-surface-hover rounded transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex gap-1 p-2 border-b border-border bg-surface-hover/50 overflow-x-auto whitespace-nowrap custom-scrollbar">
                            {[
                                { id: 'about', icon: Info, label: 'About' },
                                { id: 'members', icon: UsersIcon, label: 'Members' },
                                { id: 'pins', icon: Pin, label: 'Pins' },
                                { id: 'bookmarks', icon: Bookmark, label: 'Links' },
                                { id: 'files', icon: File, label: 'Files' },
                                { id: 'settings', icon: Settings2, label: 'Settings' },
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`
                                    flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors
                                    ${activeTab === tab.id
                                                ? 'bg-surface text-foreground border border-border'
                                                : 'text-gray-500 hover:text-foreground hover:bg-surface'
                                            }
                                `}
                                    >
                                        <Icon size={14} />
                                        <span className="hidden lg:inline">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>


                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {activeTab === 'about' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Description</h3>
                                        <p className="text-sm text-foreground">{project.description}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Status</h3>
                                        <span className="px-2 py-1 rounded text-xs bg-surface-hover border border-border text-foreground">
                                            {project.status}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Priority</h3>
                                        <span className={`px-2 py-1 rounded text-xs ${project.priority === 'High'
                                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                            }`}>
                                            {project.priority}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Due Date</h3>
                                        <p className="text-sm text-foreground">{project.dueDate}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Tags</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {project.tags?.map((tag) => (
                                                <span key={tag} className="px-2 py-1 bg-[#F26522]/10 text-[#F26522] rounded text-xs border border-[#F26522]/20">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'members' && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Team Members</h3>
                                    {project.team?.map((member, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-surface-hover transition-colors">
                                            <div className="w-8 h-8 rounded bg-surface-hover border border-border flex items-center justify-center">
                                                <span className="text-xs font-bold text-foreground">{member[0]}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{member}</p>
                                                <p className="text-xs text-gray-500">Developer</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'pins' && (
                                <div className="text-center py-8">
                                    <Pin size={32} className="mx-auto text-gray-500 mb-2" />
                                    <p className="text-sm text-gray-500">No pinned messages yet</p>
                                    <p className="text-xs text-gray-500 mt-1">Pin important messages to find them later</p>
                                </div>
                            )}

                            {activeTab === 'bookmarks' && (
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase">Bookmarks</h3>
                                        <button className="text-xs text-[#F26522] hover:underline">+ Add</button>
                                    </div>
                                    <div className="space-y-2">
                                        <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-surface-hover transition-colors">
                                            <Bookmark size={14} className="text-[#F26522]" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Project Requirements</p>
                                                <p className="text-xs text-gray-500">docs.google.com/...</p>
                                            </div>
                                        </a>
                                        <a href="#" className="flex items-center gap-2 p-2 rounded hover:bg-surface-hover transition-colors">
                                            <Bookmark size={14} className="text-[#F26522]" />
                                            <div>
                                                <p className="text-sm font-medium text-foreground">Figma Design</p>
                                                <p className="text-xs text-gray-500">figma.com/file/...</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'files' && (
                                <div className="space-y-3">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Shared Files</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 rounded hover:bg-surface-hover transition-colors cursor-pointer">
                                            <div className="w-8 h-8 bg-surface border border-border rounded flex items-center justify-center">
                                                <File size={16} className="text-[#F26522]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">requirements.pdf</p>
                                                <p className="text-xs text-gray-500">2.4 MB • 2 days ago</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-4">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase">Project Settings</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Notifications</label>
                                            <div className="flex items-center gap-2">
                                                <input type="checkbox" defaultChecked className="rounded" />
                                                <span className="text-sm text-foreground">Get notified for all messages</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Channel Type</label>
                                            <select className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-foreground">
                                                <option>Public</option>
                                                <option>Private</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
