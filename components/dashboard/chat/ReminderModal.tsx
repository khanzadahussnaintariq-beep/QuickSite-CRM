'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

interface ReminderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSetReminder: (time: string) => void;
}

export default function ReminderModal({ isOpen, onClose, onSetReminder }: ReminderModalProps) {
    const options = [
        { label: 'In 20 minutes', value: '20m' },
        { label: 'In 1 hour', value: '1h' },
        { label: 'In 3 hours', value: '3h' },
        { label: 'Tomorrow morning', value: 'tomorrow_am' },
        { label: 'Next week', value: 'next_week' },
    ];

    const [customDate, setCustomDate] = useState('');

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Remind Me About This">
            <div className="space-y-4">
                <div className="space-y-1">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onSetReminder(opt.value)}
                            className="w-full flex items-center justify-between p-4 hover:bg-surface-hover rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Clock size={18} className="text-gray-500 group-hover:text-primary transition-colors" />
                                <span className="text-sm font-medium text-foreground">{opt.label}</span>
                            </div>
                            <ChevronRight size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                    ))}
                </div>

                <div className="h-px bg-border my-2" />

                <div className="p-4 bg-surface-hover/30 rounded-xl border border-border">
                    <div className="flex items-center gap-3 mb-3 text-sm font-medium text-foreground">
                        <Calendar size={18} className="text-primary" />
                        <span>Custom Date & Time</span>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="datetime-local"
                            className="flex-1 bg-surface border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                        />
                        <button
                            onClick={() => onSetReminder(customDate)}
                            disabled={!customDate}
                            className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Set
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
