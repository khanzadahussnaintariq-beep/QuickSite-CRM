import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const projectsService = {
    /**
     * Fetch all projects
     */
    async getAllProjects() {
        const response = await apiClient.get(ENDPOINTS.PROJECTS.BASE);
        return response.data;
    },

    /**
     * Fetch a specific project by its ID
     */
    async getProjectById(projectId: string) {
        const response = await apiClient.get(ENDPOINTS.PROJECTS.BY_ID(projectId));
        return response.data;
    },

    /**
     * Create a new project
     */
    async createProject(projectData: any) {
        const response = await apiClient.post(ENDPOINTS.PROJECTS.BASE, projectData);
        return response.data;
    },

    /**
     * Update an existing project
     */
    async updateProject(projectId: string, updateData: any) {
        const response = await apiClient.put(ENDPOINTS.PROJECTS.BY_ID(projectId), updateData);
        return response.data;
    },

    /**
     * Fetch projects for a specific client
     */
    async getProjectsByClient(clientId: string) {
        const response = await apiClient.get(ENDPOINTS.PROJECTS.BY_CLIENT(clientId));
        return response.data;
    },

    /**
     * Delete a project
     */
    async deleteProject(projectId: string) {
        const response = await apiClient.delete(ENDPOINTS.PROJECTS.BY_ID(projectId));
        return response.data;
    }
};
