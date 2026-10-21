'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { CLIENTS } from '@/lib/mockData';

interface NewMeetingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (meeting: any) => void;
}

export default function NewMeetingModal({ isOpen, onClose, onCreate }: NewMeetingModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        client: '',
        date: '',
        time: '',
        type: 'Zoom',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newMeeting = {
            id: Math.random().toString(36).substr(2, 9),
            ...formData,
        };
        onCreate(newMeeting);
        setFormData({
            title: '',
            client: '',
            date: '',
            time: '',
            type: 'Zoom',
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Schedule Meeting">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Meeting Title</label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                        placeholder="e.g. Weekly Sync"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Client</label>
                    <select
                        required
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                        className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                    >
                        <option value="">Select Client</option>
                        {CLIENTS.map(c => (
                            <option key={c.id} value={c.name}>{c.name} ({c.company})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Date</label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Time</label>
                        <input
                            type="time"
                            required
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">Meeting Type</label>
                    <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                    >
                        <option value="Zoom">Zoom</option>
                        <option value="Google Meet">Google Meet</option>
                        <option value="Microsoft Teams">Microsoft Teams</option>
                        <option value="In Person">In Person</option>
                    </select>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-foreground hover:bg-surface-hover transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-lg text-sm font-medium bg-[#F26522] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-colors"
                    >
                        Schedule
                    </button>
                </div>
            </form>
        </Modal>
    );
}
