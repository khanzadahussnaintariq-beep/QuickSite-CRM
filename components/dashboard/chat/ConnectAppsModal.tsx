'use client';

import Modal from '@/components/ui/Modal';
import { ExternalLink, Zap, Table, CheckSquare, Globe } from 'lucide-react';

interface ConnectAppsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (appName: string) => void;
}

export default function ConnectAppsModal({ isOpen, onClose, onConnect }: ConnectAppsModalProps) {
    const apps = [
        { name: 'Zapier', icon: <Zap size={20} className="text-orange-500" />, desc: 'Automate tasks with 5000+ apps' },
        { name: 'Google Sheets', icon: <Table size={20} className="text-green-500" />, desc: 'Export message data to a spreadsheet' },
        { name: 'Asana', icon: <CheckSquare size={20} className="text-pink-500" />, desc: 'Create tasks from messages' },
        { name: 'Trello', icon: <Globe size={20} className="text-blue-500" />, desc: 'Add messages as Trello cards' },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Connect to Apps">
            <div className="space-y-4">
                <p className="text-sm text-gray-500 px-2 mb-4">
                    Send this message to your favorite productivity tools.
                </p>

                <div className="space-y-2">
                    {apps.map(app => (
                        <button
                            key={app.name}
                            onClick={() => onConnect(app.name)}
                            className="w-full flex items-center justify-between p-4 hover:bg-surface-hover rounded-2xl border border-border transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center shadow-sm">
                                    {app.icon}
                                </div>
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-foreground">{app.name}</h4>
                                    <p className="text-xs text-gray-500">{app.desc}</p>
                                </div>
                            </div>
                            <ExternalLink size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                        </button>
                    ))}
                </div>

                <div className="pt-4 px-2">
                    <button className="w-full py-3 border border-dashed border-border rounded-xl text-sm font-medium text-gray-500 hover:border-primary hover:text-primary transition-all">
                        Browse all 100+ integrations
                    </button>
                </div>
            </div>
        </Modal>
    );
}
