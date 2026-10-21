import { create } from 'zustand';
import { meetingsService, CreateMeetingDto, UpdateMeetingDto } from '@/lib/api/services/meetings.service';
import toast from 'react-hot-toast';

export interface Meeting {
    id: string;
    title: string;
    type: 'Internal' | 'Client Related' | 'Project Related' | 'Other';
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
    status: 'Upcoming' | 'Completed' | 'Cancelled' | 'Rescheduled';
}

// Safely extract a string ID from a field that may be a string, a UUID, or a populated object
const extractId = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') return val.id || val._id || '';
    return '';
};

const normalizeMeeting = (m: any): Meeting => ({
    id: extractId(m.id || m._id),
    title: m.title || '',
    type: m.type || 'Internal',
    relatedClient: extractId(m.relatedClient) || extractId(m.clientId) || undefined,
    relatedProject: extractId(m.relatedProject) || extractId(m.projectId) || undefined,
    department: m.department || undefined,
    link: m.link || m.meetingLink || '',
    date: m.date || '',
    time: m.time || '',
    duration: m.duration || '30m',
    assignedTo: extractId(m.assignedTo) || extractId(m.assigned_to) || '',
    organizer: extractId(m.organizer) || extractId(m.organizerId) || '',
    purpose: m.purpose || m.description || '',
    agenda: m.agenda || m.notes || undefined,
    status: m.status || 'Upcoming',
});

interface MeetingState {
    meetings: Meeting[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchMeetings: (organizerId?: string) => Promise<void>;
    addMeeting: (meetingData: CreateMeetingDto) => Promise<boolean>;
    updateMeeting: (meetingId: string, updateData: UpdateMeetingDto) => Promise<boolean>;
    deleteMeeting: (meetingId: string) => Promise<boolean>;
    clearError: () => void;
}

export const useMeetingStore = create<MeetingState>((set) => ({
    meetings: [],
    isLoading: false,
    error: null,

    fetchMeetings: async (organizerId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const data = await meetingsService.getAllMeetings(organizerId);
            const raw = Array.isArray(data) ? data : (data.meetings || []);
            set({ meetings: raw.map(normalizeMeeting), isLoading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to fetch meetings';
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },

    addMeeting: async (meetingData: CreateMeetingDto) => {
        set({ isLoading: true, error: null });
        try {
            const raw = await meetingsService.createMeeting(meetingData);
            const newMeeting = normalizeMeeting(raw.meeting || raw);
            set((state) => ({
                meetings: [newMeeting, ...state.meetings],
                isLoading: false,
            }));
            toast.success('Meeting scheduled successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to schedule meeting';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },

    updateMeeting: async (meetingId: string, updateData: UpdateMeetingDto) => {
        set({ isLoading: true, error: null });
        try {
            const raw = await meetingsService.updateMeeting(meetingId, updateData);
            const updatedMeeting = normalizeMeeting(raw.meeting || raw);
            set((state) => ({
                meetings: state.meetings.map((m) => m.id === meetingId ? { ...m, ...updatedMeeting } : m),
                isLoading: false,
            }));
            toast.success('Meeting updated successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to update meeting';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },

    deleteMeeting: async (meetingId: string) => {
        set({ isLoading: true, error: null });
        try {
            await meetingsService.deleteMeeting(meetingId);
            set((state) => ({
                meetings: state.meetings.filter((m) => m.id !== meetingId),
                isLoading: false,
            }));
            toast.success('Meeting deleted successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to delete meeting';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },

    clearError: () => set({ error: null }),
}));
