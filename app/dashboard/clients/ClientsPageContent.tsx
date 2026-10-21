'use client';

export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';
import { Search, Plus, ExternalLink, MoreVertical, Edit2, Trash2, Building2, Loader2, AlertCircle } from 'lucide-react';
import NewClientModal from '@/components/dashboard/NewClientModal';
import toast from 'react-hot-toast';
import { useClientStore } from '@/store/clientStore';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function ClientsPage() {
    const { user, isLoading: authLoading } = useAuthStore();
    const { clients, fetchAllClients, deleteClient, isLoading, error } = useClientStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [editingClient, setEditingClient] = useState<any | null>(null);

   useEffect(() => {
    if (authLoading || !user) return;

    const allowedRoles = ['admin', 'manager'];

    if (!allowedRoles.includes(user.role)) {
        router.push('/dashboard');
        return;
    }

    fetchAllClients();
}, [user, authLoading]);

    if (authLoading && !user) return null;
    if (user && user.role !== 'admin' && user.role !== 'manager') return null;

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingClient(null); // ✅ Clear editing client on close
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this client?')) {
            try {
                await deleteClient(id);
                setOpenMenuId(null);
                toast.success('Client deleted');
            } catch (err) {
                toast.error('Failed to delete client');
            }
        }
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <NewClientModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                client={editingClient} // ✅ Pass editing client
                onCreate={handleCloseModal}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Clients & Sources</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-1">Manage client profiles and lead sources</p>
                </div>
                <button
                    onClick={() => {
                        setEditingClient(null); // ✅ Ensure it's in "Add" mode
                        setIsModalOpen(true);
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} strokeWidth={3} />
                    Add Client
                </button>
            </div>

            <div className="border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col min-h-0 flex-1">
                {/* Table Header/Toolbar */}
                <div className="p-4 border-b border-border bg-background flex gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search clients or companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-background border border-border text-foreground text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar relative" onClick={() => setOpenMenuId(null)}>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-background">
                            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                            <p className="text-muted-foreground font-bold">Refreshing clients...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-background px-6 text-center">
                            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-lg font-black text-foreground">Sync Failed</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mt-1 font-medium">{error}</p>
                            <button
                                onClick={() => fetchAllClients()}
                                className="mt-6 px-6 py-2 bg-surface text-foreground border border-border rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white dark:hover:bg-background transition-all"
                            >
                                Reconnect
                            </button>
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap bg-surface ">
                            <thead className="bg-background text-muted-foreground font-bold sticky top-0 z-10 backdrop-blur-sm border-b border-border">
                                <tr>
                                    <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Client Name</th>
                                    <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Company</th>
                                    <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Tier</th>
                                    <th className="px-6 py-4 uppercase tracking-widest text-[10px]">Website</th>
                                    <th className="px-6 py-4 text-right uppercase tracking-widest text-[10px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredClients.map((client) => (
                                    <tr key={client.id} className="hover:bg-surface-hover/50 transition-colors group">
                                       <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-sm font-black text-gray-400 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                            {client.name.substring(0, 2).toUpperCase()}
                                            </div>

                                            <span
                                            title={client.name}
                                            className="text-foreground font-black tracking-tight"
                                            >
                                            {client.name.length > 18
                                                ? `${client.name.slice(0, 18)}...`
                                                : client.name}
                                            </span>
                                        </div>
                                        </td>

                                        <td className="px-6 py-4">
                                        <div
                                            title={client.company}
                                            className="flex items-center gap-2 text-muted-foreground font-medium"
                                        >
                                            <Building2 size={14} className="text-primary/50" />

                                            {client.company.length > 18
                                            ? `${client.company.slice(0, 18)}...`
                                            : client.company}
                                        </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-widest
                                                ${client?.tier === 'Enterprise' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                                                    client?.tier === 'Premium' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}
                                            `}>
                                                {client?.tier}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {client.website ? (
                                                <a
                                            href={`https://${client.website}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={client.website}
                                            className="inline-flex items-center gap-1.5 text-muted-foreground font-medium hover:text-primary transition-colors bg-background border border-border px-3 py-1.5 rounded-lg text-xs"
                                            >
                                            {client.website.length > 20
                                                ? `${client.website.slice(0, 20)}...`
                                                : client.website}
                                            <ExternalLink size={12} />
                                            </a>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">N/A</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right relative">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === client.id ? null : client.id);
                                                }}
                                                className="text-muted-foreground hover:text-foreground p-2 rounded-lg border border-transparent hover:border-border hover:bg-background dark:hover:bg-background transition-all font-bold"
                                            >
                                                <MoreVertical size={16} />
                                            </button>

                                            {openMenuId === client.id && (
                                                <div className="absolute right-8 top-12 w-32 bg-background rounded-xl shadow-xl border border-border overflow-hidden z-20 animate-in fade-in slide-in-from-top-2">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingClient(client); // ✅ Set the client to edit
                                                            setOpenMenuId(null);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-background dark:hover:bg-background transition-colors"
                                                    >
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <div className="h-px w-full bg-border" />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                                                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-background dark:hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredClients.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground font-medium bg-white dark:bg-background">
                                            No clients found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}