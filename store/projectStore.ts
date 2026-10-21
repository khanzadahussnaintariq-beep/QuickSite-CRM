import { create } from 'zustand';
import { projectsService } from '@/lib/api/services/projects.service';

interface Project {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    budgetType: string;
    price: number | null;
    weeklyHours?: number | null;
    hourlyRate?: number | null;
    client: string;
    clientId: string;
    progress: number;
    dueDate: string;
    tags: string[];
    userProjectId: string;
    createdById?: string;
    team?: string[];
    createdAt: string;
    files?: string[];
    credentials?: any[];
    milestones?: any[];
}

interface ProjectState {
    projects: Project[];
    isLoading: boolean;
    error: string | null;
    fetchAllProjects: () => Promise<void>;
    createProject: (projectData: any) => Promise<void>;
    updateProject: (id: string, projectData: any) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
}

const mapBackendToFrontend = (bp: any): Project => ({
    id: bp.id,
    title: bp.name,
    description: bp.description || '',
    status: mapStatusToFrontend(bp.status),
    priority: bp.priority || 'Medium',
    budgetType: bp.budgetType || 'Milestone',
    price: bp.price ?? null,
    weeklyHours: bp.weeklyHours ?? null,
    hourlyRate: bp.hourlyRate ?? null,
    client: bp.client?.name || 'Unknown Client',
    clientId: bp.clientId,
    progress: bp.progress || 0,
    dueDate: bp.deadline ? new Date(bp.deadline).toISOString().split('T')[0] : '',
    tags: bp.tags || [],
    userProjectId: bp.projectOwner || '',
    createdById: bp.createdById || bp.createdBy || bp.createdByUserId || undefined,
    createdAt: bp.createdAt || new Date().toISOString(),
    files: bp.files || [],
    credentials: bp.credentials || [],
    milestones: bp.milestones || []
});

const mapStatusToFrontend = (status: string) => {
    switch (status) {
        case 'PLANNING': return 'Planning';
        case 'IN_PROGRESS': return 'In Progress';
        case 'PENDING': return 'On Hold';
        case 'COMPLETED': return 'Completed';
        default: return 'Planning';
    }
};

const mapStatusToBackend = (status: string) => {
    switch (status) {
        case 'Planning': return 'PLANNING';
        case 'In Progress': return 'IN_PROGRESS';
        case 'On Hold': return 'PENDING';
        case 'Completed': return 'COMPLETED';
        default: return 'PLANNING';
    }
};

export const useProjectStore = create<ProjectState>((set, get) => ({
    projects: [],
    isLoading: false,
    error: null,


    fetchAllProjects: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await projectsService.getAllProjects();
            const mappedProjects = data.map(mapBackendToFrontend);
            set({ projects: mappedProjects, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createProject: async (projectData: any) => {
        set({ isLoading: true, error: null });
        try {
            const backendData = {
                name: projectData.title,
                description: projectData.description,
                status: mapStatusToBackend(projectData.status),
                clientId: projectData.clientId,
                createdBy: projectData.createdBy,
                projectOwner: projectData.projectOwner,
                priority: projectData.priority,
                budgetType: projectData.budgetType,
                price: projectData.price !== '' && projectData.price != null ? projectData.price : null,
                weeklyHours: projectData.weeklyHours !== '' && projectData.weeklyHours != null ? projectData.weeklyHours : null,
                hourlyRate: projectData.hourlyRate !== '' && projectData.hourlyRate != null ? projectData.hourlyRate : null,
                tags: projectData.tags,
                deadline: projectData.dueDate ? new Date(projectData.dueDate) : null,
                files: projectData.files || [],
                credentials: projectData.credentials || [],
                milestones: projectData.milestones || []
            };
            await projectsService.createProject(backendData);
            await get().fetchAllProjects();
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateProject: async (id: string, projectData: any) => {
        set({ isLoading: true, error: null });
        try {
            const backendData = {
                name: projectData.title,
                description: projectData.description,
                status: projectData.status ? mapStatusToBackend(projectData.status) : undefined,
                clientId: projectData.clientId,
                projectOwner: projectData.projectOwner,
                priority: projectData.priority,
                budgetType: projectData.budgetType,
                price: projectData.price !== '' && projectData.price != null ? projectData.price : null,
                weeklyHours: projectData.weeklyHours !== '' && projectData.weeklyHours != null ? projectData.weeklyHours : null,
                hourlyRate: projectData.hourlyRate !== '' && projectData.hourlyRate != null ? projectData.hourlyRate : null,
                tags: projectData.tags,
                deadline: projectData.dueDate ? new Date(projectData.dueDate) : undefined,
                files: projectData.files || [],
                credentials: projectData.credentials || [],
                milestones: projectData.milestones || []
            };
            await projectsService.updateProject(id, backendData);
            await get().fetchAllProjects();
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteProject: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await projectsService.deleteProject(id);
            set({
                projects: get().projects.filter(p => p.id !== id),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
