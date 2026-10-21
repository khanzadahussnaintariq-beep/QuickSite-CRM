'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Briefcase, Ticket, Users, Calendar,
    Settings, LogOut, Lock, Unlock, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import QuickSiteLogo from '@/components/QuickSiteLogo';

type NavLeaf = { name: string; href: string; icon: React.ElementType; adminOnly?: boolean };
type NavItem = { name: string; href: string; icon: React.ElementType; children?: NavLeaf[] };
type NavSection = { sectionName: string; sectionIcon: React.ElementType; items: NavItem[] };
type TopLevel = NavItem | NavSection;

function isSection(t: TopLevel): t is NavSection { return 'sectionName' in t; }

const navigation: TopLevel[] = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Clients', href: '/dashboard/clients', icon: Users },
    { name: 'Meetings', href: '/dashboard/meetings', icon: Calendar },
    { name: 'Team', href: '/dashboard/team', icon: Users },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuthStore();
    const role = user?.role?.toLowerCase() ?? '';

    const [isLocked, setIsLocked] = useState(false);
    const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

    useEffect(() => {
        setIsLocked(localStorage.getItem('sidebar-locked') === 'true');
    }, []);

    // Auto-open sections/groups when a child route is active
    useEffect(() => {
        const toOpen = new Set<string>();
        navigation.forEach(top => {
            if (isSection(top)) {
                if (top.items.some(i => pathname === i.href || pathname.startsWith(i.href + '/'))) {
                    toOpen.add(top.sectionName);
                }
                top.items.forEach(i => {
                    if (i.children?.some(c => pathname.startsWith(c.href))) toOpen.add(i.name);
                });
            } else if (top.children?.some(c => pathname.startsWith(c.href))) {
                toOpen.add(top.name);
            }
        });
        if (toOpen.size) setOpenGroups(prev => new Set([...prev, ...toOpen]));
    }, [pathname]);

    const toggleLock = () => {
        const next = !isLocked;
        setIsLocked(next);
        localStorage.setItem('sidebar-locked', String(next));
    };

    const toggleGroup = (name: string) => setOpenGroups(prev => {
        const next = new Set(prev);
        next.has(name) ? next.delete(name) : next.add(name);
        return next;
    });

    const isSidebarWide = !isLocked;

    useEffect(() => {
        document.documentElement.style.setProperty('--sidebar-width', isSidebarWide ? '240px' : '64px');
    }, [isSidebarWide]);

    // ── role filtering ────────────────────────────────────────────────────────

    const isItemVisible = (item: NavItem): boolean => {
        if (role === 'admin') return true;
        if (role === 'manager') return ['Dashboard', 'Projects', 'Tickets', 'Meetings', "Clients", 'Settings'].includes(item.name);
        if (role === 'developer') return ['Dashboard', 'Projects', 'Tickets', 'Meetings', 'Settings'].includes(item.name);
        return false;
    };

    const getSectionItems = (section: NavSection): NavItem[] => {
        if (role === 'admin') return section.items;
        return [];
    };

    // ── render helpers ────────────────────────────────────────────────────────

    const renderItem = (item: NavItem, nested = false) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        const leafs = (item.children ?? []).filter(c => !c.adminOnly || role === 'admin');
        const childActive = leafs.some(c => pathname === c.href || pathname.startsWith(c.href));
        const isOpen = openGroups.has(item.name);

        return (
            <div key={item.name}>
                <Link
                    href={item.href}
                    onClick={() => leafs.length > 0 && toggleGroup(item.name)}
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${isActive || childActive
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/10'
                            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover/80'
                        }
                        ${!isSidebarWide ? 'justify-center' : ''}
                    `}
                    data-tooltip={!isSidebarWide ? item.name : undefined}
                    data-tooltip-pos="right"
                    title={item.name}
                >
                    <Icon size={nested ? 18 : 20} className={isActive || childActive ? 'text-primary' : ''} />
                    {isSidebarWide && (
                        <>
                            <span className="flex-1 whitespace-nowrap">{item.name}</span>
                            {leafs.length > 0 && (
                                <ChevronRight
                                    size={13}
                                    className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-90' : ''}`}
                                />
                            )}
                        </>
                    )}
                </Link>

                {isOpen && isSidebarWide && leafs.length > 0 && (
                    <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
                        {leafs.map(child => {
                            const active = pathname === child.href;
                            const CIcon = child.icon;
                            return (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className={`
                                        flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all
                                        ${active
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                                        }
                                    `}
                                >
                                    <CIcon size={14} className={active ? 'text-primary' : ''} />
                                    <span className="whitespace-nowrap">{child.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const renderSection = (section: NavSection) => {
        const items = getSectionItems(section);
        if (!items.length) return null;

        const SIcon = section.sectionIcon;
        const isOpen = openGroups.has(section.sectionName);
        const anyActive = items.some(i =>
            pathname === i.href ||
            pathname.startsWith(i.href + '/') ||
            i.children?.some(c => pathname.startsWith(c.href))
        );

        return (
            <div key={section.sectionName}>
                {isSidebarWide ? (
                    <>
                        <button
                            onClick={() => toggleGroup(section.sectionName)}
                            className={`
                                flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer
                                ${anyActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-hover'
                                }
                            `}
                        >
                            <SIcon size={20} className={anyActive ? 'text-primary' : ''} />
                            <span className="flex-1 text-left whitespace-nowrap">{section.sectionName}</span>
                            <ChevronRight
                                size={13}
                                className={`transition-transform duration-200 text-gray-400 ${isOpen ? 'rotate-90' : ''}`}
                            />
                        </button>
                        {isOpen && (
                            <div className="mt-0.5 ml-3 pl-3 border-l border-border space-y-0.5">
                                {items.map(item => renderItem(item, true))}
                            </div>
                        )}
                    </>
                ) : (
                    // Narrow mode: show items directly without the section header
                    <>{items.map(item => renderItem(item))}</>
                )}
            </div>
        );
    };

    // ── JSX ───────────────────────────────────────────────────────────────────

    return (
        <aside
            className={`
                fixed top-0 left-0 z-100 h-[100dvh] bg-surface/90 border-r border-border
                backdrop-blur-2xl flex flex-col transition-all duration-300 ease-in-out shadow-xl shadow-slate-950/5 dark:shadow-black/25
                ${isSidebarWide ? 'w-60' : 'w-16'}
                sidebar-container
            `}
        >
            {/* Floating Toggle Button */}
            <button
                onClick={toggleLock}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-101 w-6 h-6 bg-surface border border-border rounded-full shadow-md flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
            >
                {isSidebarWide ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Logo */}
            <div className="h-16 flex items-center justify-between border-b border-border/70 px-4 overflow-hidden">
                <div className={`w-full flex ${isSidebarWide ? '' : 'justify-center'}`}>
                    <QuickSiteLogo
                        size="sm"
                        label={isSidebarWide ? 'QuickSite' : ''}
                        descriptor={isSidebarWide ? 'CRM' : undefined}
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-visible">
                {navigation.map(top => {
                    if (isSection(top)) return renderSection(top);
                    if (!isItemVisible(top)) return null;
                    return renderItem(top);
                })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-border space-y-1">
                <button
                    onClick={toggleLock}
                    className={`
                        flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium
                        text-muted-foreground hover:text-foreground hover:bg-surface-hover rounded-xl transition-colors cursor-pointer
                        ${!isSidebarWide ? 'justify-center' : ''}
                    `}
                    data-tooltip={!isSidebarWide ? (isLocked ? 'Open Sidebar' : 'Lock Sidebar') : undefined}
                    data-tooltip-pos="right"
                >
                    {isLocked ? <Lock size={20} /> : <Unlock size={20} />}
                    {isSidebarWide && <span>{isLocked ? 'Sidebar Locked' : 'Sidebar Open'}</span>}
                </button>

                <button
                    className={`
                        flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium
                        text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-colors cursor-pointer
                        ${!isSidebarWide ? 'justify-center' : ''}
                    `}
                    data-tooltip={!isSidebarWide ? 'Sign Out' : undefined}
                    data-tooltip-pos="right"
                    onClick={async () => {
                        await useAuthStore.getState().logout();
                        router.push('/sign-in');
                    }}
                >
                    <LogOut size={20} />
                    {isSidebarWide && <span>Sign Out</span>}
                </button>
            </div>
        </aside>
    );
}
