import { create } from 'zustand';
import { userService } from '@/lib/api/services/user.service';
import { teamService } from '@/lib/api/services/team.service';
import { User } from './authStore';
import toast from 'react-hot-toast';

interface MemberState {
    members: User[];
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchAllMembers: () => Promise<void>;
    createMember: (memberData: any) => Promise<boolean>;
    updateMember: (id: string, data: any) => Promise<boolean>;
    deleteMember: (id: string) => Promise<boolean>;
    clearError: () => void;
}

export const useMemberStore = create<MemberState>((set) => ({
    members: [],
    isLoading: false,
    error: null,

    fetchAllMembers: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await userService.getAllUsers();
            const members = Array.isArray(data) ? data : (data.users || []);

            const mappedMembers = members.map((m: any) => ({
                ...m
            }));

            set({ members: mappedMembers, isLoading: false });
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to fetch team members.';
            set({ isLoading: false, error: message });
            toast.error(message);
        }
    },

    createMember: async (memberData: any) => {
        set({ isLoading: true, error: null });
        try {
            const authResult = await userService.addMember(memberData);
            await teamService.addMember({ userId: authResult?.id ?? authResult?.user?.id });
            set({ isLoading: false });
            toast.success('New team member added successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || error.response?.data?.error || 'Failed to add member.';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },

    updateMember: async (id: string, memberData: any) => {
        set({ isLoading: true, error: null });
        try {
            await Promise.all([
                userService.updateMember(id, memberData),
                // teamService.updateMember(id, memberData), // Currently disabled
            ]);
            set((state) => ({
                members: state.members.map(m => m.id === id ? { ...m, ...memberData } : m),
                isLoading: false
            }));
            toast.success('Member updated successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to update member.';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },

    deleteMember: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await Promise.all([
                userService.deleteMember(id),
                teamService.deleteMember(id),
            ]);
            set((state) => ({
                members: state.members.filter(m => m.id !== id),
                isLoading: false
            }));
            toast.success('Member removed successfully!');
            return true;
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to remove member.';
            set({ isLoading: false, error: message });
            toast.error(message);
            return false;
        }
    },


    clearError: () => set({ error: null }),
}));
