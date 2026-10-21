'use client';

import PinnedMessages from './pins/PinnedMessages';

export default function ProjectPins() {
    return (
        <div className="flex-1 flex flex-col p-6 overflow-auto custom-scrollbar">
            <div className="max-w-4xl mx-auto w-full">
                <PinnedMessages />
            </div>
        </div>
    );
}
