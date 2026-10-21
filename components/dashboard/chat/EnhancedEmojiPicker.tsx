'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

// Import EmojiPicker dynamically to avoid SSR issues
const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface EnhancedEmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
    triggerClassName?: string;
    triggerIcon?: React.ReactNode;
}

export default function EnhancedEmojiPicker({ onEmojiSelect, triggerClassName, triggerIcon }: EnhancedEmojiPickerProps) {
    const [showPicker, setShowPicker] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);
    const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

    // Setup portal container
    useEffect(() => {
        let el = document.getElementById('emoji-picker-portal');
        if (!el) {
            el = document.createElement('div');
            el.id = 'emoji-picker-portal';
            document.body.appendChild(el);
        }
        setPortalEl(el);
    }, []);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                // Also check if the click was inside the portal
                const portal = document.getElementById('emoji-picker-container');
                if (portal && portal.contains(event.target as Node)) {
                    return;
                }
                setShowPicker(false);
            }
        };

        if (showPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showPicker]);

    // Calculate position
    const [position, setPosition] = useState<{
        top?: number; bottom?: number; left: number;
    }>({ left: 0 });

    useEffect(() => {
        if (showPicker && pickerRef.current) {
            const rect = pickerRef.current.getBoundingClientRect();
            const pickerWidth = 350;
            const pickerHeight = 420;

            let left = rect.left;
            if (left + pickerWidth > window.innerWidth) {
                left = window.innerWidth - pickerWidth - 20;
            }
            if (left < 0) left = 20;

            // Decide whether to open downward or upward
            const spaceBelow = window.innerHeight - rect.bottom;
            if (spaceBelow >= pickerHeight) {
                // Enough room below — open downward
                setPosition({ top: rect.bottom + 8, left });
            } else {
                // Not enough room below — open upward
                setPosition({ bottom: window.innerHeight - rect.top + 8, left });
            }
        }
    }, [showPicker]);

    return (
        <div className="relative inline-block" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setShowPicker(!showPicker)}
                className={triggerClassName || "p-2 hover:bg-surface-hover rounded-lg transition-all flex items-center justify-center"}
                title="Add emoji"
            >
                {triggerIcon ? triggerIcon : <Smile size={20} className={triggerClassName ? "" : "text-gray-500 hover:text-foreground transition-colors"} />}
            </button>

            {showPicker && portalEl && createPortal(
                <div
                    id="emoji-picker-container"
                    className="fixed z-[9999] animate-in fade-in duration-200 shadow-2xl rounded-xl overflow-hidden"
                    style={{
                        top: position.top !== undefined ? `${position.top}px` : undefined,
                        bottom: position.bottom !== undefined ? `${position.bottom}px` : undefined,
                        left: `${position.left}px`,
                    }}
                >
                    <div className="bg-white dark:bg-[#1C1C1E] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
                        <EmojiPicker
                            onEmojiClick={(emojiData) => {
                                onEmojiSelect(emojiData.emoji);
                                setShowPicker(false);
                            }}
                            autoFocusSearch={false}
                            theme={undefined} // Follows system theme
                            width={350}
                            height={400}
                        />
                    </div>
                </div>,
                portalEl
            )}
        </div>
    );
}
