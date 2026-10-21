'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/auth/FormInput';
import { useAuthStore } from '@/store/authStore';

export default function SignInPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false,
    });
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const { login, isLoading } = useAuthStore();

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        const isLocalhost = typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (!isLocalhost && formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        } else if (!isLocalhost && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Password must contain uppercase, lowercase, and number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const success = await login(formData.email, formData.password);
        if (success) {
            router.push('/dashboard');
        }
    };

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to your account to continue"
        >
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormInput
                    label="Email Address"
                    type="email"
                    placeholder=""
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    icon={
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                    }
                />

                <FormInput
                    label="Password"
                    type="password"
                    placeholder=""
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    icon={
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={formData.rememberMe}
                            onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            className="w-4 h-4 rounded border-border bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 cursor-pointer"
                        />
                        <span className="text-sm text-foreground/50 group-hover:text-foreground/70 transition-colors">
                            Remember me
                        </span>
                    </label>

                    <Link href="/forgot-password" className="text-sm text-primary hover:text-primary-hover transition-colors font-medium">
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(242,101,34,0.3)]"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>

                <p className="text-center text-foreground/50 text-sm mt-6">
                    If the backend is unavailable, localhost accepts any valid email and non-empty password for a UI test session.
                </p>
            </form>
        </AuthLayout>
    );
}
