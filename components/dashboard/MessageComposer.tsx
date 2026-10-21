'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Send,
    Paperclip,
    Smile,
    AtSign,
    Video,
    Mic,
    Zap,
    Bold as BoldIcon,
    Italic as ItalicIcon,
    Strikethrough,
    Code,
    Link2,
    List,
    ListOrdered,
    AlignLeft,
    X,
    ChevronDown,
    ChevronUp,
    Monitor,
    MousePointer2,
    Highlighter,
    Square
} from 'lucide-react';
import EnhancedEmojiPicker from './chat/EnhancedEmojiPicker';
import VoiceRecorder from './chat/VoiceRecorder';

interface MessageComposerProps {
    onSendMessage: (message: string, attachments?: File[]) => void;
}

export default function MessageComposer({ onSendMessage }: MessageComposerProps) {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMentions, setShowMentions] = useState(false);
    const [showFormatting, setShowFormatting] = useState(true);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [isRecording, setIsRecording] = useState<'audio' | 'video' | null>(null);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [showRecordingModal, setShowRecordingModal] = useState(false);
    const [recordingType, setRecordingType] = useState<'screen-audio' | 'screen-video' | 'audio' | 'video' | null>(null);
    const [drawingTool, setDrawingTool] = useState<'pencil' | 'highlighter' | 'eraser' | null>(null);

    const editableRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Handle click outside emoji picker
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

    // Handle file drop
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        setAttachments(prev => [...prev, ...files]);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    // File upload
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setAttachments(prev => [...prev, ...files]);
        }
    };

    // Remove attachment
    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Rich Text Formatting using execCommand
    const applyFormatting = (cmd: string, value: string = '') => {
        document.execCommand(cmd, false, value);
        editableRef.current?.focus();
    };

    // Media Recording Logic
    const startRecording = async (type: 'audio' | 'video' | 'screen-audio' | 'screen-video') => {
        try {
            let stream: MediaStream;

            if (type.startsWith('screen')) {
                // Screen Recording
                stream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: type === 'screen-audio'
                });

                if (type === 'screen-video') {
                    // Combine screen with webcam
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    // Logic to combine streams would go here (complex for vanilla JS, usually requires a canvas or multiple video elements)
                    // For now, we'll just use screen stream
                }
            } else {
                // Standard Camera/Mic Recording
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: type === 'video'
                });
            }

            streamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            const chunks: Blob[] = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: type.includes('video') || type.includes('screen') ? 'video/webm' : 'audio/webm' });
                const extension = type.includes('video') || type.includes('screen') ? 'webm' : 'wav';
                const file = new File([blob], `${type}_clip_${Date.now()}.${extension}`, { type: blob.type });
                setAttachments(prev => [...prev, file]);
                stopMediaStream();
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(type.includes('video') || type.includes('screen') ? 'video' : 'audio');
            setRecordingType(type);

            setRecordingDuration(0);
            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Recording error:", err);
            alert("Could not access media devices or recording was cancelled.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(null);
        if (timerRef.current) clearInterval(timerRef.current);
    };

    const stopMediaStream = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Send message
    const handleSend = () => {
        const content = editableRef.current?.innerHTML || '';
        if (!content.trim() && attachments.length === 0) return;

        onSendMessage(content, attachments);

        if (editableRef.current) {
            editableRef.current.innerHTML = '';
        }
        setAttachments([]);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // Enter to send, Shift + Enter for new line
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }

        // @ for mentions (Basic trigger)
        if (e.key === '@') {
            setShowMentions(true);
        }
    };

    // Insert emoji
    const insertEmoji = (emoji: string) => {
        applyFormatting('insertText', emoji);
        setShowEmojiPicker(false);
    };

    return (
        <div className="w-full bg-background p-2">


            {/* Attachments Preview */}
            {attachments.length > 0 && (
                <div className="p-3 border-b border-border">
                    <div className="flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-surface-hover border border-border px-3 py-2 rounded-lg group">
                                <Paperclip size={14} className="text-[#F26522]" />
                                <span className="text-xs text-foreground max-w-[200px] truncate">{file.name}</span>
                                <span className="text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                <button
                                    onClick={() => removeAttachment(idx)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={14} className="text-gray-500 hover:text-red-500" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Main Composer */}
            <div
                className={`relative  ${isDragging ? 'bg-[#F26522]/10 border-2 border-dashed border-[#F26522]' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                {isDragging && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/90 backdrop-blur-sm">
                        <div className="text-center">
                            <Paperclip size={48} className="mx-auto text-[#F26522] mb-2" />
                            <p className="text-foreground font-medium">Drop files to attach</p>
                        </div>
                    </div>
                )}

                {/* Formatting Toolbar */}
                {showFormatting && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-transparent">
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('bold')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Bold (Ctrl+B)"
                        >
                            <BoldIcon size={16} className="text-foreground" />
                        </button>
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('italic')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Italic (Ctrl+I)"
                        >
                            <ItalicIcon size={16} className="text-foreground" />
                        </button>
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('strikeThrough')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Strikethrough"
                        >
                            <Strikethrough size={16} className="text-foreground" />
                        </button>
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('formatBlock', '<pre>')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Code Block"
                        >
                            <Code size={16} className="text-foreground" />
                        </button>
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                                const url = prompt("Enter URL:");
                                if (url) applyFormatting('createLink', url);
                            }}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Insert Link"
                        >
                            <Link2 size={16} className="text-gray-500" />
                        </button>

                        <div className="w-px h-4 bg-border mx-1" />

                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('insertUnorderedList')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Bulleted List"
                        >
                            <List size={16} className="text-gray-500" />
                        </button>
                        <button
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => applyFormatting('insertOrderedList')}
                            className="p-1.5 hover:bg-surface-hover rounded transition-colors"
                            data-tooltip="Numbered List"
                        >
                            <ListOrdered size={16} className="text-gray-500" />
                        </button>

                        <div className="flex-1" />

                        <button
                            onClick={() => setShowFormatting(false)}
                            className="text-xs text-gray-500 hover:text-foreground px-2 py-1 hover:bg-surface-hover rounded transition-colors"
                        >
                            Hide formatting
                        </button>
                    </div>
                )}

                <div className="p-3 flex items-end gap-3 bg-background rounded-xl w-full border border-border focus-within:border-primary/30 transition-all shadow-sm">
                    <div className="flex-1 relative min-h-[40px] flex items-center">
                        <div
                            ref={editableRef}
                            contentEditable
                            onKeyDown={handleKeyDown}
                            className="w-full bg-transparent text-foreground focus:outline-none text-base min-h-[24px] max-h-[400px] overflow-y-auto py-1 leading-relaxed custom-scrollbar"
                            style={{ outline: 'none' }}
                            data-placeholder="Start typing your message..."
                        />
                        {!editableRef.current?.innerHTML && (
                            <style>{`
                                [contentEditable]:empty:before {
                                    content: attr(data-placeholder);
                                    color: #9ca3af;
                                    cursor: text;
                                    opacity: 0.5;
                                }
                            `}</style>
                        )}
                    </div>

                    {/* Voice Recorder & Send Button integrated in input area */}
                    <div className="flex items-center gap-2 pb-1 relative z-50">
                        <VoiceRecorder
                            onSend={(blob) => {
                                const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
                                setAttachments(prev => [...prev, file]);
                            }}
                        />
                        <button
                            onClick={handleSend}
                            className="p-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95]"
                            data-tooltip="Send message"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="flex items-center justify-between px-3 pb-3">
                    <div className="flex items-center gap-1">
                        {/* Emoji Picker - First position as requested */}
                        <EnhancedEmojiPicker onEmojiSelect={insertEmoji} triggerClassName="p-2 hover:bg-surface-hover rounded-lg transition-colors" triggerIcon={<Smile size={18} className="text-gray-500" />} />

                        {/* Attach Files */}
                        <div className="relative group">
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                onDoubleClick={() => fileInputRef.current?.click()}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors relative group/tooltip"
                            >
                                <Paperclip size={18} className="text-gray-500" />
                                <div className="absolute bottom-full left-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-[60] shadow-xl border border-white/10">
                                    Attach
                                    <div className="text-[10px] text-gray-400 mt-0.5">Tip: double click to upload</div>
                                </div>
                            </button>
                        </div>

                        {/* Format Text */}
                        {!showFormatting && (
                            <button
                                onClick={() => setShowFormatting(true)}
                                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                                data-tooltip="Show formatting"
                            >
                                <AlignLeft size={18} className="text-gray-500" />
                            </button>
                        )}

                        {/* @Mention */}
                        <button
                            onClick={() => setShowMentions(!showMentions)}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            data-tooltip="Mention someone"
                        >
                            <AtSign size={18} className="text-gray-500" />
                        </button>

                        {/* Video Clip */}
                        <button
                            onClick={() => isRecording === 'video' ? stopRecording() : startRecording('video')}
                            className={`p-2 rounded-lg transition-colors ${isRecording === 'video' ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-surface-hover text-gray-500'
                                }`}
                            data-tooltip={isRecording === 'video' ? "Stop recording" : "Record video clip"}
                        >
                            <Video size={18} />
                        </button>

                        {/* Screen Recording */}
                        <div className="relative">
                            <button
                                onClick={() => setShowRecordingModal(!showRecordingModal)}
                                className={`p-2 rounded-lg transition-colors ${showRecordingModal ? 'bg-primary/10 text-primary' : 'hover:bg-surface-hover text-gray-500'}`}
                                data-tooltip="Record Screen"
                            >
                                <Monitor size={18} />
                            </button>

                            {showRecordingModal && (
                                <div className="absolute bottom-full left-0 mb-4 bg-surface-card border border-border rounded-xl shadow-2xl p-4 z-[70] w-64 animate-in slide-in-from-bottom-2 duration-200">
                                    <p className="text-xs font-bold text-foreground uppercase tracking-widest mb-3">Record Screen</p>
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => {
                                                setShowRecordingModal(false);
                                                startRecording('screen-audio');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover rounded-lg transition-colors group"
                                        >
                                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20">
                                                <Mic size={16} className="text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-foreground">Screen + Audio</p>
                                                <p className="text-[10px] text-gray-500">Record tabs and mic</p>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowRecordingModal(false);
                                                startRecording('screen-video');
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover rounded-lg transition-colors group"
                                        >
                                            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20">
                                                <Video size={16} className="text-primary" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-foreground">Screen + Video</p>
                                                <p className="text-[10px] text-gray-500">Record with camera pip</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Shortcuts */}
                        <button
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            data-tooltip="Run shortcut"
                        >
                            <Zap size={18} className="text-gray-500" />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* No duplicate send button needed here */}
                    </div>
                </div>

                {/* Recording Indicator Overlay */}
                {isRecording && (
                    <div className="absolute inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-between px-8 animate-in slide-in-from-bottom duration-500">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="w-4 h-4 bg-red-500 rounded-sm shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg text-foreground font-black tracking-tight flex items-center gap-2">
                                    {recordingType?.replace('-', ' + ')} in progress...
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-500 font-bold uppercase tracking-widest bg-surface px-2 py-0.5 rounded border border-border">
                                        {formatTime(recordingDuration)}
                                    </span>
                                    {recordingType?.startsWith('screen') && (
                                        <div className="flex items-center gap-1 ml-2">
                                            <div className="w-1 h-1 bg-gray-500 rounded-full" />
                                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recording Screen</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Drawing Tools Overlay (Compact) */}
                        {recordingType?.startsWith('screen') && (
                            <div className="flex items-center gap-1 bg-surface border border-border rounded-2xl p-1.5 shadow-2xl">
                                <button
                                    onClick={() => setDrawingTool('pencil')}
                                    className={`p-2 rounded-xl transition-all ${drawingTool === 'pencil' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-surface-hover text-gray-500'}`}
                                    data-tooltip="Pencil"
                                >
                                    <MousePointer2 size={18} />
                                </button>
                                <button
                                    onClick={() => setDrawingTool('highlighter')}
                                    className={`p-2 rounded-xl transition-all ${drawingTool === 'highlighter' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-surface-hover text-gray-500'}`}
                                    data-tooltip="Highlighter"
                                >
                                    <Highlighter size={18} />
                                </button>
                                <button
                                    onClick={() => setDrawingTool('eraser')}
                                    className={`p-2 rounded-xl transition-all ${drawingTool === 'eraser' ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'hover:bg-surface-hover text-gray-500'}`}
                                    data-tooltip="Eraser"
                                >
                                    <Square size={18} />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <button
                                onClick={stopMediaStream}
                                className="px-5 py-2.5 text-xs font-black text-gray-500 hover:text-foreground hover:bg-surface-hover rounded-xl transition-all uppercase tracking-widest"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={stopRecording}
                                className="px-8 py-3 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all shadow-2xl shadow-red-500/30 hover:scale-[1.05] active:scale-[0.95] uppercase tracking-widest"
                            >
                                Stop & Attach
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
