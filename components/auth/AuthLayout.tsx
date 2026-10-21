'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface AuthLayoutProps {
    children: ReactNode;
    title: string;
    subtitle: string;
}

import ParticlesBackground from '@/components/ui/ParticlesBackground';

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-x-hidden relative bg-background transition-colors duration-300">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <ParticlesBackground />
            </div>
            {/* Left Panel - Branding & Visuals (Hidden on small screens) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface items-center justify-center p-8 lg:p-12 overflow-hidden border-r border-border">
                <div className="relative z-10 max-w-lg text-center">
                    <Image
                        src="/quicksite-mark.png"
                        width={768}
                        height={768}
                        sizes="(max-width: 1023px) 80vw, 380px"
                        alt="QuickSite Technologies, One Site Big Impact"
                        priority
                        className="mx-auto mb-5 h-auto w-full max-w-[380px] rounded-2xl"
                    />
                    <p className="text-lg lg:text-xl text-foreground/50 leading-relaxed mb-8">
                        Experience the next generation of project management.
                        Streamline your workflow with precision and style.
                    </p>

                    {/* Decorative element - Quote area normalized */}
                    <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary bg-surface/50">
                        <p className="text-sm text-foreground/80 italic leading-relaxed">
                            &quot;A great CRM turns customer relationships into lasting partnerships.&quot;
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Panel - Auth Form */}
            <div className="w-full lg:w-1/2 min-h-[100dvh] bg-background flex flex-col justify-center items-center overflow-y-auto relative py-12">
                <div className="w-full max-w-md px-8">
                    {/* Mobile Logo (Visible only on small screens) */}
                    <div className="lg:hidden text-center mb-8">
                        <Image
                            src="/quicksite-mark.png"
                            width={768}
                            height={768}
                            sizes="180px"
                            alt="QuickSite Technologies, One Site Big Impact"
                            priority
                            className="mx-auto h-[180px] w-[180px] rounded-xl object-contain"
                        />
                    </div>

                    <div className="relative z-10 bg-surface/95 border border-border rounded-2xl p-8 lg:p-10 shadow-xl lg:shadow-2xl backdrop-blur-sm">
                        <div className="mb-8">
                            <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{title}</h2>
                            <p className="text-foreground/50 text-sm">{subtitle}</p>
                        </div>
                        {children}
                    </div>

                    <p className="text-center text-foreground/40 text-[10px] mt-4">
                        &copy; {new Date().getFullYear()} QuickSite. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
}
