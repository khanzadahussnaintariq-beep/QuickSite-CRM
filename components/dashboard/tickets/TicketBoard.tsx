'use client';

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    Search,
    Filter,
    Plus,
    ChevronDown,
    X,
    SlidersHorizontal,
    LayoutGrid,
    User,
    Palette,
    Loader2
} from 'lucide-react';
import { Ticket, TicketStatus } from '@/store/ticketStore';
import toast from 'react-hot-toast';
import NewTicketModal from '../NewTicketModal';
import KanbanColumn from './KanbanColumn';
import TicketDetailsModal from './TicketDetailsModal';
import { AnimatePresence, motion } from 'framer-motion';
import { useTicketStore } from '@/store/ticketStore';
import { useClientStore } from '@/store/clientStore';
import { useProjectStore } from '@/store/projectStore';
import { useMemberStore } from '@/store/memberStore';
import { useAuthStore } from '@/store/authStore';
import { useAppContext } from '@/context/AppContext';

// Available color presets for new groups
const GROUP_COLORS = [
    { name: 'Blue', dot: 'bg-blue-500', bgHover: 'bg-blue-50 dark:bg-blue-500/10', bgHeader: 'bg-blue-50 dark:bg-blue-500/[0.06]', ring: 'ring-blue-500' },
    { name: 'Amber', dot: 'bg-amber-500', bgHover: 'bg-amber-50 dark:bg-amber-500/10', bgHeader: 'bg-amber-50 dark:bg-amber-500/[0.06]', ring: 'ring-amber-500' },
    { name: 'Yellow', dot: 'bg-yellow-500', bgHover: 'bg-yellow-50 dark:bg-yellow-500/10', bgHeader: 'bg-yellow-50 dark:bg-yellow-500/[0.06]', ring: 'ring-yellow-500' },
    { name: 'Green', dot: 'bg-emerald-500', bgHover: 'bg-emerald-50 dark:bg-emerald-500/10', bgHeader: 'bg-emerald-50 dark:bg-emerald-500/[0.06]', ring: 'ring-emerald-500' },
    { name: 'Purple', dot: 'bg-purple-500', bgHover: 'bg-purple-50 dark:bg-purple-500/10', bgHeader: 'bg-purple-50 dark:bg-purple-500/[0.06]', ring: 'ring-purple-500' },
    { name: 'Pink', dot: 'bg-pink-500', bgHover: 'bg-pink-50 dark:bg-pink-500/10', bgHeader: 'bg-pink-50 dark:bg-pink-500/[0.06]', ring: 'ring-pink-500' },
    { name: 'Red', dot: 'bg-red-500', bgHover: 'bg-red-50 dark:bg-red-500/10', bgHeader: 'bg-red-50 dark:bg-red-500/[0.06]', ring: 'ring-red-500' },
    { name: 'Teal', dot: 'bg-teal-500', bgHover: 'bg-teal-50 dark:bg-teal-500/10', bgHeader: 'bg-teal-50 dark:bg-teal-500/[0.06]', ring: 'ring-teal-500' },
    { name: 'Indigo', dot: 'bg-indigo-500', bgHover: 'bg-indigo-50 dark:bg-indigo-500/10', bgHeader: 'bg-indigo-50 dark:bg-indigo-500/[0.06]', ring: 'ring-indigo-500' },
];

export interface ColumnConfig {
    id: string;
    title: string;
    statuses: string[];
    color: string;
    dotColor: string;
    bgHover: string;
    bgHeader: string;
    isCustom?: boolean;
}

// Default column definitions
const DEFAULT_COLUMNS: ColumnConfig[] = [
    {
        id: 'todo',
        title: 'To Do',
        statuses: ['To Do'],
        color: 'bg-blue-500',
        dotColor: 'bg-blue-500',
        bgHover: 'bg-blue-50 dark:bg-blue-500/10',
        bgHeader: 'bg-background ',
    },
    {
        id: 'in-progress',
        title: 'In Progress',
        statuses: ['In Progress'],
        color: 'bg-amber-500',
        dotColor: 'bg-amber-500',
        bgHover: 'bg-amber-50 dark:bg-amber-500/10',
        bgHeader: 'bg-background ',
    },
    {
        id: 'review',
        title: 'Review',
        statuses: ['Review'],
        color: 'bg-yellow-500',
        dotColor: 'bg-yellow-500',
        bgHover: 'bg-yellow-50 dark:bg-yellow-500/10',
        bgHeader: 'bg-background ',
    },
    {
        id: 'complete',
        title: 'Complete',
        statuses: ['Complete'],
        color: 'bg-emerald-500',
        dotColor: 'bg-emerald-500',
        bgHover: 'bg-emerald-50 dark:bg-emerald-500/10',
        bgHeader: 'bg-background ',
    },
];

// Map column ID to the default status when dropping a ticket
const DEFAULT_COLUMN_STATUS: Record<string, TicketStatus> = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'complete': 'Complete',
};

export default function TicketBoard() {
    const { tickets, fetchAllTickets, createTicket, updateTicket, deleteTicket, isLoading } = useTicketStore();
    const { clients, fetchAllClients } = useClientStore();
    const { projects, fetchAllProjects } = useProjectStore();
    const { members, fetchAllMembers } = useMemberStore();
    const user= useAuthStore((state) => state.user);
    const { selectedId } = useAppContext();

    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createDefaultStatus, setCreateDefaultStatus] = useState<TicketStatus>('To Do');
    const [showFilters, setShowFilters] = useState(false);

    // Columns state (dynamic)
    const [columns, setColumns] = useState<ColumnConfig[]>(DEFAULT_COLUMNS);
    const [columnStatusMap, setColumnStatusMap] = useState<Record<string, TicketStatus>>(DEFAULT_COLUMN_STATUS);

    // Add Group state
    const [isAddingGroup, setIsAddingGroup] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupColor, setNewGroupColor] = useState(0); // index into GROUP_COLORS
    const newGroupInputRef = useRef<HTMLInputElement>(null);

    // Filters
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterAssignee, setFilterAssignee] = useState<string>('all');
    const [filterView, setFilterView] = useState<string>('all'); // 'my' or 'all'

    // Drag state
    const [draggingTicketId, setDraggingTicketId] = useState<string | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Modal state
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const selectedTicket = tickets.find(t => t.id === selectedTicketId) || null;
    // Current user ID (simulated)
    const currentUserId = user?.id || '';
    const normalizedRole = `${user?.role || ''} ${user?.role || ''}`.toLowerCase();
    const isDeveloper = normalizedRole.includes('developer');
    const canManageTickets = normalizedRole.includes('admin') || normalizedRole.includes('project manager') || normalizedRole.includes('manager') || normalizedRole.includes('manager');
    const canCreateTicket = canManageTickets;
    const canUpdateTicketStatus = canManageTickets || isDeveloper;
    const boardMembers = (isDeveloper && currentUserId)
        ? [{ id: currentUserId, name: user?.name || 'You', avatar: user?.avatar || user?.name?.charAt(0)?.toUpperCase() || 'U' }]
        : members;

    useEffect(() => {
        fetchAllTickets();
        if (!isDeveloper) {
            fetchAllClients();
            fetchAllProjects();
            fetchAllMembers();
        }
    }, [fetchAllTickets, fetchAllClients, fetchAllProjects, fetchAllMembers, isDeveloper]);

    // Filtered tickets
    const filteredTickets = useMemo(() => {
        let result = tickets;

        // Developers can only see tickets assigned to them
        if (isDeveloper) {
            result = result.filter(t => t.assignedToId === currentUserId);
        } else if (filterView === 'my' && currentUserId) {
            result = result.filter(t => t.assignedToId === currentUserId);
        }

        // Priority filter
        if (filterPriority !== 'all') {
            result = result.filter(t => t.priority === filterPriority);
        }

        // Assignee filter
        if (filterAssignee !== 'all') {
            result = result.filter(t => t.assignedToId === filterAssignee);
        }

        // Admin ID switch context filter: show data created by or assigned to selected user
        if (!isDeveloper && selectedId !== 'All IDs') {
            result = result.filter((t) => {
                return t.createdById === selectedId || t.assignedToId === selectedId;
            });
        }

        // Search
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.ticketNumber.toLowerCase().includes(q)
            );
        }

        return result;
    }, [tickets, searchQuery, filterPriority, filterAssignee, filterView, currentUserId, isDeveloper, selectedId]);

    // Get tickets for a specific column
    const getColumnTickets = useCallback((column: ColumnConfig) => {
        return filteredTickets.filter(t => column.statuses.includes(t.status));
    }, [filteredTickets]);

    // Drag handlers
    const handleDragStart = useCallback((e: React.DragEvent, ticketId: string) => {
        setDraggingTicketId(ticketId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', ticketId);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnId);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOverColumn(null);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, columnId: string) => {
        e.preventDefault();
        if (!canUpdateTicketStatus) {
            toast.error('You do not have permission to update ticket status.');
            return;
        }
        const ticketId = e.dataTransfer.getData('text/plain');

        if (!ticketId) return;

        // Use column status map, or the column title as a custom status
        const targetCol = columns.find(c => c.id === columnId);
        const newStatus = columnStatusMap[columnId] || (targetCol?.title as TicketStatus);
        if (!newStatus) return;

        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        // Don't update if same column
        const currentColumn = columns.find(c => c.statuses.includes(ticket.status));
        if (currentColumn?.id === columnId) {
            setDraggingTicketId(null);
            setDragOverColumn(null);
            return;
        }

        try {
            await updateTicket(ticketId, { status: newStatus });
        } catch {
            toast.error('Failed to move ticket');
            setDraggingTicketId(null);
            setDragOverColumn(null);
            return;
        }

        toast.success(`Moved to ${targetCol?.title}`, {
            icon: '✅',
            style: {
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 600,
            },
        });

        setDraggingTicketId(null);
        setDragOverColumn(null);
    }, [tickets, columns, columnStatusMap, updateTicket, canUpdateTicketStatus]);

    // Create ticket handler
    const handleCreateTicket = useCallback(async (newTicket: any) => {
        if (!canCreateTicket) {
            toast.error('You do not have permission to create tickets.');
            return;
        }
        try {
            const created = await createTicket({
                ...newTicket,
                createdById: currentUserId,
            });
            // Backend sometimes ignores status on creation — correct it immediately
            if (created && created.status !== newTicket.status) {
                await updateTicket(created.id, { status: newTicket.status });
            }
            toast.success('Ticket created!', {
                icon: '🎫',
                style: {
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                },
            });
        } catch {
            toast.error('Failed to create ticket');
        }
    }, [createTicket, updateTicket, currentUserId, canCreateTicket]);

    // Update ticket handler
    const handleUpdateTicket = useCallback(async (ticketId: string, updates: Partial<Ticket>) => {
        if (!canManageTickets) {
            toast.error('Only Admin or Project Manager can update tickets.');
            return;
        }
        try {
            await updateTicket(ticketId, updates);
            toast.success('Ticket updated!', {
                icon: '✏️',
                style: {
                    borderRadius: '12px',
                    background: 'var(--surface)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    fontWeight: 600,
                },
            });
        } catch {
            toast.error('Failed to update ticket');
        }
    }, [updateTicket, canManageTickets]);

    const handleDeleteTicket = useCallback(async (ticketId: string) => {
        if (!canManageTickets) {
            toast.error('Only Admin or Project Manager can delete tickets.');
            return;
        }

        if (!confirm('Are you sure you want to delete this ticket?')) {
            return;
        }

        try {
            await deleteTicket(ticketId);
            toast.success('Ticket deleted successfully!');
            setSelectedTicketId(null);
        } catch {
            toast.error('Failed to delete ticket');
        }
    }, [deleteTicket, canManageTickets]);

    // Handle add from column
    const handleAddFromColumn = useCallback((columnId: string) => {
        if (!canCreateTicket) {
            toast.error('You do not have permission to create tickets.');
            return;
        }
        const targetCol = columns.find(c => c.id === columnId);
        const status = columnStatusMap[columnId] || (targetCol?.title as TicketStatus) || 'To Do';
        setCreateDefaultStatus(status);
        setIsCreateModalOpen(true);
    }, [canCreateTicket, columns, columnStatusMap]);

    // Add new group
    const handleAddGroup = () => {
        const name = newGroupName.trim();
        if (!name) {
            toast.error('Please enter a group name');
            return;
        }

        // Check for duplicate names
        if (columns.some(c => c.title.toLowerCase() === name.toLowerCase())) {
            toast.error('A group with that name already exists');
            return;
        }

        const colorPreset = GROUP_COLORS[newGroupColor];
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
        const statusName = name as TicketStatus;

        const newColumn: ColumnConfig = {
            id,
            title: name,
            statuses: [statusName],
            color: colorPreset.dot,
            dotColor: colorPreset.dot,
            bgHover: colorPreset.bgHover,
            bgHeader: colorPreset.bgHeader,
            isCustom: true,
        };

        setColumns(prev => [...prev, newColumn]);
        setColumnStatusMap(prev => ({ ...prev, [id]: statusName }));

        toast.success(`Group "${name}" added!`, {
            icon: '📋',
            style: {
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 600,
            },
        });

        setNewGroupName('');
        setNewGroupColor(0);
        setIsAddingGroup(false);
    };

    // Delete a custom group
    const handleDeleteGroup = useCallback((columnId: string) => {
        const col = columns.find(c => c.id === columnId);
        if (!col?.isCustom) return;

        // Move tickets from this column back to "To Do"
        const ticketsToMove = tickets.filter(t => col.statuses.includes(t.status));
        ticketsToMove.forEach((t) => {
            updateTicket(t.id, { status: 'To Do' as TicketStatus }).catch(() => null);
        });

        setColumns(prev => prev.filter(c => c.id !== columnId));
        setColumnStatusMap(prev => {
            const next = { ...prev };
            delete next[columnId];
            return next;
        });

        toast.success(`Group "${col.title}" removed`, {
            icon: '🗑️',
            style: {
                borderRadius: '12px',
                background: 'var(--surface)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
                fontSize: '13px',
                fontWeight: 600,
            },
        });
    }, [columns, tickets, updateTicket]);

    // Clear all filters
    const clearFilters = () => {
        setFilterPriority('all');
        setFilterAssignee('all');
        setSearchQuery('');
    };

    const hasActiveFilters = filterPriority !== 'all' || filterAssignee !== 'all' || searchQuery.trim() !== '';
    const totalFiltered = filteredTickets.length;
    const totalAll = isDeveloper
        ? tickets.filter(t => t.assignedToId === currentUserId).length
        : (filterView === 'my' ? tickets.filter(t => t.assignedToId === currentUserId).length : tickets.length);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <NewTicketModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateTicket}
                members={boardMembers}
                projects={projects}
                defaultAssigneeId={currentUserId}
                defaultStatus={createDefaultStatus}
            />

            <TicketDetailsModal
                ticket={selectedTicket}
                isOpen={!!selectedTicketId}
                onClose={() => setSelectedTicketId(null)}
                onUpdateTicket={handleUpdateTicket}
                onDeleteTicket={handleDeleteTicket}
                columns={columns}
                members={boardMembers}
                canManageTickets={canManageTickets}
            />

            {/* Toolbar */}
            <div className="flex-none space-y-3 mb-4">
                {/* Top bar: Search + Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-600" size={16} />
                        <input
                            type="text"
                            placeholder="Search by title, description, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border rounded-xl pl-10 pr-10 py-2.5 text-sm 
                                outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm
                                placeholder:text-gray-400 dark:placeholder:text-zinc-600"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-foreground transition-colors"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* View Toggle */}
                        {!isDeveloper && (
                            <div className="flex items-center bg-background rounded-xl p-0.5 border border-border">
                            <button
                                onClick={() => setFilterView('my')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterView === 'my'
                                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-foreground'
                                    }`}
                            >
                                <User size={13} />
                                <span className="hidden sm:inline">My Tickets</span>
                            </button>
                            <button
                                onClick={() => setFilterView('all')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterView === 'all'
                                        ? 'bg-primary text-white shadow-sm shadow-primary/20'
                                        : 'text-gray-500 dark:text-zinc-400 hover:text-foreground'
                                    }`}
                            >
                                <LayoutGrid size={13} />
                                <span className="hidden sm:inline">All</span>
                            </button>
                            </div>
                        )}

                        {/* Filter Toggle */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${showFilters || hasActiveFilters
                                    ? 'bg-primary/5 border-primary/20 text-primary'
                                    : 'bg-background border-border text-gray-500 dark:text-zinc-400 hover:border-primary/20 hover:text-primary'
                                }`}
                        >
                            <SlidersHorizontal size={14} />
                            <span className="hidden sm:inline">Filters</span>
                            {hasActiveFilters && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            )}
                        </button>

                        {/* Create Ticket */}
                        {canCreateTicket && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl 
                                    text-xs font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30
                                    hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">Create Ticket</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter Bar */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="flex flex-wrap items-center gap-3 px-4 py-3 bg-background rounded-xl border border-border">
                                <Filter size={14} className="text-gray-400 flex-shrink-0" />

                                {/* Priority Filter */}
                                <div className="relative">
                                    <select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="appearance-none bg-background  border border-border rounded-lg pl-3 pr-8 py-1.5 
                                            text-xs font-medium text-foreground cursor-pointer hover:border-primary/30 transition-colors
                                            focus:outline-none focus:border-primary/50"
                                    >
                                        <option value="all">All Priorities</option>
                                        <option value="Critical">Critical</option>
                                        <option value="Urgent">Urgent</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>

                                {/* Assignee Filter */}
                                {!isDeveloper && (
                                    <div className="relative">
                                        <select
                                            value={filterAssignee}
                                            onChange={(e) => setFilterAssignee(e.target.value)}
                                            className="appearance-none bg-background border border-border rounded-lg pl-3 pr-8 py-1.5 
                                                text-xs font-medium text-foreground cursor-pointer hover:border-primary/30 transition-colors
                                                focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="all">All Assignees</option>
                                            {boardMembers.map(user => (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                )}

                                {/* Results count */}
                                <span className="text-[11px] font-medium text-gray-400 dark:text-zinc-500 ml-auto">
                                    {totalFiltered} of {totalAll} tickets
                                </span>

                                {/* Clear filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
                                    >
                                        <X size={12} />
                                        Clear
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Board */}
            <div
                className="flex-1 overflow-x-auto overflow-y-hidden pb-2"
                onDragEnd={() => {
                    setDraggingTicketId(null);
                    setDragOverColumn(null);
                }}
            >
                {isLoading && tickets.length === 0 ? (
                     <div className="flex flex-col items-center justify-center py-20 bg-background">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground font-bold">Loading Tickets...</p>
                        </div>
                ) : (
                <div className="flex gap-4 h-full min-w-max px-0.5">
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tickets={getColumnTickets(column)}
                            draggingTicketId={draggingTicketId}
                            dragOverColumn={dragOverColumn}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onAddTicket={handleAddFromColumn}
                            onTicketClick={setSelectedTicketId}
                            onDeleteGroup={column.isCustom ? handleDeleteGroup : undefined}
                            members={boardMembers}
                        />
                    ))}
                </div>
                )}
            </div>
        </div>
    );
}
