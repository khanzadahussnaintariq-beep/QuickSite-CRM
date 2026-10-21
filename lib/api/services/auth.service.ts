import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';

export const authService = {
    async login(email: string, password: string) {
        const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
        return response.data;
    },
    async logout() {
        const response = await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
        return response.data;
    },
    async forgotPassword(email: string) {
        const response = await apiClient.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
        return response.data;
    },
    async verifyOTP(email: string, otp: string) {
        const response = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, { email, otp });
        return response.data;
    },
    async changePassword(email: string, password: string) {
        const response = await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, { email, password });
        return response.data;
    },
    async updateStatus({ status, statusMessage }: { status?: string; statusMessage?: string }) {
        const response = await apiClient.patch(ENDPOINTS.AUTH.UPDATE_STATUS, { status, statusMessage });
        return response.data;
    },

    async getStatus() {
        const response = await apiClient.get(ENDPOINTS.AUTH.GET_STATUS);
        return response.data;
    },
}