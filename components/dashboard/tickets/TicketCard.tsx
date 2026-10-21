'use client';

import { Ticket, TicketPriority } from '@/store/ticketStore';
import { Calendar, Flag, Tag, GripVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface TicketCardProps {
    ticket: Ticket;
    onDragStart: (e: React.DragEvent, ticketId: string) => void;
    onTicketClick: (ticketId: string) => void;
    isDragging: boolean;
    members: Array<{ id: string; name: string; avatar?: string }>;
}

export default function TicketCard({ ticket, onDragStart, onTicketClick, isDragging, members }: TicketCardProps) {
    const assignee = members.find(u => u.id === ticket.assignedToId);

    const getPriorityConfig = (p: TicketPriority) => {
        switch (p) {
            case 'Critical':
                return { color: 'text-red-600 dark:text-red-400', bg: 'bg-background', border: 'border border-border', dot: 'bg-red-500', accent: 'border-l-red-500' };
            case 'Urgent':
                return { color: 'text-orange-600 dark:text-orange-400',  bg: 'bg-background', border: 'border border-border', dot: 'bg-orange-500', accent: 'border-l-orange-500' };
            case 'High':
                return { color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-background', border: 'border border-border', dot: 'bg-amber-500', accent: 'border-l-amber-500' };
            case 'Medium':
                return { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-background', border: 'border border-border', dot: 'bg-blue-500', accent: 'border-l-blue-500' };
            default:
                return { color: 'text-gray-500 dark:text-gray-400', bg: 'bg-background', border: 'border border-border', dot: 'bg-gray-400', accent: 'border-l-gray-400' };
        }
    };

    const priority = getPriorityConfig(ticket.priority);

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: isDragging ? 0.5 : 1, y: 0, scale: isDragging ? 0.97 : 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            draggable
            onDragStart={(e) => onDragStart(e as unknown as React.DragEvent, ticket.id)}
            className={`group bg-background rounded-xl border border-border hover:border-primary/30 
                shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing 
                border-l-[3px] ${priority.accent} select-none`}
        >
            <div className="p-3.5">
                {/* Header: Ticket Number + Grip */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-primary/70 tracking-wide uppercase">
                        {ticket.ticketNumber}
                    </span>
                    <GripVertical
                        size={14}
                        className="text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                </div>

                {/* Title */}
                <h4 
                    onClick={() => onTicketClick(ticket.id)}
                    className="text-sm font-semibold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2 cursor-pointer hover:underline"
                >
                    {ticket.title}
                </h4>

                {/* Description preview */}
                <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-1 mb-3 leading-relaxed">
                    {ticket.description}
                </p>

                {/* Tags */}
                {ticket.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {ticket.tags.slice(0, 2).map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-background 
                                    text-[10px] font-medium text-gray-500 dark:text-zinc-400 rounded-md"
                            >
                                <Tag size={8} />
                                {tag}
                            </span>
                        ))}
                        {ticket.tags.length > 2 && (
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-medium px-1">
                                +{ticket.tags.length - 2}
                            </span>
                        )}
                    </div>
                )}

                {/* Footer: Priority + Due Date + Assignee */}
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        {/* Priority badge */}
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${priority.bg} ${priority.color} ${priority.border} border`}>
                            <Flag size={9} />
                            {ticket.priority}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Due date */}
                        {ticket.dueDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400 dark:text-zinc-500">
                                <Calendar size={10} />
                                {formatDate(ticket.dueDate)}
                            </span>
                        )}

                        {/* Assignee avatar */}
                        {assignee && (
                            <div
                                className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center 
                                    text-[10px] font-bold text-primary border border-primary/20"
                                title={assignee.name}
                            >
                                {assignee.avatar || assignee.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </motion.div>
    );
}
