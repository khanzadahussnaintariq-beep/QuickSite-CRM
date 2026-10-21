import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const teamService = {
    async getAllMembers() {
        const response = await apiClient.get(ENDPOINTS.TEAM.BASE);
        return response.data;
    },

    async addMember(memberData: any) {
        const response = await apiClient.post(ENDPOINTS.TEAM.BASE, memberData);
        return response.data;
    },

    async updateMember(id: string | number, memberData: any) {
        const response = await apiClient.put(ENDPOINTS.TEAM.BY_ID(id), memberData);
        return response.data;
    },

    async deleteMember(id: string | number) {
        const response = await apiClient.delete(ENDPOINTS.TEAM.BY_ID(id));
        return response.data;
    },
};
