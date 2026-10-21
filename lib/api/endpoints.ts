/**
 * Centralized list of all API endpoints.
 * Use these constants throughout services to avoid hardcoding routes.
 */

export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        UPDATE_PROFILE: '/auth/profile',
        FORGOT_PASSWORD: '/auth/forgot-password',
        VERIFY_OTP: '/auth/verify-otp',
        CHANGE_PASSWORD: '/auth/change-password',
        UPDATE_STATUS: '/auth/status',
        GET_STATUS: '/auth/status',

        // Only for admin
        ADD_MEMBER: '/auth/add-member',
        UPDATE_MEMBER: (id: string | number) => `/auth/users/${id}`,
        DELETE_MEMBER: (id: string | number) => `/auth/users/${id}`,
        GET_ALL_USERS: '/auth/users',

    },

    // Projects
    PROJECTS: {
        BASE: '/projects',
        BY_ID: (id: string | number) => `/projects/${id}`,
        BY_CLIENT: (clientId: string | number) => `/projects/client/${clientId}`,
        COMMENTS: (id: string | number) => `/projects/${id}/comments`,
        MEMBERS: (id: string | number) => `/projects/${id}/members`,
    },

    // Clients
    CLIENTS: {
        BASE: '/clients',
        BY_ID: (id: string | number) => `/clients/${id}`,
    },

    MEETINGS: {
        BASE: '/meetings',
        BY_ID: (id: string | number) => `/meetings/${id}`,
    },

    // Tickets
    TICKETS: {
        BASE: '/tickets',
        BY_ID: (id: string | number) => `/tickets/${id}`,
    },

    // Users
    USERS: {
        BASE: '/users',
        PROFILE: '/users/profile',
        UPDATE_STATUS: '/users/status',

    },

    // Team
    TEAM: {
        BASE: '/team',
        BY_ID: (id: string | number) => `/team/${id}`,
    },

    // Credentials
    CREDENTIALS: {
        BASE: (projectId: string | number) => `/projects/${projectId}/credentials`,
    }
} as const;
