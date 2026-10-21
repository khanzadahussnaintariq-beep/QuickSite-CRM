import { create } from 'zustand';
import { ticketsService } from '@/lib/api/services/tickets.service';

export type TicketStatus = 'To Do' | 'In Progress' | 'Review' | 'Complete';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical' | 'Urgent';
export type TicketType = 'Question' | 'Problem' | 'Feature Request' | 'Bug' | 'Refund';

export interface Ticket {
    id: string;
    ticketNumber: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    type: TicketType;
    source: string;
    createdById: string;
    assignedToId?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    dueDate?: string;
}

interface TicketState {
    tickets: Ticket[];
    isLoading: boolean;
    error: string | null;
    fetchAllTickets: () => Promise<void>;
    createTicket: (ticketData: any) => Promise<Ticket>;
    updateTicket: (id: string, ticketData: any) => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
}

const mapStatusToFrontend = (status: string): TicketStatus => {
    switch ((status || '').toUpperCase()) {
        case 'TODO':
        case 'TO_DO':
        case 'NEW':
        case 'OPEN':
            return 'To Do';
        case 'IN_PROGRESS':
        case 'INPROGRESS':
            return 'In Progress';
        case 'REVIEW':
        case 'PENDING':
            return 'Review';
        case 'COMPLETE':
        case 'COMPLETED':
        case 'RESOLVED':
        case 'CLOSED':
            return 'Complete';
        default:
            return 'To Do';
    }
};

const mapStatusToBackend = (status?: string) => {
    switch (status) {
        case 'To Do': return 'TODO';
        case 'In Progress': return 'IN_PROGRESS';
        case 'Review': return 'REVIEW';
        case 'Complete': return 'COMPLETED';
        default: return undefined;
    }
};

const mapPriorityToFrontend = (priority: string): TicketPriority => {
    switch ((priority || '').toUpperCase()) {
        case 'LOW': return 'Low';
        case 'MEDIUM': return 'Medium';
        case 'HIGH': return 'High';
        case 'CRITICAL': return 'Critical';
        case 'URGENT': return 'Urgent';
        default: return 'Medium';
    }
};

const mapPriorityToBackend = (priority?: string) => {
    return priority ? priority.toUpperCase() : undefined;
};

const mapBackendToFrontend = (bt: any): Ticket => ({
    id: bt.id,
    ticketNumber: bt.ticketNumber || bt.code || `TKT-${bt.id}`,
    title: bt.title || '',
    description: bt.description || '',
    status: mapStatusToFrontend(bt.status),
    priority: mapPriorityToFrontend(bt.priority),
    type: bt.type || 'Question',
    source: bt.source || 'Portal',
    createdById: bt.createdBy || bt.createdById || '',
    assignedToId: bt.assignedToId || bt.assignedTo || undefined,
    projectId: bt.projectId || undefined,
    createdAt: bt.createdAt || new Date().toISOString(),
    updatedAt: bt.updatedAt || new Date().toISOString(),
    tags: Array.isArray(bt.tags) ? bt.tags : [],
    dueDate: bt.dueDate ? new Date(bt.dueDate).toISOString() : undefined,
});

export const useTicketStore = create<TicketState>((set, get) => ({
    tickets: [],
    isLoading: false,
    error: null,

    fetchAllTickets: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await ticketsService.getAllTickets();
            const rawTickets = Array.isArray(data) ? data : (data.tickets || []);
            set({ tickets: rawTickets.map(mapBackendToFrontend), isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createTicket: async (ticketData: any) => {
        set({ isLoading: true, error: null });
        try {
            const { customerId: _removed, ...rest } = ticketData;
            const backendData = {
                ...rest,
                status: mapStatusToBackend(ticketData.status || 'To Do'),
                priority: mapPriorityToBackend(ticketData.priority),
                dueDate: ticketData.dueDate ? new Date(ticketData.dueDate) : null,
            };
            const response = await ticketsService.createTicket(backendData);
            const created = mapBackendToFrontend(response.ticket || response);
            set({ tickets: [created, ...get().tickets], isLoading: false });
            return created;
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateTicket: async (id: string, ticketData: any) => {
        set({ isLoading: true, error: null });
        try {
            const backendData = {
                ...ticketData,
                status: mapStatusToBackend(ticketData.status),
                priority: mapPriorityToBackend(ticketData.priority),
                dueDate: ticketData.dueDate ? new Date(ticketData.dueDate) : undefined,
            };
            const response = await ticketsService.updateTicket(id, backendData);
            const updated = mapBackendToFrontend(response.ticket || response);
            set({
                tickets: get().tickets.map((t) => (t.id === id ? updated : t)),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteTicket: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await ticketsService.deleteTicket(id);
            set({
                tickets: get().tickets.filter((t) => t.id !== id),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
