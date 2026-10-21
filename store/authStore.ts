import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api/services/auth.service';
import { userService } from '@/lib/api/services/user.service';
import toast from 'react-hot-toast';

// ── Types ──

export interface User {
    id: string;
    email: string;
    name: string;
    avatar_url?: string;
    avatar?: string;
    role: string;
    phone?: string;
    salary?: number;
    joinDate?: string;
    status?: 'Active' | 'Inactive' | 'Away' | 'Terminated';
    statusMessage?: string;
    department?: string;
    panelAccess?: boolean;
    accessRole?: 'Admin' | 'Manager' | 'Developer';
    lastLogin?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    clearError: () => void;
    me: () => Promise<void>;
    updateProfile: (data: any) => Promise<boolean>;
    forgotPassword: (email: string) => Promise<boolean>;
    verifyOTP: (email: string, otp: string) => Promise<boolean>;
    updateStatus: ({ status, statusMessage }: { status?: string; statusMessage?: string }) => Promise<boolean>;
    getStatus: () => Promise<void>;
    resetPassword: (email: string, newPassword: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // ── Login ──
            login: async (email: string, password: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.login(email, password);
                    const user: User = data.user || data;

                    set({
                        user: {
                            ...user,
                            accessRole: user.role.charAt(0).toUpperCase() + user.role.slice(1) as 'Admin' | 'Manager' | 'Developer'
                        },
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });

                    if (typeof document !== 'undefined' && user.accessRole) {
                        document.cookie = `user_role=${user.accessRole}; path=/; SameSite=Lax`;
                    }

                    toast.success(`Welcome back, ${user.name || user.email}!`);
                    get().me();
                    return true;
                } catch (error: any) {
                    const isLocalhost = typeof window !== 'undefined' &&
                        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

                    if (isLocalhost) {
                        const mockUser: User = {
                            id: 'dev-user-id',
                            email,
                            name: 'Developer Admin',
                            role: 'admin',
                            accessRole: 'Admin',
                        };

                        set({
                            user: mockUser,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });

                        if (typeof document !== 'undefined') {
                            document.cookie = 'auth_token=dev-session; path=/; SameSite=Lax';
                            document.cookie = 'user_role=Admin; path=/; SameSite=Lax';
                        }

                        toast.success(`Dev Mode: Welcome, ${mockUser.name}!`);
                        return true;
                    }

                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Login failed. Please check your credentials.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },

            // ── Logout ──
            logout: async () => {
                if (get().user?.id !== 'dev-user-id') {
                    try {
                        await authService.logout();
                    } catch {
                        toast.error("Logout failed. Please try again.")
                    }
                }

                if (typeof document !== 'undefined') {
                    document.cookie = 'auth_token=; path=/; max-age=0';
                    document.cookie = 'user_role=; path=/; max-age=0';
                }

                set({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                });
                toast.success('Signed out successfully.');
            },

            me: async () => {
                const isLocalhost = typeof window !== 'undefined' &&
                    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

                if (isLocalhost && get().user?.id === 'dev-user-id') {
                    console.log("Dev Mode: Skipping backend profile fetch.");
                    return;
                }

                set({ isLoading: true, error: null });
                try {
                    const data = await userService.getProfile();
                    const fetchedUser: User = data.user || data.data || data;
                    
                    // Merge fetched user with existing user to preserve accessRole if not provided by backend
                    set({
                        user: { ...get().user, ...fetchedUser } as User,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                } catch (error: any) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to fetch user data. Please try again.';
                    set({ isLoading: false, error: message });
                    // Only show error toast if we were previously authenticated and it failed
                    if (get().isAuthenticated) {
                        toast.error(message);
                    }
                }
            },

            updateProfile: async (profileData: any): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    // In Dev Mode (bypass), we update locally even if backend is flaky
                    const isLocalhost = typeof window !== 'undefined' &&
                        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

                    let updatedUser = null;

                    try {
                        const data = await userService.updateProfile(profileData);
                        updatedUser = data.user || (data.id ? data : {});
                    } catch (err) {
                        if (isLocalhost) {
                            console.warn("Backend update failed, applying local update for Dev Mode.");
                            updatedUser = {};
                        } else {
                            throw err;
                        }
                    }

                    set({
                        user: { ...get().user, ...profileData, ...updatedUser },
                        isLoading: false,
                        error: null,
                    });

                    toast.success('Profile updated successfully!');
                    return true;
                } catch (error: any) {
                    const message =
                        error.response?.data?.message ||
                        error.response?.data?.error ||
                        'Failed to update profile. Please try again.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },

            // ── Forgot Password ──
            forgotPassword: async (email: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.forgotPassword(email);
                    set({ isLoading: false });
                    toast.success(data.message || 'OTP sent successfully!');
                    return true;
                } catch (error: any) {
                    const message = error.response?.data?.message || error.response?.data?.error || 'Failed to send OTP.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },

            // ── Verify OTP ──
            verifyOTP: async (email: string, otp: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.verifyOTP(email, otp);
                    set({ isLoading: false });
                    toast.success(data.message || 'OTP verified!');
                    return true;
                } catch (error: any) {
                    const message = error.response?.data?.message || error.response?.data?.error || 'Invalid OTP.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },

            // ── Reset Password ──
            resetPassword: async (email: string, newPassword: string): Promise<boolean> => {
                set({ isLoading: true, error: null });
                try {
                    const data = await authService.changePassword(email, newPassword);
                    set({ isLoading: false });
                    toast.success(data.message || 'Password reset successfully!');
                    return true;
                } catch (error: any) {
                    const message = error.response?.data?.message || error.response?.data?.error || 'Failed to reset password.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },


            getStatus: async () => {
                try {
                    const data = await authService.getStatus();
                    const { status, statusMessage } = data.user || data;
                    set((state) => ({
                        user: state.user ? { ...state.user, status, statusMessage } : state.user,
                    }));
                } catch {
                    // silently fail — status is non-critical
                }
            },

            updateStatus: async ({ status, statusMessage }: { status?: string; statusMessage?: string }) => {
                set({ isLoading: true, error: null });
                try {
                    await authService.updateStatus({ status, statusMessage });
                    set({ isLoading: false });
                    toast.success('Status updated successfully!');
                    await get().getStatus();
                    return true;
                } catch (error: any) {
                    const message = error.response?.data?.message || 'Failed to update status.';
                    set({ isLoading: false, error: message });
                    toast.error(message);
                    return false;
                }
            },

            // ── Helpers ──
            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage', // localStorage key
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
