'use client';

import { useState } from 'react';
import { Pin, X, MessageSquare } from 'lucide-react';

interface PinnedMessage {
    id: string;
    text: string;
    author: string;
    timestamp: string;
}

export default function PinnedMessages() {
    const [pinnedMessages] = useState<PinnedMessage[]>([
        { id: '1', text: 'Remember to update the API endpoints before deployment', author: 'Alice', timestamp: '2 hours ago' },
        { id: '2', text: 'Design assets are in the shared drive', author: 'Bob', timestamp: '1 day ago' },
        { id: '3', text: 'Client meeting scheduled for Friday 3 PM', author: 'Charlie', timestamp: '2 days ago' },
    ]);

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <Pin size={20} className="text-primary" />
                <h3 className="text-lg font-bold text-foreground">Pinned Messages</h3>
                <span className="text-xs text-muted-foreground">({pinnedMessages.length})</span>
            </div>

            {pinnedMessages.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
                    <Pin className="mx-auto text-muted-foreground mb-3" size={48} />
                    <p className="text-sm text-muted-foreground">No pinned messages yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {pinnedMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className="bg-surface-card border border-border rounded-xl p-4 hover:border-primary/50 transition-all group"
                        >
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <MessageSquare size={16} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground mb-1">{msg.text}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="font-medium">{msg.author}</span>
                                        <span>•</span>
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </div>
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-surface-hover rounded transition-all">
                                    <X size={14} className="text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
