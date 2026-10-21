'use client';

import { Ticket } from '@/store/ticketStore';
import { Plus, Inbox, Trash2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import TicketCard from './TicketCard';

interface ColumnConfig {
    id: string;
    title: string;
    statuses: string[];
    color: string;
    dotColor: string;
    bgHover: string;
    bgHeader: string;
}

interface KanbanColumnProps {
    column: ColumnConfig;
    tickets: Ticket[];
    draggingTicketId: string | null;
    dragOverColumn: string | null;
    onDragStart: (e: React.DragEvent, ticketId: string) => void;
    onDragOver: (e: React.DragEvent, columnId: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, columnId: string) => void;
    onAddTicket: (columnId: string) => void;
    onTicketClick: (ticketId: string) => void;
    onDeleteGroup?: (columnId: string) => void;
    members: Array<{ id: string; name: string; avatar?: string }>;
}

export default function KanbanColumn({
    column,
    tickets,
    draggingTicketId,
    dragOverColumn,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDrop,
    onAddTicket,
    onTicketClick,
    onDeleteGroup,
    members,
}: KanbanColumnProps) {
    const isOver = dragOverColumn === column.id;
    const user = useAuthStore((state) => state.user);
    return (
        <div
            className={`group/col flex flex-col min-w-[280px] sm:min-w-[300px] md:min-w-[320px] max-w-[360px] border border-border flex-1 rounded-2xl transition-all duration-300 
                ${isOver
                    ? `bg-background ring-2 ring-offset-2 ring-offset-background ${column.color.replace('bg-', 'ring-')}`
                    : 'bg-background'}
                }`}
            onDragOver={(e) => onDragOver(e, column.id)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column.id)}
        >
            {/* Column Header */}
            <div className={`flex items-center justify-between px-4 py-3.5 rounded-t-2xl ${column.bgHeader}`}>
                <div className="flex items-center gap-2.5">
                    <div className={`w-2.5 h-2.5 rounded-full ${column.dotColor} shadow-sm`} />
                    <h3 className="text-sm font-bold text-foreground tracking-tight">{column.title}</h3>
                    <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-zinc-200/80 dark:bg-zinc-700/80 text-[10px] font-bold text-gray-600 dark:text-zinc-300">
                        {tickets.length}
                    </span>
                </div>
               {(user?.role === 'admin' || user?.role === 'manager') && (
                    <button
                        onClick={() => onAddTicket(column.id)}
                        className="p-1.5 rounded-lg bg-background text-gray-400 hover:text-primary transition-all"
                        title={`Add ticket to ${column.title}`}
                    >
                        <Plus size={16} />
                    </button>
                )}
                {onDeleteGroup && (
                    <button
                        onClick={() => onDeleteGroup(column.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-300 dark:text-zinc-600 hover:text-red-500 transition-all opacity-0 group-hover/col:opacity-100"
                        title={`Remove ${column.title} group`}
                    >
                        <Trash2 size={14} />
                    </button>
                )}
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5 custom-scrollbar min-h-[100px]">
                <AnimatePresence mode="popLayout">
                    {tickets.length > 0 ? (
                        tickets.map(ticket => (
                            <TicketCard
                                key={ticket.id}
                                ticket={ticket}
                                onDragStart={onDragStart}
                                onTicketClick={onTicketClick}
                                isDragging={draggingTicketId === ticket.id}
                                members={members}
                            />
                        ))
                    ) : (
                        /* Empty State */
                        <div className="flex flex-col items-center justify-center py-10 px-4">
                            <div className={`w-14 h-14 rounded-2xl ${column.bgHover} flex items-center justify-center mb-3`}>
                                <Inbox size={24} className="text-gray-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-400 dark:text-zinc-600 text-center">
                                No tickets here
                            </p>
                            <p className="text-[10px] text-gray-300 dark:text-zinc-700 text-center mt-0.5">
                                Drag tickets or create new
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
