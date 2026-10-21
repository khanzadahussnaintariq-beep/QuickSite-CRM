'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

type ProjectContextType = string;

interface AppContextType {
    selectedId: ProjectContextType;
    setSelectedId: (id: ProjectContextType) => void;
    switchId: (id: ProjectContextType, label?: string) => void;
    confirmSwitch: () => void;
    cancelSwitch: () => void;
    pendingId: ProjectContextType | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [selectedId, setSelectedId] = useState<ProjectContextType>('All IDs');
    const pathname = usePathname();
    const router = useRouter();

    const [pendingId, setPendingId] = useState<ProjectContextType | null>(null);
    const [pendingLabel, setPendingLabel] = useState<string | null>(null);

    const switchId = (id: ProjectContextType, label?: string) => {
        if (id === selectedId) return;
        const displayLabel = label || id;

        // If we are on a project detail page, show our custom modal
        const isProjectDetailPage = pathname?.includes('/dashboard/projects/') && pathname !== '/dashboard/projects';

        if (isProjectDetailPage) {
            setPendingId(id);
            setPendingLabel(displayLabel);
        } else {
            setSelectedId(id);
            toast.success(`Context: ${displayLabel}`);
        }
    };

    const confirmSwitch = () => {
        if (pendingId) {
            setSelectedId(pendingId);
            setPendingId(null);
            router.push('/dashboard/projects');
            toast.success(`Switched to ${pendingLabel || pendingId} context`);
            setPendingLabel(null);
        }
    };

    const cancelSwitch = () => {
        setPendingId(null);
        setPendingLabel(null);
    };

    return (
        <AppContext.Provider value={{
            selectedId,
            setSelectedId,
            switchId,
            confirmSwitch,
            cancelSwitch,
            pendingId
        }}>
            {children}

            {/* Global Confirmation Modal */}
            {pendingId && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={cancelSwitch} />
                    <div className="relative bg-surface border border-border rounded-2xl shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-[#F26522]/10 flex items-center justify-center">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F26522" strokeWidth="2.5">
                                    <path d="M7 7l5 5-5 5" /><path d="M13 7l5 5-5 5" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-foreground">Switch ID Context?</h3>
                                <p className="text-sm text-muted-foreground">You are currently viewing a project.</p>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 mb-6 text-sm text-foreground leading-relaxed">
                            Entering <span className="font-bold text-primary">{pendingLabel || pendingId}</span> context will take you back to the project list filtered by this ID.
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelSwitch}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm text-gray-500 hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
                            >
                                Stay Here
                            </button>
                            <button
                                onClick={confirmSwitch}
                                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary-hover transition-all shadow-lg shadow-primary/20"
                            >
                                Switch Now
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
