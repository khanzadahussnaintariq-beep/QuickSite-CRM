import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import toast from 'react-hot-toast';
import { getAuthToken } from './auth';
import { ENDPOINTS } from './endpoints';

/**
 * Foundation for the Frontend API Gateway.
 * Configure the central Axios HTTP client here.
 * Base URL, authentication, and error interceptors are centrally managed.
 */

// Placeholder base URL. This would normally be `process.env.NEXT_PUBLIC_API_URL`
const API_BASE_URL = '/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds timeout
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getAuthToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
    }
);

// Response Interceptor
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if (error.response) {
            const { status } = error.response;

            switch (status) {
                case 401:
                    // List of endpoints that should handle 401 locally (e.g. invalid password or invalid OTP)
                    const authEndpoints = [
                        ENDPOINTS.AUTH.LOGIN,
                        ENDPOINTS.AUTH.FORGOT_PASSWORD,
                        ENDPOINTS.AUTH.VERIFY_OTP,
                        ENDPOINTS.AUTH.CHANGE_PASSWORD,
                    ];

                    const isAuthRequest = authEndpoints.some(endpoint =>
                        error.config?.url?.includes(endpoint)
                    );

                    if (!isAuthRequest) {
                        console.warn('Unauthorized! Redirecting to sign-in.');

                        // Clear persisted Zustand auth state from localStorage
                        try { localStorage.removeItem('auth-storage'); } catch { }

                        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/sign-')) {
                            toast.error('Session expired. Please log in again.');
                            window.location.href = '/sign-in';
                        }
                    }
                    break;
                case 403:
                    toast.error('You do not have permission to perform this action.');
                    break;
                case 500:
                    toast.error('An unexpected server error occurred.');
                    break;
            }
        } else if (error.request) {
            toast.error('Network error. Please check your internet connection.');
        }

        return Promise.reject(error);
    }
);
