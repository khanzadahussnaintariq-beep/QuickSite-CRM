'use client';

import { useEffect, useState, useMemo } from 'react';
import { Plus, Filter, Loader2 } from 'lucide-react';
import ProjectCard from '@/components/dashboard/ProjectCard';
import NewProjectModal from '@/components/dashboard/NewProjectModal';
import { useAppContext } from '@/context/AppContext';
import { useProjectStore } from '@/store/projectStore';
import { useClientStore } from '@/store/clientStore';
import { useAuthStore } from '@/store/authStore';
import { useMemberStore } from '@/store/memberStore';
import { ticketsService } from '@/lib/api/services/tickets.service';
import toast from 'react-hot-toast';


export default function ProjectsPage() {
    const { selectedId } = useAppContext();
    const { user } = useAuthStore();
    const { projects, fetchAllProjects, updateProject, deleteProject, isLoading, error } = useProjectStore();
    const { fetchAllClients } = useClientStore();
    const { members: allMembers, fetchAllMembers } = useMemberStore();
    const [statusFilter, setStatusFilter] = useState('All');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<any | null>(null);
    const [allTickets, setAllTickets] = useState<any[]>([]);
    const isDeveloper = `${user?.role || ''}`.toLowerCase() === 'developer';

    useEffect(() => {
        fetchAllProjects();
        fetchAllClients();
        if (!isDeveloper) fetchAllMembers();
    }, [fetchAllProjects, fetchAllClients, fetchAllMembers, isDeveloper]);

    useEffect(() => {
        ticketsService.getAllTickets().then((data) => {
            const list = Array.isArray(data) ? data : (data.tickets || data.data || []);
            setAllTickets(list);
        }).catch(() => { });
    }, []);

    const developerProjectIds = useMemo(() => {
        if (!isDeveloper || !user?.id) return new Set<string>();
        const projectIds = new Set<string>();
        for (const ticket of allTickets) {
            if (ticket.projectId && ticket.assignedToId === user.id) {
                projectIds.add(ticket.projectId);
            }
        }
        return projectIds;
    }, [allTickets, isDeveloper, user?.id]);

    const assigneesByProject = useMemo(() => {
        const map: Record<string, { id: string; name: string }[]> = {};
        for (const ticket of allTickets) {
            if (!ticket.projectId || !ticket.assignedToId) continue;
            if (!map[ticket.projectId]) map[ticket.projectId] = [];
            if (map[ticket.projectId].some((a) => a.id === ticket.assignedToId)) continue;
            
            let name = 'Unknown';
            if (ticket.assignedToId === user?.id) {
                name = user?.name || 'You';
            } else {
                const member = allMembers.find((m) => m.id === ticket.assignedToId);
                if (member) name = member.name;
            }
            
            map[ticket.projectId].push({ id: ticket.assignedToId, name });
        }
        return map;
    }, [allTickets, allMembers, user]);

    const handleCreateProject = () => {
        setEditingProject(null);
        setIsModalOpen(false);
    };

    const handleSaveProject = async (projectData: any) => {
        if (!editingProject) {
            return;
        }
        try {
            await updateProject(editingProject.id, projectData);
            setEditingProject(null);
            setIsModalOpen(false);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    const handleEditClick = (project: any) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const handleDeleteProject = async (projectId: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            try {
                await deleteProject(projectId);
                toast.success('Project deleted');
            } catch (err) {
                console.error("Delete failed:", err);
            }
        }
    };

    const projectsInSelectedContext = projects.filter((p) => {
        const matchesContext = selectedId === 'All IDs' || p.userProjectId === selectedId;
        if (!matchesContext) return false;
        
        if (isDeveloper) {
            return developerProjectIds.has(p.id);
        }
        return true;
    });

    const filteredProjects = projectsInSelectedContext.filter(
        (p) => statusFilter === 'All' || p.status === statusFilter
    );

    const tabs = ['All', 'In Progress', 'Planning', 'Completed', 'On Hold'];
    return (
        <div className="space-y-6 custom-scrollbar pr-2 pb-10">
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
                }}
                onCreate={editingProject ? handleSaveProject : handleCreateProject}
                initialData={editingProject}
            />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Projects</h1>
                    <p className="text-muted-foreground text-sm">Manage and track all ongoing client projects</p>
                </div>
                <div className="flex items-center gap-3">
                    {!isDeveloper && (
                        <button
                            onClick={() => {
                                setEditingProject(null);
                                setIsModalOpen(true);
                            }}
                            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20"
                        >
                            <Plus size={18} />
                            New Project
                        </button>
                    )}
                </div>
            </div>
            {/* Filters */}
            <div className="relative z-10 flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setStatusFilter(tab); }}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors
                            ${statusFilter === tab
                                ? 'bg-surface-card text-foreground border border-border shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                            }
                        `}
                    >
                        {tab}
                        <span className="ml-2 text-xs opacity-50">
                            {tab === 'All'
                                ? projectsInSelectedContext.length
                                : projectsInSelectedContext.filter((p) => p.status === tab).length}
                        </span>
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-muted-foreground font-medium animate-pulse">Fetching projects...</p>
                </div>
            ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center px-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
                        <Filter className="text-red-500" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Failed to load projects</h3>
                    <p className="text-muted-foreground mt-2 max-w-md">{error}</p>
                    <button
                        onClick={() => fetchAllProjects()}
                        className="mt-6 px-6 py-2 bg-surface border border-border rounded-xl text-sm font-bold hover:bg-surface-hover transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                    {filteredProjects?.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onDelete={() => handleDeleteProject(project.id)}
                            onEdit={() => handleEditClick(project)}
                            canManage={!isDeveloper}
                            assignees={assigneesByProject[project.id] || []}
                        />
                    ))}
                </div>
            )}

            {!isLoading && !error && filteredProjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background mb-4">
                        <Filter className="text-gray-600" size={32} />
                    </div>
                    <h3 className="text-white font-medium">No projects found</h3>
                    <p className="text-gray-500 text-sm mt-1">Try changing the filter or create a new project.</p>
                </div>
            )}
        </div>
    );
}
