import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const userService = {
    /**
     * Get the currently authenticated user's profile.
     */
    async getProfile() {
        const response = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
        return response.data;
    },

    /**
     * Update the currently authenticated user's profile.
     */
    async updateProfile(profileData: any) {
        const response = await apiClient.patch(ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
        return response.data;
    },

    /**
     * ADMIN: Add a new member to the team.
     */
    async addMember(memberData: any) {
        const response = await apiClient.post(ENDPOINTS.AUTH.ADD_MEMBER, memberData);
        return response.data;
    },

    /**
     * ADMIN: Update an existing team member's account.
     */
    async updateMember(id: string | number, memberData: any) {
        const response = await apiClient.put(ENDPOINTS.AUTH.UPDATE_MEMBER(id), memberData);
        return response.data;
    },

    /**
     * ADMIN: Delete a team member's account.
     */
    async deleteMember(id: string | number) {
        const response = await apiClient.delete(ENDPOINTS.AUTH.DELETE_MEMBER(id));
        return response.data;
    },

    /**
     * ADMIN: Fetch all registered users (the team).
     */
    async getAllUsers() {
        const response = await apiClient.get(ENDPOINTS.AUTH.GET_ALL_USERS);
        return response.data;
    },
};
