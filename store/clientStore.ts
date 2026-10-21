import { create } from 'zustand';
import { clientsService } from '@/lib/api/services/clients.service';

interface Client {
    id: string;
    name: string;
    company: string;
    email: string;
    phone: string;
    website: string;
    tier: string;
    status: string;
    projects: number;
    avatar?: string;
}

interface ClientState {
    clients: Client[];
    isLoading: boolean;
    error: string | null;
    fetchAllClients: () => Promise<void>;
    createClient: (clientData: any) => Promise<void>;
    updateClient: (id: string, clientData: any) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
}

const mapBackendToFrontend = (bc: any): Client => ({
    id: bc.id,
    name: bc.name,
    company: bc.companyName,
    email: bc.email,
    phone: bc.phone || '',
    website: bc.website || '',
    tier: bc.tier || 'Standard',
    status: bc.status || 'Active',
    projects: bc._count?.projects || bc.projects?.length || 0,
    avatar: bc.avatar || undefined,
});

export const useClientStore = create<ClientState>((set, get) => ({
    clients: [],
    isLoading: false,
    error: null,

    fetchAllClients: async () => {
        set({ isLoading: true, error: null });
        try {
            const data = await clientsService.getAllClients();
            const mappedClients = data.map(mapBackendToFrontend);
            set({ clients: mappedClients, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    createClient: async (clientData: any) => {
        set({ isLoading: true, error: null });
        try {
            const backendData = {
                name: clientData.name,
                companyName: clientData.company,
                email: clientData.email,
                phone: clientData.phone || '',
                website: clientData.website || '',
                tier: clientData.tier || 'Standard',
            };
            const response = await clientsService.createClient(backendData);
            const newClient = mapBackendToFrontend(response.client);
            set({ clients: [newClient, ...get().clients], isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    updateClient: async (id: string, clientData: any) => {
        set({ isLoading: true, error: null });
        try {
            const backendData = {
                name: clientData.name,
                companyName: clientData.company,
                email: clientData.email,
                phone: clientData.phone,
                website: clientData.website,
                tier: clientData.tier,
            };
            const response = await clientsService.updateClient(id, backendData);
            const updatedClient = mapBackendToFrontend(response.client);
            set({
                clients: get().clients.map(c => c.id === id ? updatedClient : c),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    deleteClient: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            await clientsService.deleteClient(id);
            set({
                clients: get().clients.filter(c => c.id !== id),
                isLoading: false
            });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    }
}));
