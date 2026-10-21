import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import PageTransition from '@/components/ui/PageTransition';
import { AppProvider } from '@/context/AppContext';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProvider>
            <div className="h-[100dvh] w-screen overflow-hidden bg-background flex">
                <Sidebar />
                <div
                    className="flex-1 flex flex-col min-w-0 transition-all duration-300"
                    style={{ marginLeft: 'var(--sidebar-width, 64px)' }}
                >
                    <Header />
                    <main className="dashboard-canvas flex-1 overflow-y-auto p-4 md:p-7">
                        <div className="mx-auto w-full max-w-[1600px]">
                            <PageTransition>{children}</PageTransition>
                        </div>
                    </main>
                </div>
            </div>
        </AppProvider>
    );
}
