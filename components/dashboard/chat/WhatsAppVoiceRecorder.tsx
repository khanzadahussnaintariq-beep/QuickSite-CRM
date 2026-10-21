'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, X, Trash2, Send, Play, Pause, Square } from 'lucide-react';

interface WhatsAppVoiceRecorderProps {
    onSend: (audioBlob: Blob) => void;
}

export default function WhatsAppVoiceRecorder({ onSend }: WhatsAppVoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            if (mediaRecorderRef.current.stream) {
                mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            }
        }
        setIsRecording(false);
        setIsPaused(false);
        setAudioBlob(null);
        setRecordingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
    };

    const deleteRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setIsPlaying(false);
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
            setAudioUrl(null);
        }
    };

    const sendRecording = () => {
        if (audioBlob) {
            onSend(audioBlob);
            deleteRecording();
        }
    };

    const playAudio = () => {
        if (audioRef.current && audioUrl) {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const pauseAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Recording UI
    if (isRecording) {
        return (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 animate-in slide-in-from-right duration-200">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-red-500">Recording</span>
                </div>
                <span className="text-sm text-foreground font-mono">{formatTime(recordingTime)}</span>

                {/* Waveform visualization placeholder */}
                <div className="flex items-center gap-0.5 ml-2">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-0.5 bg-red-500 rounded-full animate-pulse"
                            style={{
                                height: `${Math.random() * 16 + 8}px`,
                                animationDelay: `${i * 50}ms`
                            }}
                        />
                    ))}
                </div>

                <div className="flex items-center gap-1 ml-auto">
                    {isPaused ? (
                        <button
                            onClick={resumeRecording}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            data-tooltip="Resume"
                        >
                            <Play size={16} className="text-foreground" />
                        </button>
                    ) : (
                        <button
                            onClick={pauseRecording}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                            data-tooltip="Pause"
                        >
                            <Pause size={16} className="text-foreground" />
                        </button>
                    )}
                    <button
                        onClick={cancelRecording}
                        className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                        data-tooltip="Cancel"
                    >
                        <X size={16} />
                    </button>
                    <button
                        onClick={stopRecording}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        data-tooltip="Stop"
                    >
                        <Square size={16} />
                    </button>
                </div>
            </div>
        );
    }

    // Preview UI (after recording)
    if (audioBlob && audioUrl) {
        return (
            <div className="flex items-center gap-2 bg-surface-card border border-border rounded-lg px-3 py-2 animate-in slide-in-from-right duration-200">
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                />
                <button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>

                <div className="flex-1">
                    <div className="h-1 bg-surface rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-1/2 transition-all" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{formatTime(recordingTime)}</p>
                </div>

                <button
                    onClick={deleteRecording}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                    data-tooltip="Delete"
                >
                    <Trash2 size={16} />
                </button>
                <button
                    onClick={sendRecording}
                    className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                    data-tooltip="Send"
                >
                    <Send size={16} />
                </button>
            </div>
        );
    }

    // Default button
    return (
        <button
            onClick={startRecording}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            data-tooltip="Record voice message"
        >
            <Mic size={18} className="text-gray-500 hover:text-foreground" />
        </button>
    );
}
