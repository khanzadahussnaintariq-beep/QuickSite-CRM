import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

/**
 * Clients API Service
 * Handles all CRUD operations related to Clients via the centralized API client.
 */
export const clientsService = {
    /**
     * Fetch all clients
     */
    async getAllClients() {
        const response = await apiClient.get(ENDPOINTS.CLIENTS.BASE);
        return response.data;
    },

    /**
     * Fetch a specific client by its ID
     */
    async getClientById(clientId: string) {
        const response = await apiClient.get(ENDPOINTS.CLIENTS.BY_ID(clientId));
        return response.data;
    },

    /**
     * Create a new client
     */
    async createClient(clientData: any) {
        const response = await apiClient.post(ENDPOINTS.CLIENTS.BASE, clientData);
        return response.data;
    },

    /**
     * Update an existing client
     */
    async updateClient(clientId: string, updateData: any) {
        const response = await apiClient.put(ENDPOINTS.CLIENTS.BY_ID(clientId), updateData);
        return response.data;
    },

    /**
     * Delete a client
     */
    async deleteClient(clientId: string) {
        const response = await apiClient.delete(ENDPOINTS.CLIENTS.BY_ID(clientId));
        return response.data;
    }
};
