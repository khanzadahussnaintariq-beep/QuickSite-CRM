'use client';

import { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send, X } from 'lucide-react';

interface VoiceRecorderProps {
    onSend: (audioBlob: Blob) => void;
}

export default function VoiceRecorder({ onSend }: VoiceRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

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
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setIsPaused(false);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please check permissions.');
        }
    };

    const pauseRecording = () => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const resumeRecording = () => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        }
    };

    const playAudio = () => {
        if (audioBlob && audioRef.current) {
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

    const deleteRecording = () => {
        setAudioBlob(null);
        setRecordingTime(0);
        setIsPlaying(false);
    };

    const sendRecording = () => {
        if (audioBlob) {
            onSend(audioBlob);
            deleteRecording();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentPlaybackTime(audioRef.current.currentTime);
        }
    };

    if (audioBlob) {
        const progress = recordingTime > 0 ? (currentPlaybackTime / recordingTime) * 100 : 0;
        return (
            <div className="flex items-center gap-2 bg-surface-card border border-border rounded-lg p-3">
                <audio
                    ref={audioRef}
                    src={URL.createObjectURL(audioBlob)}
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => {
                        setIsPlaying(false);
                        setCurrentPlaybackTime(0);
                    }}
                />
                <button
                    onClick={isPlaying ? pauseAudio : playAudio}
                    className="p-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                </button>
                <div className="flex-1">
                    <div className="h-1 bg-surface rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-100"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-1">
                        <p className="text-[10px] text-muted-foreground">{formatTime(currentPlaybackTime)}</p>
                        <p className="text-[10px] text-muted-foreground">{formatTime(recordingTime)}</p>
                    </div>
                </div>
                <button
                    onClick={deleteRecording}
                    className="p-2 hover:bg-red-500/10 text-red-500 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
                <button
                    onClick={sendRecording}
                    className="p-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
        );
    }

    if (isRecording) {
        return (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-lg p-3 animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center gap-2 pr-2 border-r border-red-500/20">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <span className="text-xs font-black uppercase tracking-widest text-red-500">
                        {isPaused ? 'Paused' : 'Recording'}
                    </span>
                </div>

                <span className="text-sm text-foreground font-mono font-bold min-w-[45px]">
                    {formatTime(recordingTime)}
                </span>

                {/* Decorative Waveform */}
                {!isPaused && (
                    <div className="flex items-center gap-0.5 px-2">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="w-0.5 bg-red-500/60 rounded-full animate-voice-wave"
                                style={{
                                    height: '12px',
                                    animationDelay: `${i * 100}ms`
                                }}
                            />
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-1 ml-auto">
                    {isPaused ? (
                        <button
                            onClick={resumeRecording}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-foreground"
                            title="Resume"
                        >
                            <Play size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={pauseRecording}
                            className="p-2 hover:bg-surface-hover rounded-lg transition-colors text-foreground"
                            title="Pause"
                        >
                            <Pause size={16} />
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
                            setIsRecording(false);
                            setIsPaused(false);
                            if (timerRef.current) clearInterval(timerRef.current);
                        }}
                        className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                        title="Cancel"
                    >
                        <X size={16} />
                    </button>
                    <button
                        onClick={stopRecording}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg shadow-red-500/20"
                        title="Stop & Preview"
                    >
                        <Square size={16} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={startRecording}
            className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
            data-tooltip="Record Voice Message"
        >
            <Mic size={20} className="text-muted-foreground hover:text-foreground" />
        </button>
    );
}
