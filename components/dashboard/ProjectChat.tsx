'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Trash2,
    Pin,
    Download,
    File as FileIcon,
    X,
    Forward,
    Bookmark,
    MessageSquare,
    MoreHorizontal,
    Pencil,
    Clock,
    Link2,
    ChevronRight,
    Maximize2,
    MessageSquareText,
    SmilePlus
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import MessageComposer from './MessageComposer';
import EnhancedEmojiPicker from './chat/EnhancedEmojiPicker';
import ForwardModal from './chat/ForwardModal';
import ReminderModal from './chat/ReminderModal';
import OrganizeModal from './chat/OrganizeModal';
import ConnectAppsModal from './chat/ConnectAppsModal';
import ImageLightbox from './chat/ImageLightbox';
import { CHANNELS, MESSAGES, USERS, PROJECT_MEMBERS, PROJECTS, Message as MockMessage, THREAD_MESSAGES } from '@/lib/mockData';

interface ProjectChatProps {
    channelId?: string | null;
    dmId?: string | null;
}

export default function ProjectChat({ channelId, dmId }: ProjectChatProps) {
    const [messages, setMessages] = useState<any[]>([]);
    const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
    const [activeThread, setActiveThread] = useState<any | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [showMoreMenu, setShowMoreMenu] = useState<string | null>(null);

    // Modal States
    const [forwardModal, setForwardModal] = useState<{ isOpen: boolean; msg: any | null }>({ isOpen: false, msg: null });
    const [reminderModal, setReminderModal] = useState<{ isOpen: boolean; msg: any | null }>({ isOpen: false, msg: null });
    const [organizeModal, setOrganizeModal] = useState<{ isOpen: boolean; msg: any | null }>({ isOpen: false, msg: null });
    const [connectModal, setConnectModal] = useState<{ isOpen: boolean; msg: any | null }>({ isOpen: false, msg: null });
    const [lightbox, setLightbox] = useState<{ isOpen: boolean; url: string; name: string }>({ isOpen: false, url: '', name: '' });

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const threadEndRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial load and filter
    useEffect(() => {
        let filtered = MESSAGES;
        if (channelId) {
            filtered = MESSAGES.filter(m => m.channelId === channelId);
        } else if (dmId) {
            filtered = MESSAGES.filter(m => m.senderId === dmId || m.senderId === '1');
        }

        const mappedMessages = filtered.map(m => {
            const sender = USERS.find(u => u.id === m.senderId);
            return {
                id: m.id,
                senderId: m.senderId,
                senderName: sender?.name || 'Unknown',
                avatar: sender?.avatar || '?',
                content: m.content,
                timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                attachments: m.attachments,
                reactions: m.reactions.map(r => ({
                    emoji: r.emoji,
                    count: r.userIds.length,
                    users: r.userIds.map(uid => USERS.find(u => u.id === uid)?.name || 'User')
                })),
                isMe: m.senderId === '1',
                isPinned: m.isPinned,
                isSaved: false,
                thread: THREAD_MESSAGES[m.id] || []
            };
        });

        setMessages(mappedMessages);
        setTimeout(scrollToBottom, 100);
    }, [channelId, dmId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    // Auto-scroll when messages change
    useEffect(() => {
        setTimeout(scrollToBottom, 100);
    }, [messages, activeThread]);

    const handleSendMessage = (content: string, attachments?: File[]) => {
        const newMessage: any = {
            id: Date.now().toString(),
            senderId: '1',
            senderName: 'You',
            avatar: 'Z',
            content: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachments: attachments?.map(file => ({
                name: file.name,
                type: file.type,
                size: `${(file.size / 1024).toFixed(1)} KB`,
                url: URL.createObjectURL(file)
            })),
            isMe: true,
            reactions: [],
            thread: []
        };

        if (activeThread) {
            setMessages(prev => prev.map(msg => {
                if (msg.id === activeThread.id) {
                    return {
                        ...msg,
                        thread: [...(msg.thread || []), newMessage]
                    };
                }
                return msg;
            }));
        } else {
            setMessages(prev => [...prev, newMessage]);
        }
    };

    const addReaction = (messageId: string, emoji: string) => {
        setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
                const reactions = [...(msg.reactions || [])];
                const existingReactionIdx = reactions.findIndex(r => r.emoji === emoji);

                if (existingReactionIdx > -1) {
                    const r = { ...reactions[existingReactionIdx] };
                    if (r.users.includes('You')) {
                        r.count--;
                        r.users = r.users.filter((u: string) => u !== 'You');
                    } else {
                        r.count++;
                        r.users = [...r.users, 'You'];
                    }
                    reactions[existingReactionIdx] = r;
                } else {
                    reactions.push({ emoji, count: 1, users: ['You'] });
                }

                return { ...msg, reactions: reactions.filter(r => r.count > 0) };
            }
            return msg;
        }));
    };

    const toggleSave = (messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isSaved: !msg.isSaved } : msg
        ));
        const msg = messages.find(m => m.id === messageId);
        if (msg?.isSaved) toast.success('Message removed from saved items');
        else toast.success('Message saved');
    };

    const togglePin = (messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isPinned: !msg.isPinned } : msg
        ));
        setShowMoreMenu(null);
    };

    const deleteMessage = (messageId: string) => {
        if (confirm('Are you sure you want to delete this message?')) {
            setMessages(prev => prev.filter(msg => msg.id !== messageId));
            toast.success('Message deleted');
        }
        setShowMoreMenu(null);
    };

    const markAsUnread = (messageId: string) => {
        setMessages(prev => prev.map(msg =>
            msg.id === messageId ? { ...msg, isUnread: true } : msg
        ));
        toast.success('Marked as unread');
        setShowMoreMenu(null);
    };

    const startEditing = (msg: any) => {
        setEditingMessageId(msg.id);
        setEditContent(msg.content);
        setShowMoreMenu(null);
    };

    const saveEdit = () => {
        if (!editingMessageId) return;
        setMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: editContent } : m));
        setEditingMessageId(null);
        toast.success('Message updated');
    };

    const copyMessageLink = (id: string) => {
        const url = `${window.location.origin}${window.location.pathname}?msg=${id}`;
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
        setShowMoreMenu(null);
    };

    const formatMessageContent = (content: string) => {
        let formatted = content;
        formatted = formatted.replace(/<div><br><\/div>$/g, '');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code class="bg-surface-hover px-2 py-0.5 rounded text-[#F26522] font-mono text-sm">$1</code>');
        return formatted;
    };

    const pinnedMessages = messages.filter(m => m.isPinned);
    const latestPinned = pinnedMessages[pinnedMessages.length - 1];

    return (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
            <div className="flex-1 flex min-h-0 relative bg-background/20 backdrop-blur-md">

                <Toaster position="top-center" />

                <div className={`flex-1 flex flex-col min-w-0 min-h-0 ${activeThread ? 'hidden lg:flex' : 'flex'}`}>
                    {latestPinned && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-2xl bg-surface/90 backdrop-blur-3xl border border-primary/30 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500 z-[30]">
                            <div className="flex items-center gap-4 px-5 py-3">
                                <div className="w-1.5 h-10 bg-gradient-to-b from-primary to-orange-500 rounded-full" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Pin size={12} className="text-primary fill-current" />
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">Pinned Message</p>
                                    </div>
                                    <p className="text-sm text-foreground/90 truncate font-semibold">
                                        <span className="text-primary">{latestPinned.senderName}:</span> {latestPinned.content.replace(/<[^>]*>/g, '')}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            const element = document.getElementById(`msg-${latestPinned.id}`);
                                            element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        }}
                                        className="px-3 py-1.5 hover:bg-surface-hover rounded-xl text-xs font-bold text-gray-400 hover:text-foreground transition-all"
                                    >
                                        View
                                    </button>
                                    <button
                                        onClick={() => togglePin(latestPinned.id)}
                                        className="p-2 hover:bg-red-500/10 rounded-xl transition-colors group/unpin"
                                        data-tooltip="Unpin"
                                    >
                                        <X size={16} className="text-gray-500 group-hover:text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex-1 min-h-0 overflow-y-auto scroll-smooth custom-scrollbar" ref={scrollRef}>
                        <div className="w-full px-4 pt-6 pb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-border/30" />
                                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] px-3 py-1 bg-surface-hover/50 rounded-full border border-border/50">Message History</span>
                                <div className="flex-1 h-px bg-border/30" />
                            </div>


                            <div className="space-y-1">
                                {messages.map((msg, idx) => {
                                    const isGrouped = idx > 0 && messages[idx - 1].senderId === msg.senderId && !msg.isMe;
                                    const hasImage = msg.attachments?.some((a: any) => a.type?.includes('image'));

                                    return (
                                        <div
                                            key={msg.id}
                                            id={`msg-${msg.id}`}
                                            className={`group relative flex gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 border-transparent ${isGrouped ? 'mt-0' : 'mt-8'} 
                                            bg-transparent rounded-2xl mx-4
                                            hover:backdrop-blur-[20px] hover:shadow-2xl hover:ring-1 hover:ring-white/10 dark:hover:ring-white/5
                                            ${msg.isPinned ? 'bg-primary/5 border-l-primary' : ''} 
                                            ${activeThread?.id === msg.id ? 'bg-primary/[0.04] ring-1 ring-primary/20' : ''} 
                                            ${msg.isUnread ? 'bg-orange-500/5 border-l-orange-500/50' : ''}
                                        `}
                                            onMouseEnter={() => setHoveredMessage(msg.id)}
                                            onMouseLeave={() => setHoveredMessage(null)}
                                        >
                                            <div className="w-10 flex-shrink-0">
                                                {!isGrouped ? (
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${msg.isMe ? 'bg-primary text-white shadow-primary/20' : 'bg-surface border border-border text-foreground'}`}>
                                                        {msg.avatar}
                                                    </div>
                                                ) : (
                                                    <div className="w-10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[9px] text-gray-500 font-medium mt-1.5">{msg.timestamp.split(' ')[0]}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                {!isGrouped && (
                                                    <div className="flex items-baseline gap-2 mb-0.5">
                                                        <span className="font-bold text-sm text-foreground hover:underline cursor-pointer tracking-tight">{msg.senderName}</span>
                                                        <span className="text-[10px] text-gray-500 font-bold">{msg.timestamp}</span>
                                                    </div>
                                                )}

                                                {editingMessageId === msg.id ? (
                                                    <div className="mt-1 space-y-2">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="w-full bg-surface-hover/50 border border-primary/30 rounded-lg p-3 text-sm text-foreground focus:outline-none focus:border-primary transition-all resize-none shadow-inner"
                                                            rows={3}
                                                            autoFocus
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={saveEdit}
                                                                className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-md hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
                                                            >
                                                                Save Changes
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingMessageId(null)}
                                                                className="px-3 py-1 bg-surface-hover text-gray-400 text-xs font-bold rounded-md hover:text-foreground transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div
                                                        className="text-base text-foreground font-medium leading-relaxed whitespace-pre-wrap break-words selection:bg-primary/30"
                                                        dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }}
                                                    />
                                                )}

                                                {msg.attachments && msg.attachments.length > 0 && (
                                                    <div className="mt-4 flex flex-col gap-3 max-w-2xl">
                                                        {msg.attachments.map((file: any, fIdx: number) => (
                                                            <div key={fIdx} className="group/file">
                                                                {file.type?.includes('image') ? (
                                                                    <div className="relative rounded-2xl overflow-hidden border border-border group/img cursor-pointer max-w-md shadow-xl"
                                                                        onClick={() => setLightbox({ isOpen: true, url: file.url || '', name: file.name })}>
                                                                        <img src={file.url} alt={file.name} className="w-full h-auto transition-transform duration-500 group-hover/img:scale-105" />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                                                                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                                                                                <Maximize2 size={24} className="text-white" />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : file.type?.includes('pdf') || file.type?.includes('application') ? (
                                                                    <div className="flex items-center gap-4 bg-surface/50 border border-border p-4 rounded-2xl hover:bg-surface transition-all shadow-md">
                                                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                            <FileIcon size={24} className="text-primary" />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm text-foreground font-bold truncate">{file.name}</p>
                                                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{file.size}</p>
                                                                        </div>
                                                                        <a href={file.url} download={file.name} className="p-3 hover:bg-surface-hover rounded-xl transition-colors">
                                                                            <Download size={18} className="text-gray-500 hover:text-primary" />
                                                                        </a>
                                                                    </div>
                                                                ) : null}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {msg.reactions && msg.reactions.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                                                        {msg.reactions.map((reaction: any, rIdx: number) => {
                                                            const hasReacted = reaction.users.includes('You');
                                                            return (
                                                                <button
                                                                    key={rIdx}
                                                                    onClick={() => addReaction(msg.id, reaction.emoji)}
                                                                    className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold transition-all border ${hasReacted
                                                                        ? 'bg-primary/10 border-primary/30 text-primary'
                                                                        : 'bg-surface/50 border-border hover:border-primary/30 text-gray-500'
                                                                        }`}
                                                                >
                                                                    <span className="text-sm">{reaction.emoji}</span>
                                                                    <span>{reaction.count}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Contextual Actions */}
                                            {(hoveredMessage === msg.id || showMoreMenu === msg.id) && (
                                                <div className="absolute -top-7 right-8 flex items-center gap-1 z-[50] animate-in fade-in slide-in-from-bottom-2 duration-300 bg-background shadow-xl border border-border px-1.5 py-1 rounded-2xl">
                                                    <div className="flex items-center">
                                                        <button onClick={() => addReaction(msg.id, '✅')} className="p-2 hover:bg-surface-hover rounded-xl transition-all text-lg">✅</button>
                                                        <button onClick={() => addReaction(msg.id, '👀')} className="p-2 hover:bg-surface-hover rounded-xl transition-all text-lg">👀</button>
                                                        <button onClick={() => addReaction(msg.id, '🙌')} className="p-2 hover:bg-surface-hover rounded-xl transition-all text-lg">🙌</button>

                                                        <EnhancedEmojiPicker
                                                            onEmojiSelect={(emoji) => addReaction(msg.id, emoji)}
                                                            triggerClassName="p-2 hover:bg-surface-hover rounded-xl transition-all group flex items-center justify-center text-gray-500 hover:text-primary"
                                                            triggerIcon={<SmilePlus size={20} />}
                                                        />
                                                    </div>

                                                    <div className="w-px h-6 bg-border mx-1.5" />

                                                    <div className="flex items-center gap-0.5">
                                                        <button onClick={() => setActiveThread(msg)} className="p-2 hover:bg-surface-hover rounded-xl transition-all text-gray-500 hover:text-primary">
                                                            <MessageSquareText size={18} />
                                                        </button>
                                                        <button onClick={() => setForwardModal({ isOpen: true, msg })} className="p-2 hover:bg-surface-hover rounded-xl transition-all text-gray-500 hover:text-primary">
                                                            <Forward size={18} />
                                                        </button>
                                                        <button onClick={() => toggleSave(msg.id)} className={`p-2 hover:bg-surface-hover rounded-xl transition-all ${msg.isSaved ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}>
                                                            <Bookmark size={18} className={msg.isSaved ? 'fill-current' : ''} />
                                                        </button>

                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setShowMoreMenu(showMoreMenu === msg.id ? null : msg.id)}
                                                                className={`p-2.5 bg-background shadow-lg border border-border rounded-full hover:scale-110 active:scale-95 transition-all ${showMoreMenu === msg.id ? 'bg-primary text-white border-primary' : 'text-gray-500 hover:text-primary'}`}
                                                            >
                                                                <MoreHorizontal size={18} />
                                                            </button>

                                                            {showMoreMenu === msg.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-[55]" onClick={() => setShowMoreMenu(null)} />
                                                                    <div className="absolute bottom-full right-0 mb-3 w-72 bg-surface/90 backdrop-blur-xl border border-border rounded-2xl shadow-2xl py-3 z-[60] animate-in slide-in-from-bottom-2 duration-200">
                                                                        <button onClick={() => startEditing(msg)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/10 transition-colors text-sm font-semibold text-foreground group">
                                                                            <div className="flex items-center gap-3"><Pencil size={16} className="text-gray-500 group-hover:text-primary" /><span>Edit Message</span></div>
                                                                        </button>

                                                                        <button onClick={() => markAsUnread(msg.id)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/10 transition-colors text-sm font-semibold text-foreground group">
                                                                            <div className="flex items-center gap-3"><Bookmark size={16} className="text-gray-500 group-hover:text-primary" /><span>Mark as Unread</span></div>
                                                                        </button>

                                                                        <button onClick={() => { setReminderModal({ isOpen: true, msg }); setShowMoreMenu(null); }} className="w-full flex items-center justify-between px-5 py-3 hover:bg-primary/10 transition-colors text-sm font-semibold text-foreground group">
                                                                            <div className="flex items-center gap-3"><Clock size={16} className="text-gray-500 group-hover:text-primary" /><span>Remind Me</span></div>
                                                                            <ChevronRight size={16} className="text-gray-400" />
                                                                        </button>

                                                                        <div className="h-px bg-border my-2 mx-3" />

                                                                        <button onClick={() => copyMessageLink(msg.id)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-primary/10 transition-colors text-sm font-semibold text-foreground group">
                                                                            <Link2 size={16} className="text-gray-500 group-hover:text-primary" /><span>Copy Deep Link</span>
                                                                        </button>

                                                                        <div className="h-px bg-border my-2 mx-3" />

                                                                        <button onClick={() => deleteMessage(msg.id)} className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-500/10 transition-colors text-sm font-semibold text-red-500 group">
                                                                            <Trash2 size={16} className="group-hover:scale-110 transition-transform" /><span>Delete Permanently</span>
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-8" />
                            </div>
                        </div>
                    </div>

                    {/* Typing Bar — always pinned at bottom, never overflows */}
                    <div className="flex-none px-4 pb-3 pt-1 bg-background/80 backdrop-blur-sm border-t border-border/50">
                        <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-[0_-4px_30px_rgba(0,0,0,0.08)] overflow-hidden">
                            <MessageComposer onSendMessage={handleSendMessage} />
                        </div>
                    </div>
                </div>




                {/* Thread Sidebar */}
                {activeThread && (
                    <div className="w-[450px] border-l border-border bg-surface flex flex-col shadow-2xl z-20 h-full animate-in slide-in-from-right duration-300">
                        <div className="flex-none flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                                    <MessageSquare size={18} />
                                </div>
                                <h3 className="font-bold text-foreground">Thread</h3>
                            </div>
                            <button onClick={() => setActiveThread(null)} className="p-2 hover:bg-surface-hover rounded-xl text-gray-500 hover:text-foreground transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background/50">
                            <div className="p-6 border-b border-border/50 bg-surface/30">
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm ${activeThread.isMe ? 'bg-primary text-white' : 'bg-surface border border-border text-foreground'}`}>
                                        {activeThread.avatar}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-2">
                                            <span className="font-bold text-foreground">{activeThread.senderName}</span>
                                            <span className="text-[10px] text-gray-500 font-bold">{activeThread.timestamp}</span>
                                        </div>
                                        <div className="text-base text-foreground leading-relaxed font-normal" dangerouslySetInnerHTML={{ __html: formatMessageContent(activeThread.content) }} />
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-6 space-y-6">
                                {(messages.find(m => m.id === activeThread.id)?.thread || []).map((msg: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 group cursor-pointer hover:bg-primary/[0.03] p-2 rounded-2xl transition-all">
                                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${msg.senderId === '1' ? 'bg-primary text-white' : 'bg-surface border border-border text-foreground'}`}>
                                            {USERS.find(u => u.id === msg.senderId)?.avatar || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2 mb-1.5">
                                                <span className="font-bold text-sm text-foreground">{USERS.find(u => u.id === msg.senderId)?.name || 'Unknown'}</span>
                                                <span className="text-[10px] text-gray-500 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <div className="text-[14px] text-foreground leading-relaxed p-3 rounded-2xl bg-surface/50 border border-border/50 transition-colors" dangerouslySetInnerHTML={{ __html: formatMessageContent(msg.content) }} />
                                        </div>
                                    </div>
                                ))}
                                <div ref={threadEndRef} className="h-6" />
                            </div>
                        </div>

                        {/* Thread Typing Bar - Consistent Spacing */}
                        <div className="flex-none bg-transparent p-4 pb-6 z-[50] relative">
                            <div className="bg-white dark:bg-zinc-900 border border-border rounded-2xl shadow-[0_10px_50px_rgba(0,0,0,0.1)] overflow-hidden">
                                <MessageComposer onSendMessage={handleSendMessage} />
                            </div>
                        </div>
                    </div>

                )}

                {/* Overlays */}
                <ForwardModal isOpen={forwardModal.isOpen} messageContent={forwardModal.msg?.content || ''} onClose={() => setForwardModal({ isOpen: false, msg: null })} onForward={(dest) => { toast.success(`Forwarded to ${dest}`); setForwardModal({ isOpen: false, msg: null }); }} />
                <ReminderModal isOpen={reminderModal.isOpen} onClose={() => setReminderModal({ isOpen: false, msg: null })} onSetReminder={(time) => { toast.success(`Reminder set for ${time}`); setReminderModal({ isOpen: false, msg: null }); }} />
                <OrganizeModal isOpen={organizeModal.isOpen} onClose={() => setOrganizeModal({ isOpen: false, msg: null })} onOrganize={(cat) => { toast.success(`Tagged as ${cat}`); setOrganizeModal({ isOpen: false, msg: null }); }} />
                <ConnectAppsModal isOpen={connectModal.isOpen} onClose={() => setConnectModal({ isOpen: false, msg: null })} onConnect={(app) => { toast.success(`Integrated with ${app}`); setConnectModal({ isOpen: false, msg: null }); }} />
                <ImageLightbox isOpen={lightbox.isOpen} imageUrl={lightbox.url} imageName={lightbox.name} onClose={() => setLightbox({ isOpen: false, url: '', name: '' })} />
            </div>
        </div>
    );
}
