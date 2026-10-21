'use client';

import { useState, useEffect } from 'react';
import NewProjectModal from '@/components/dashboard/NewProjectModal';
import Link from 'next/link';
import { TrendingUp, Activity, ClipboardList, Briefcase } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useMemo } from 'react';
import { useProjectStore } from '@/store/projectStore';
import { useClientStore } from '@/store/clientStore';
import { useAuthStore } from '@/store/authStore';
import { useMeetingStore } from '@/store/meetingStore';
import { ticketsService } from '@/lib/api/services/tickets.service';

export default function DashboardPage() {
    const { user } = useAuthStore();
    const { projects, fetchAllProjects } = useProjectStore();
    const { clients, fetchAllClients } = useClientStore();
    const { meetings, fetchMeetings } = useMeetingStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tickets, setTickets] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    // Process actual data for the chart
    const processedChartData = useMemo(() => {
        const last7Days = [...Array(7)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('en-US', { weekday: 'short' }),
                projects: 0,
                tickets: 0,
                meetings: 0
            };
        });

        const formatDate = (dateStr: string | undefined) => {
            if (!dateStr) return null;
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
        };

        const isDev = user?.role === 'developer';

        const filteredTickets = isDev
            ? tickets.filter(t => t.assignedToId === user?.id)
            : tickets;

        const filteredProjects = isDev
            ? projects.filter(p => filteredTickets.some(t => t.projectId === p.id))
            : projects;

        const filteredMeetings = isDev
            ? meetings.filter(m => m.assignedTo === user?.id || m.organizer === user?.id)
            : meetings;

        filteredProjects.forEach(p => {
            const d = formatDate(p.createdAt);
            const day = last7Days.find(day => day.date === d);
            if (day) day.projects++;
        });

        filteredTickets.forEach(t => {
            const d = formatDate(t.createdAt || t.created_at);
            const day = last7Days.find(day => day.date === d);
            if (day) day.tickets++;
        });

        filteredMeetings.forEach(m => {
            const d = formatDate(m.date);
            const day = last7Days.find(day => day.date === d);
            if (day) day.meetings++;
        });

        const mapped = last7Days.map(d => ({
            name: d.label,
            "System Activity": d.tickets + d.meetings + (d.projects * 2),
            "New Tasks": d.tickets,
            "Projects": d.projects,
            fullDate: d.date
        }));

        // Use demo data when there is no real activity to display
        const hasData = mapped.some(d => d["System Activity"] > 0 || d["New Tasks"] > 0 || d["Projects"] > 0);
        if (!hasData) {
            return mapped.map((d, i) => ({
                ...d,
                "System Activity": [4, 7, 5, 9, 6, 11, 8][i],
                "New Tasks": [2, 4, 3, 6, 3, 7, 5][i],
                "Projects": [1, 2, 1, 2, 2, 3, 2][i],
            }));
        }
        return mapped;
    }, [projects, tickets, meetings, user]);

    useEffect(() => {
        setMounted(true);
        fetchAllProjects();
        fetchAllClients();
        fetchMeetings();
    }, [fetchAllProjects, fetchAllClients, fetchMeetings]);

    useEffect(() => {
        ticketsService.getAllTickets().then((data) => {
            const list = Array.isArray(data) ? data : (data?.tickets || data?.data || []);
            setTickets(list);
        }).catch(() => { });
    }, []);


    const role = `${user?.role || ''}`.toLowerCase();
    const isAdminOrPM = role === 'admin' || role === 'manager';

    const isClosed = (s: string) => {
        const l = s.toLowerCase();
        return l === 'closed' || l === 'resolved';
    };

    // Admin / PM — global stats
    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const pendingTickets = tickets.filter(t => !isClosed(`${t.status || ''}`)).length;
    const upcomingMeetings = meetings.filter(m => m.status === 'Upcoming').length;

    // Developer — personal stats
    const myTickets = tickets.filter(t => t.assignedToId === user?.id);
    const myOpenTickets = myTickets.filter(t => !isClosed(`${t.status || ''}`)).length;
    const myProjectCount = new Set(myTickets.map(t => t.projectId).filter(Boolean)).size;
    const myMeetings = meetings.filter(m =>
        (m.assignedTo === user?.id || m.organizer === user?.id) && m.status === 'Upcoming'
    ).length;

    const stats = isAdminOrPM
        ? [
            { label: 'Total Clients', value: clients.length.toString(), change: '+2.5%', href: '/dashboard/clients' },
            { label: 'Active Projects', value: activeProjects.toString(), change: '+5%', href: '/dashboard/projects' },
            { label: 'Pending Tickets', value: pendingTickets.toString(), change: pendingTickets > 0 ? '-10%' : '+0%', href: '/dashboard/tickets' },
            { label: 'Upcoming Meetings', value: myMeetings.toString(), change: upcomingMeetings > 0 ? '+0%' : '+0%', href: '/dashboard/meetings' },
        ]
        : [
            { label: 'My Open Tickets', value: myOpenTickets.toString(), change: myOpenTickets > 0 ? '-10%' : '+0%', href: '/dashboard/tickets' },
            { label: 'My Projects', value: myProjectCount.toString(), change: myProjectCount > 0 ? '+5%' : '+0%', href: '/dashboard/projects' },
            { label: 'My Meetings', value: myMeetings.toString(), change: myMeetings > 0 ? '+0%' : '+0%', href: '/dashboard/meetings' },
        ];

    return (
        <div className="flex flex-col gap-8">
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={() => setIsModalOpen(false)}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">
                        {isAdminOrPM
                            ? "A real-time snapshot of your agency's operational performance"
                            : 'Your personal tickets and project assignments at a glance'}
                    </p>
                </div>
                {isAdminOrPM && (
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary-hover text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                    >
                        + New Project
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className={`grid grid-cols-1 gap-4 ${isAdminOrPM ? 'sm:grid-cols-2 xl:grid-cols-4' : 'sm:grid-cols-3'}`}>
                {stats.map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.href}
                        className="dashboard-panel group relative overflow-hidden p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 block cursor-pointer"
                    >
                        <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.16em] mb-4 group-hover:text-primary transition-colors">
                            {stat.label}
                        </p>
                        <div className="flex items-center justify-between">
                            <span className="text-4xl font-bold text-foreground tracking-tight group-hover:scale-105 transition-transform origin-left">
                                {stat.value}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border ${stat.change.startsWith('+')
                                ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/15 bg-emerald-500/10'
                                : 'text-rose-600 dark:text-rose-400 border-rose-500/15 bg-rose-500/10'
                                }`}>
                                {stat.change}
                            </span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Activity Analytics — full width */}
            <div className="dashboard-panel rounded-2xl p-5 md:p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Activity Analytics
                    </h3>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        Live System
                    </span>
                </div>

                <div className="w-full mt-4" style={{ height: 360 }}>
                    {mounted ? (
                        <ResponsiveContainer width="100%" height={360}>
                            <AreaChart data={processedChartData}>
                                <defs>
                                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.32} />
                                        <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-secondary)" stopOpacity={0.28} />
                                        <stop offset="95%" stopColor="var(--chart-secondary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'var(--foreground)', opacity: 0.5, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: 'var(--foreground)', opacity: 0.5, fontWeight: 600 }}
                                />
                                <Tooltip
                                    cursor={{ stroke: 'var(--chart-primary)', strokeWidth: 2, strokeDasharray: '5 5' }}
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-background border border-border p-4 rounded-xl shadow-2xl backdrop-blur-md">
                                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2">{label} Activity</p>
                                                    {payload.map((entry: any, index: number) => (
                                                        <div key={index} className="flex items-center gap-3 mt-1">
                                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                            <span className="text-sm font-bold text-foreground">{entry.name}:</span>
                                                            <span className="text-sm font-black text-foreground ml-auto">{entry.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend
                                    verticalAlign="top"
                                    align="right"
                                    iconType="circle"
                                    content={({ payload }) => (
                                        <div className="flex gap-6 justify-end mb-6">
                                            {payload?.map((entry: any, index: number) => {
                                                const Icon = entry.value === "System Activity" ? Activity :
                                                    entry.value === "New Tasks" ? ClipboardList : Briefcase;
                                                return (
                                                    <div key={index} className="flex items-center gap-2 group transition-all">
                                                        <Icon size={14} style={{ color: entry.color }} className="group-hover:scale-110 transition-transform" />
                                                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">{entry.value}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="System Activity"
                                    stroke="var(--chart-primary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorActivity)"
                                    animationDuration={2000}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="New Tasks"
                                    stroke="var(--chart-secondary)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorTasks)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="animate-pulse bg-surface-hover h-full w-full rounded-xl" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
