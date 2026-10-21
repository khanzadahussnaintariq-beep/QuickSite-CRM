'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, User, Briefcase, Ticket } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import ProfileMenu from './ProfileMenu';
import { useAppContext } from '@/context/AppContext';
import { ChevronDown, Layers } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSignedUrl } from '@/lib/hooks/useSignedUrl';
import { useProjectStore } from '@/store/projectStore';
import { useTicketStore } from '@/store/ticketStore';
import { useClientStore } from '@/store/clientStore';

export default function Header() {
    const router = useRouter();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const { selectedId, switchId } = useAppContext();
    const [isIdDropdownOpen, setIsIdDropdownOpen] = useState(false);
    const idDropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isProjectsSection = pathname?.includes('/projects');
    const user = useAuthStore((state) => state.user);
    const avatarUrl = useSignedUrl(user?.avatar || user?.avatar_url);
    const normalizedRole = `${user?.role || ''} ${user?.accessRole || ''}`.toLowerCase();
    const isAdmin = normalizedRole.includes('admin');

    const { projects } = useProjectStore();
    const { tickets } = useTicketStore();
    const { clients } = useClientStore();

    const registeredUsers = [
        { id: 'asher', name: 'Asher' },
        { id: 'ahmed', name: 'Ahmed' },
    ];

    const selectedLabel = selectedId === 'All IDs'
        ? 'Switch ID'
        : (registeredUsers.find((u) => u.id === selectedId)?.name || selectedId);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {

            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setIsProfileOpen(false);
            }
            if (idDropdownRef.current && !idDropdownRef.current.contains(event.target as Node)) {
                setIsIdDropdownOpen(false);
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setIsSearchOpen(false);
                setIsProfileOpen(false);
                setIsIdDropdownOpen(false);
            }
            if (event.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
                event.preventDefault();
                const searchInput = searchRef.current?.querySelector('input');
                if (searchInput) (searchInput as HTMLInputElement).focus();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Search Logic
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = [
            ...projects.filter(p => p.title?.toLowerCase().includes(query)).map(p => ({ type: 'Project', title: p.title, subtitle: p.status, href: `/dashboard/projects`, icon: Briefcase })),
            ...tickets.filter(t => t.title?.toLowerCase().includes(query) || t.ticketNumber?.toLowerCase().includes(query)).map(t => ({ type: 'Ticket', title: t.title, subtitle: t.ticketNumber, href: `/dashboard/tickets`, icon: Ticket })),
            ...clients.filter(c => c.name?.toLowerCase().includes(query) || c.company?.toLowerCase().includes(query)).map(c => ({ type: 'Client', title: c.name, subtitle: c.company, href: `/dashboard/clients`, icon: User })),
        ];
        setSearchResults(results);
        setIsSearchOpen(true);
    }, [searchQuery, projects, tickets, clients]);



    return (
        <>
            <header className="h-16 bg-surface/75 backdrop-blur-2xl border-b border-border/70 flex items-center justify-between px-4 md:px-7 sticky top-0 z-20 transition-colors">
                <div className="flex flex-1 min-w-0 items-center gap-4">
                    <Link href="/dashboard" aria-label="QuickSite CRM home" className="shrink-0 text-sm font-bold tracking-tight text-foreground">
                        QuickSite <span className="text-primary">CRM</span>
                    </Link>
                    {/* Search */}
                    <div className="flex-1 max-w-md hidden md:flex" ref={searchRef}>
                    <div className="relative w-full group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => searchQuery && setIsSearchOpen(true)}
                            placeholder="Search projects, tickets, or clients..."
                            className="w-full bg-surface-hover/80 border border-border/80 text-foreground text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder-muted-foreground"
                        />

                        {/* Search Results Dropdown */}
                        {isSearchOpen && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-surface-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in duration-100 max-h-80 overflow-y-auto custom-scrollbar">
                                {(['Project', 'Ticket', 'Client'] as const).map(type => {
                                    const group = searchResults.filter(r => r.type === type);
                                    if (group.length === 0) return null;
                                    const Icon = group[0].icon;
                                    return (
                                        <div key={type}>
                                            <div className="px-3 py-1.5 bg-surface-hover/60 border-b border-border/50">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                                    <Icon size={10} /> {type}s
                                                </span>
                                            </div>
                                            {group.map((result, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        router.push(result.href);
                                                        setIsSearchOpen(false);
                                                        setSearchQuery('');
                                                    }}
                                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-surface-hover cursor-pointer border-b border-border/30 last:border-0"
                                                >
                                                    <div className="p-1.5 bg-primary/10 rounded-lg text-primary shrink-0">
                                                        <Icon size={14} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">{result.title}</p>
                                                        {result.subtitle && <p className="text-[10px] text-muted-foreground truncate">{result.subtitle}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {isSearchOpen && searchQuery.trim() !== '' && searchResults.length === 0 && (
                            <div className="absolute top-full left-0 mt-2 w-full bg-surface-card border border-border rounded-xl shadow-2xl z-50 px-4 py-6 text-center">
                                <p className="text-sm text-muted-foreground">No results for <span className="font-semibold text-foreground">"{searchQuery}"</span></p>
                            </div>
                        )}
                    </div>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 ml-auto">
                    {/* ID Switcher (Admin Only, Projects section only) */}
                    {isAdmin && isProjectsSection && (
                        <div className="relative" ref={idDropdownRef}>
                            <button
                                onClick={() => setIsIdDropdownOpen(!isIdDropdownOpen)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[11px] font-black uppercase tracking-widest ${isIdDropdownOpen ? 'bg-primary/10 border-primary text-primary' : 'bg-surface border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`}
                            >
                                <Layers size={14} />
                                <span>{selectedLabel}</span>
                                <ChevronDown size={12} className={`transition-transform duration-200 ${isIdDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isIdDropdownOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-surface-card border border-border rounded-xl shadow-2xl z-[100] overflow-hidden py-1 animate-in slide-in-from-top-1 duration-200 max-h-72 overflow-y-auto">
                                    <button
                                        onClick={() => { switchId('All IDs', 'All Registered Users'); setIsIdDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${selectedId === 'All IDs' ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-hover'}`}
                                    >
                                        Switch IDs
                                        {selectedId === 'All IDs' && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                    </button>
                                    {registeredUsers.map((registeredUser) => (
                                        <button
                                            key={registeredUser.id}
                                            onClick={() => { switchId(registeredUser.id, registeredUser.name); setIsIdDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition-colors ${selectedId === registeredUser.id ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-surface-hover'}`}
                                        >
                                            {registeredUser.name}
                                            {selectedId === registeredUser.id && <div className="w-1.5 h-1.5 bg-primary rounded-full" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="w-2" /> {/* Gap before theme toggle */}
                    <div>
                        <ThemeToggle />
                    </div>

                    <div className="h-6 w-px bg-border"></div>

                    {/* Profile Section - Functional Dropdown */}
                    <div className="relative" ref={profileRef}>
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className={`flex items-center gap-3 p-2 rounded-xl transition-all border border-transparent cursor-pointer group ${isProfileOpen ? 'bg-surface-hover border-border shadow-sm' : 'hover:bg-surface-hover hover:border-border'}`}
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{user?.name || "User"}</p>
                                <p className="text-[10px] font-black text-primary uppercase tracking-wider">{user?.role || "User"}</p>
                            </div>
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-primary-hover p-0.5 shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform overflow-hidden">
                                <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-foreground text-sm">{user?.name?.charAt(0).toUpperCase() || "U"}</span>
                                    )}
                                </div>
                            </div>
                        </button>

                        <ProfileMenu
                            isOpen={isProfileOpen}
                            onClose={() => setIsProfileOpen(false)}
                            anchorRef={profileRef}
                        />
                    </div>
                </div>
            </header >
        </>
    );
}
