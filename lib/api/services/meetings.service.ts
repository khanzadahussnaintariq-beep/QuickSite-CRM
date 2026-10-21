import { apiClient } from '../client';
import { ENDPOINTS } from '../endpoints';


export interface CreateMeetingDto {
    title: string;
    type: string;
    relatedClient?: string;
    relatedProject?: string;
    department?: string;
    link: string;
    date: string;
    time: string;
    duration: string;
    assignedTo: string;
    organizer: string;
    purpose: string;
    agenda?: string;
    status: string;
}

export interface UpdateMeetingDto extends Partial<CreateMeetingDto> { }

export const meetingsService = {
    async getAllMeetings(organizerId?: string) {
        const params = organizerId ? { organizerId } : undefined;
        const response = await apiClient.get(ENDPOINTS.MEETINGS.BASE, { params });
        return response.data;
    },

    async getMeetingById(meetingId: string) {
        const response = await apiClient.get(ENDPOINTS.MEETINGS.BY_ID(meetingId));
        return response.data;
    },

    async createMeeting(meetingData: CreateMeetingDto) {
        const response = await apiClient.post(ENDPOINTS.MEETINGS.BASE, meetingData);
        return response.data;
    },

    async updateMeeting(meetingId: string, updateData: UpdateMeetingDto) {
        const response = await apiClient.put(ENDPOINTS.MEETINGS.BY_ID(meetingId), updateData);
        return response.data;
    },

    async deleteMeeting(meetingId: string) {
        const response = await apiClient.delete(ENDPOINTS.MEETINGS.BY_ID(meetingId));
        return response.data;
    }
}