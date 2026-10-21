'use client';

import { MoreHorizontal, Calendar, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectCardProps {
    project: any;
    onDelete?: () => void;
    onEdit?: () => void;
    canManage?: boolean;
    assignees?: { id: string; name: string }[];
}

export default function ProjectCard({ project, onDelete, onEdit, canManage = true, assignees = [] }: ProjectCardProps) {
    const router = useRouter();

    const formatStatusLabel = (status?: string) => {
        if (!status) return 'Planning';
        return status
            .toString()
            .replace(/_/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const getStatusColor = (status: string) => {
        switch (formatStatusLabel(status)) {
            case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'On Hold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Planning': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        }
    };

    return (
        <div
            className="bg-surface-card p-6 rounded-2xl hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-orange-500/10 group border border-border/50 relative overflow-visible h-full flex flex-col"
        >
            {/* Background Glow Container - strictly contained so it doesn't cause horizontal page scroll */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent blur-3xl -mr-16 -mt-16 group-hover:opacity-100 transition-opacity opacity-50`} />
            </div>

            <div className="flex justify-between items-start mb-5 relative z-10">
                <span className={`text-[10px] px-3 py-1 rounded-full font-bold whitespace-nowrap border ${getStatusColor(project.status)}`}>
                    {formatStatusLabel(project.status)}
                </span>
                {canManage && (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.();
                            }}
                            className="p-2 hover:bg-red-500/10 rounded-full transition-colors text-gray-400 hover:text-red-500"
                            data-tooltip="Delete Project"
                        >
                            <Trash2 size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.();
                            }}
                            className="p-2 hover:bg-surface-hover rounded-full transition-colors text-gray-400 hover:text-foreground"
                            data-tooltip="Edit Project"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                    </div>
                )}
            </div>

            <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors tracking-tight">{project.title}</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">{project.client}</p>

            <div className="flex-1 space-y-6 relative z-10">
                {/* Progress */}
                <div>
                    <div className="flex justify-between text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        <span>Progress</span>
                        <span className="text-foreground">{project.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-surface-hover rounded-full overflow-hidden p-0.5 border border-border/30">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(242,101,34,0.3)]"
                            style={{ width: `${project.progress}%` }}
                        ></div>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-5 border-t border-border/50">
                    <div className="flex -space-x-2">
                        {assignees.map((assignee) => (
                            <div key={assignee.id} className="relative group/avatar">
                                <div className="w-8 h-8 rounded-full bg-primary/10 border-2 border-surface-card flex items-center justify-center text-xs text-primary font-bold shadow-sm hover:z-10 transition-transform hover:-translate-y-1 cursor-default select-none">
                                    {assignee.name[0].toUpperCase()}
                                </div>
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover/avatar:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {assignee.name}
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-900 rotate-45 -translate-y-0.75" />
                                </div>
                            </div>
                        ))}
                        {assignees.length === 0 && (
                            <div className="w-8 h-8 rounded-full bg-surface border-2 border-dashed border-border flex items-center justify-center text-xs text-gray-400">
                                —
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-tighter bg-surface/50 px-3 py-1.5 rounded-lg border border-border/50">
                        <Calendar size={14} className="text-primary" />
                        <span>{project.dueDate}</span>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 relative z-10">
                {project.tags?.map((tag: string, i: number) => (
                    <span key={i} className="text-[10px] font-bold text-gray-400 bg-surface/50 px-2.5 py-1.5 rounded-lg border border-border/50 uppercase tracking-widest">{tag}</span>
                ))}
            </div>
        </div>
    );
}
