'use client';

import { useState } from 'react';
import { User, Mail, Camera, Save, Phone, Shield } from 'lucide-react';

export default function ProfilePage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            alert('Profile updated successfully!');
        }, 1000);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground mt-2">Manage your account settings and preferences.</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column - Avatar & Quick Actions */}
                <div className="space-y-6">
                    <div className="bg-surface card-shadow rounded-2xl p-6 flex flex-col items-center border border-border">
                        <div className="relative group cursor-pointer">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#F26522] to-orange-400 p-1">
                                <div className="w-full h-full bg-surface rounded-full flex items-center justify-center overflow-hidden">
                                    <span className="font-black text-4xl text-foreground">JD</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white" size={24} />
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-foreground">John Doe</h2>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full mt-2">ADMIN</span>

                        <div className="w-full mt-6 space-y-2">
                            <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-surface-hover transition-colors">
                                <Mail size={16} />
                                <span>john.doe@quicksite.local</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground p-2 rounded-lg hover:bg-surface-hover transition-colors">
                                <Phone size={16} />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-surface card-shadow rounded-2xl p-8 border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <User size={20} className="text-primary" />
                                Personal Information
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">First Name</label>
                                <input type="text" defaultValue="John" className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Last Name</label>
                                <input type="text" defaultValue="Doe" className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Bio</label>
                                <textarea rows={4} defaultValue="QuickSite CRM administrator. Passionate about efficiency and design." className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-surface card-shadow rounded-2xl p-8 border border-border">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                                <Shield size={20} className="text-primary" />
                                Preferences
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Panel Theme</label>
                                <select className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary cursor-pointer">
                                    <option>System Default</option>
                                    <option>Light Mode</option>
                                    <option>Dark Mode</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Language</label>
                                <select className="w-full bg-surface-hover border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:border-primary cursor-pointer">
                                    <option>English (US)</option>
                                    <option>Spanish</option>
                                    <option>French</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button className="px-6 py-2.5 rounded-xl font-bold text-muted-foreground hover:bg-surface-hover transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-70 flex items-center gap-2"
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
