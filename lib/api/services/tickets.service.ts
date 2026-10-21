import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const ticketsService = {
    async getAllTickets() {
        const response = await apiClient.get(ENDPOINTS.TICKETS.BASE);
        return response.data;
    },

    async getTicketById(ticketId: string) {
        const response = await apiClient.get(ENDPOINTS.TICKETS.BY_ID(ticketId));
        return response.data;
    },

    async createTicket(ticketData: any) {
        const response = await apiClient.post(ENDPOINTS.TICKETS.BASE, ticketData);
        return response.data;
    },

    async updateTicket(ticketId: string, updateData: any) {
        const response = await apiClient.put(ENDPOINTS.TICKETS.BY_ID(ticketId), updateData);
        return response.data;
    },

    async deleteTicket(ticketId: string) {
        const response = await apiClient.delete(ENDPOINTS.TICKETS.BY_ID(ticketId));
        return response.data;
    }
};
