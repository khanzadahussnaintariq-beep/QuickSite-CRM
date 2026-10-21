'use client';

import dynamic from 'next/dynamic';
import { Smile } from 'lucide-react';
import { useState } from 'react';

const Picker = dynamic(() => import('emoji-picker-react'), { ssr: false });
import { Theme } from 'emoji-picker-react';

interface EmojiPickerProps {
    onEmojiClick: (emoji: string) => void;
}

export default function EmojiPickerComponent({ onEmojiClick }: EmojiPickerProps) {
    const [showPicker, setShowPicker] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(!showPicker)}
                className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                data-tooltip="Add Emoji"
            >
                <Smile size={20} className="text-muted-foreground hover:text-foreground" />
            </button>

            {showPicker && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPicker(false)}
                    />
                    <div className="absolute bottom-full right-0 mb-2 z-50">
                        <Picker
                            onEmojiClick={(emojiData) => {
                                onEmojiClick(emojiData.emoji);
                                setShowPicker(false);
                            }}
                            theme={Theme.DARK}
                            width={320}
                            height={400}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
