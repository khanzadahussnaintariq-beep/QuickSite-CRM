'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/auth/FormInput';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('email');
    const { isLoading, forgotPassword, verifyOTP, resetPassword } = useAuthStore();

    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Handlers ──

    const handleSendOTP = async (e: FormEvent) => {
        e.preventDefault();
        if (!email) {
            setErrors({ email: 'Email is required' });
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
            setErrors({ email: 'Email is invalid' });
            return;
        }

        setErrors({});
        const success = await forgotPassword(email);
        if (success) {
            setStep('otp');
        }
    };

    const handleVerifyOTP = async (e: FormEvent) => {
        e.preventDefault();
        const fullOtp = otp.join('');
        if (fullOtp.length < 4) {
            toast.error('Please enter the full 4-digit code');
            return;
        }

        const success = await verifyOTP(email, fullOtp);
        if (success) {
            setStep('reset');
        }
    };

    const handleResetPassword = async (e: FormEvent) => {
        e.preventDefault();
        const newErrors: Record<string, string> = {};

        if (!passwords.new) newErrors.new = 'Password is required';
        else if (passwords.new.length < 8) newErrors.new = 'Must be at least 8 characters';

        if (passwords.new !== passwords.confirm) {
            newErrors.confirm = 'Passwords do not match';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});
        const success = await resetPassword(email, passwords.new);
        if (success) {
            setStep('success');
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto focus next input
        if (value && index < 3) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    // ── Render Helpers ──

    const renderStep = () => {
        switch (step) {
            case 'email':
                return (
                    <form onSubmit={handleSendOTP} className="space-y-6">
                        <FormInput
                            label="Email Address"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            icon={
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(242,101,34,0.3)]"
                        >
                            {isLoading ? 'Sending...' : 'Send Recovery Code'}
                        </button>
                    </form>
                );

            case 'otp':
                return (
                    <form onSubmit={handleVerifyOTP} className="space-y-8">
                        <div className="text-center">
                            <p className="text-sm text-foreground/60 mb-6">
                                Enter the 4-digit code sent to <span className="text-foreground font-medium">{email}</span>
                            </p>
                            <div className="flex justify-center gap-4">
                                {otp.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        id={`otp-${idx}`}
                                        type="text"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(idx, e)}
                                        className="w-14 h-14 bg-surface-card border-2 border-border focus:border-primary text-2xl font-bold text-center rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                    />
                                ))}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(242,101,34,0.3)]"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setStep('email')}
                                className="text-xs text-foreground/40 hover:text-primary transition-colors font-medium"
                            >
                                Didn&apos;t receive code? Resend
                            </button>
                        </div>
                    </form>
                );

            case 'reset':
                return (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <FormInput
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            value={passwords.new}
                            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                            error={errors.new}
                            icon={
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            }
                        />
                        <FormInput
                            label="Confirm New Password"
                            type="password"
                            placeholder="Repeat new password"
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                            error={errors.confirm}
                            icon={
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(242,101,34,0.3)]"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                );

            case 'success':
                return (
                    <div className="text-center space-y-6 py-4">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-foreground">Password Reset Successfully!</h3>
                        <p className="text-foreground/50 text-sm">
                            Your password has been updated. You can now sign in with your new credentials.
                        </p>
                        <Link
                            href="/sign-in"
                            className="block w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-all hover-lift flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(242,101,34,0.3)]"
                        >
                            Return to Sign In
                        </Link>
                    </div>
                );
        }
    };

    return (
        <AuthLayout
            title={step === 'success' ? 'All Set!' : 'Reset Password'}
            subtitle={
                step === 'email' ? 'Enter your email to receive a 4-digit recovery code' :
                    step === 'otp' ? 'We sent a verification code to your email' :
                        step === 'reset' ? 'Please set a strong new password' :
                            'Success! Your password is now secure.'
            }
        >
            {renderStep()}

            {step !== 'success' && (
                <div className="mt-8 text-center">
                    <Link href="/sign-in" className="text-sm text-foreground/50 hover:text-primary transition-colors font-medium inline-flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Sign In
                    </Link>
                </div>
            )}
        </AuthLayout>
    );
}
