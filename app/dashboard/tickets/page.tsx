'use client';

import TicketBoard from '@/components/dashboard/tickets/TicketBoard';

export default function TicketsPage() {
    return (
        <div className="h-full flex flex-col space-y-4 overflow-hidden">
            <div className="flex-none">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">Tickets</h1>
                        <p className="text-muted-foreground text-sm font-medium">Manage and track your assigned tickets across all stages.</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                <TicketBoard />
            </div>
        </div>
    );
}
