import Link from "next/link";

export default function Home() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-background">
            <main className="flex flex-col gap-8 row-start-2 items-center text-center max-w-4xl mx-auto z-10">
                <div className="space-y-4">
                    <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-foreground mb-6">
                        Quick<span className="text-primary">Site</span>
                    </h1>
                    <p className="text-xl text-foreground/70 max-w-2xl mx-auto leading-relaxed">
                        QuickSite CRM brings your clients, projects, meetings, and support work together.
                    </p>
                </div>

                <div className="flex gap-4 items-center flex-col sm:flex-row mt-8">
                    <Link
                        className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-primary text-white gap-2 hover:bg-primary-hover text-base sm:text-lg h-12 sm:h-14 px-8 sm:px-10 font-semibold hover-lift"
                        href="/sign-in"
                    >
                        Get Started
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>

                {/* Feature Grid Removed */}
            </main>

            {/* Decorative Background Glows */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--color-primary)] opacity-10 rounded-full blur-[120px]"></div>
            </div>

            <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center mt-20 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} QuickSite. All rights reserved.</p>
            </footer>
        </div>
    );
}
