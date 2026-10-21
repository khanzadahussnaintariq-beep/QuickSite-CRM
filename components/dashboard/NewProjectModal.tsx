'use client';

import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/ui/Modal';
import CredentialsManager, { Credential } from './CredentialsManager';
import { Upload, FileText, X, Loader2, Download } from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useClientStore } from '@/store/clientStore';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import { uploadFile, getSignedImageUrl } from '@/lib/s3';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate?: (project: any) => void;
    initialData?: any;
}

const getInitialFormData = () => ({
    projectOwner: '',
    title: '',
    clientId: '',
    status: 'In Progress',
    priority: 'Medium',
    dueDate: '',
    description: '',
    budgetType: 'Milestone',
    price: '',
    weeklyHours: '',
    hourlyRate: '',
    tags: ''
});

export default function NewProjectModal({ isOpen, onClose, onCreate, initialData }: NewProjectModalProps) {
    const { createProject, isLoading: isCreating } = useProjectStore();
    const { clients } = useClientStore();
    const { user } = useAuthStore();
    const isDeveloper = `${user?.role || ''}`.toLowerCase() === 'developer';

    const assignableUsers = [
        { id: 'asher', name: 'Asher' },
        { id: 'ahmed', name: 'Ahmed' },
    ];
    const [activeTab, setActiveTab] = useState<'info' | 'specs' | 'access'>('info');

    // Form State
    const [formData, setFormData] = useState(getInitialFormData());
    const isEditMode = Boolean(initialData);

    const [files, setFiles] = useState<File[]>([]);
    const [existingFiles, setExistingFiles] = useState<string[]>([]);
    const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
    const resolvedKeysRef = useRef<Set<string>>(new Set());
    const [isUploading, setIsUploading] = useState(false);
    const [credentials, setCredentials] = useState<Credential[]>([]);

    // Tag list state for enter pill functionality
    const [tagList, setTagList] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');

    // Milestones state
    const [milestones, setMilestones] = useState<{ title: string; description?: string; amount: number; dueDate: string }[]>([]);
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [newMilestoneDescription, setNewMilestoneDescription] = useState('');
    const [newMilestoneAmount, setNewMilestoneAmount] = useState('');
    const [newMilestoneDueDate, setNewMilestoneDueDate] = useState('');

    useEffect(() => {
        setSignedUrls({});
        resolvedKeysRef.current.clear();

        if (!isOpen) {
            return;
        }

        if (isEditMode && initialData) {
            setActiveTab('info');
            setFormData({
                projectOwner: initialData.userProjectId || initialData.projectOwner || '',
                title: initialData.title || '',
                clientId: initialData.clientId || '',
                status: initialData.status || 'Planning',
                priority: initialData.priority || 'Medium',
                dueDate: initialData.dueDate || '',
                description: initialData.description || '',
                budgetType: initialData.budgetType || 'Milestone',
                price: initialData.price ?? '',
                weeklyHours: initialData.weeklyHours ?? '',
                hourlyRate: initialData.hourlyRate ?? '',
                tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : (initialData.tags || '')
            });

            // Initialize tags list
            if (initialData.tags) {
                if (Array.isArray(initialData.tags)) {
                    setTagList(initialData.tags);
                } else {
                    setTagList(initialData.tags.split(',').map((t: string) => t.trim()).filter(Boolean));
                }
            } else {
                setTagList([]);
            }

            // Initialize files, milestones & credentials
            setExistingFiles(initialData.files || []);
            setMilestones(initialData.milestones || []);
            setCredentials(initialData.credentials || []);
            return;
        }

        // Create mode initial reset
        setActiveTab('info');
        setFormData(getInitialFormData());
        setFiles([]);
        setExistingFiles([]);
        setMilestones([]);
        setCredentials([]);
        setTagList([]);
        setTagInput('');
        setNewMilestoneTitle('');
        setNewMilestoneDescription('');
        setNewMilestoneAmount('');
        setNewMilestoneDueDate('');
    }, [isOpen, isEditMode, initialData]);

    useEffect(() => {
        const keysToResolve = existingFiles.filter(f => !f.startsWith('http') && !resolvedKeysRef.current.has(f));
        for (const key of keysToResolve) {
            resolvedKeysRef.current.add(key);
            getSignedImageUrl(key).then(url => {
                setSignedUrls(prev => ({ ...prev, [key]: url }));
            }).catch(() => {
                resolvedKeysRef.current.delete(key);
            });
        }
    }, [existingFiles]);

    const getFileUrl = (keyOrUrl: string) =>
        keyOrUrl.startsWith('http') ? keyOrUrl : (signedUrls[keyOrUrl] ?? '');

    const getFileName = (keyOrUrl: string) =>
        keyOrUrl.split('/').pop() ?? 'file';

    const handleFilesUpload = async (incomingFiles: File[]) => {
        const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
        const validFiles = incomingFiles.filter(file => {
            if (file.size > MAX_FILE_SIZE) {
                toast.error(`File "${file.name}" exceeds the 10MB limit.`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        setIsUploading(true);
        setFiles(prev => [...prev, ...validFiles]);

        const uploadToast = toast.loading('Uploading files to Railway Bucket...');

        try {
            await Promise.all(
                validFiles.map(async (file) => {
                    try {
                        const key = await uploadFile(file);
                        setExistingFiles(prev => [...prev, key]);
                        setFiles(prev => prev.filter(f => f !== file));
                    } catch (err) {
                        toast.error(`Failed to upload "${file.name}"`);
                        setFiles(prev => prev.filter(f => f !== file));
                    }
                })
            );
            toast.success('Files uploaded successfully!', { id: uploadToast });
        } catch (err) {
            toast.error('Some files failed to upload.', { id: uploadToast });
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        handleFilesUpload(droppedFiles);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            handleFilesUpload(selectedFiles);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleAddMilestone = () => {
        if (!newMilestoneTitle.trim()) {
            toast.error('Please enter a milestone title');
            return;
        }
        const amt = parseFloat(newMilestoneAmount);
        if (isNaN(amt) || amt <= 0) {
            toast.error('Please enter a valid milestone amount');
            return;
        }
        setMilestones([...milestones, {
            title: newMilestoneTitle.trim(),
            description: newMilestoneDescription.trim(),
            amount: amt,
            dueDate: newMilestoneDueDate
        }]);
        setNewMilestoneTitle('');
        setNewMilestoneDescription('');
        setNewMilestoneAmount('');
        setNewMilestoneDueDate('');
        toast.success('Milestone added!');
    };

    // Strict tab and input field validation with clear descriptive toasts
    const validateTab = (tab: 'info' | 'specs') => {
        if (tab === 'info') {
            if (!formData.projectOwner) { toast.error('Please specify the Project Owner'); return false; }
            if (!formData.title.trim()) { toast.error('Please enter the Project Title'); return false; }
            if (!formData.clientId) { toast.error('Please specify the Client'); return false; }
            if (!formData.dueDate) { toast.error('Please specify the Project Due Date'); return false; }
            if (!formData.description.trim()) { toast.error('Please enter the Project Description'); return false; }
            if (formData.budgetType === 'Milestone' && milestones.length === 0) {
                toast.error('Please specify at least one Milestone for Milestone budget projects');
                return false;
            }
            if (formData.budgetType === 'Weekly' && (!formData.weeklyHours || !formData.hourlyRate)) {
                toast.error('Please specify the Weekly Hours Limit and Hourly Rate');
                return false;
            }
        }
        return true;
    };

    const handleNextStep = () => {
        if (activeTab === 'info' && !validateTab('info')) return;
        setActiveTab(activeTab === 'info' ? 'specs' : 'access');
    };

    // Stop Enter key from submitting form inside inputs, except for textarea
    const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            if (target.tagName === 'TEXTAREA' || target.getAttribute('type') === 'submit') {
                return;
            }
            e.preventDefault();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isDeveloper) {
            toast.error('Developers are not permitted to create or update projects.');
            return;
        }

        // Perform ultimate form validation
        if (!validateTab('info')) {
            setActiveTab('info');
            return;
        }

        const payload = {
            ...formData,
            tags: tagList,
            milestones: formData.budgetType === 'Milestone' ? milestones : [],
            files: existingFiles,
            credentials,
        };

        try {
            if (isEditMode) {
                await onCreate?.(payload);
                toast.success('Project updated successfully!');
                setActiveTab('info');
                onClose();
                return;
            }

            if (!user?.id) {
                toast.error('You must be logged in to create a project');
                return;
            }

            await createProject({
                ...payload,
                createdBy: user.id,
            });

            toast.success('Project created successfully!');

            if (onCreate) onCreate(payload); // Optional callback

            // Reset
            setFormData(getInitialFormData());
            setFiles([]);
            setExistingFiles([]);
            setCredentials([]);
            setMilestones([]);
            setTagList([]);
            setActiveTab('info');
            onClose();
        } catch (error) {
            toast.error(isEditMode ? 'Failed to update project. Please try again.' : 'Failed to create project. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Project' : 'Create New Project'}>
            <div className="flex border-b border-border mb-6">
                <button
                    type="button"
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'info' ? 'border-[#F26522] text-foreground' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Project Info
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('specs')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'specs' ? 'border-[#F26522] text-foreground' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Files & Specs
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('access')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'access' ? 'border-[#F26522] text-foreground' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
                >
                    Credentials & Access
                </button>
            </div>

            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="space-y-6">
                {/* TAB 1: BASIC INFO */}
                {activeTab === 'info' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Project Owner</label>
                            <select
                                required
                                value={formData.projectOwner}
                                onChange={(e) => setFormData({ ...formData, projectOwner: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                            >
                                <option value="">Select a member...</option>
                                {assignableUsers.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Project Title</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                placeholder="e.g. E-commerce Website Redesign"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Select Client</label>
                                <select
                                    required
                                    value={formData.clientId}
                                    onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                                >
                                    <option value="">Select a client...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>{client.name} - {client.company}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Budget Type</label>
                                <select
                                    required
                                    value={formData.budgetType}
                                    onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                                >
                                    <option value="Milestone">Milestone Based</option>
                                    <option value="Weekly">Weekly Timer</option>
                                </select>
                            </div>
                        </div>

                        {/* Two fields for weekly timer: weeklyHours and hourlyRate */}
                        {formData.budgetType === 'Weekly' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Weekly Hours Limit (hrs/wk)</label>
                                    <input
                                        type="number"
                                        required={formData.budgetType === 'Weekly'}
                                        value={formData.weeklyHours}
                                        onChange={(e) => setFormData({ ...formData, weeklyHours: e.target.value })}
                                        className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                        placeholder="e.g. 40"
                                        min="1"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Weekly Hourly Rate ($/hr)</label>
                                    <input
                                        type="number"
                                        required={formData.budgetType === 'Weekly'}
                                        value={formData.hourlyRate}
                                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                        className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                        placeholder="e.g. 50"
                                        min="1"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Dynamic Milestones Section when budgetType is Milestone */}
                        {formData.budgetType === 'Milestone' && (
                            <div className=" p-5 rounded-xl border border-border space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-foreground">Project Milestones</h3>
                                    <span className="text-[10px] uppercase font-black tracking-widest text-[#F26522] bg-[#F26522]/10 border border-[#F26522]/20 px-2.5 py-0.5 rounded-full">
                                        Total: ${milestones.reduce((acc, m) => acc + m.amount, 0)}
                                    </span>
                                </div>

                                {milestones.length > 0 ? (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                        {milestones.map((m, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-surface-hover p-3 rounded-lg border border-border text-sm">
                                                <div className="flex flex-col min-w-0">
                                                    <span className="font-semibold text-foreground truncate">{m.title}</span>
                                                    {m.description && <span className="text-xs text-gray-400 mt-1 leading-relaxed">{m.description}</span>}
                                                    <span className="text-xs text-gray-500 mt-1">Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'No Deadline'}</span>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <span className="font-bold text-[#F26522]">${m.amount}</span>
                                                    {!isDeveloper && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setMilestones(milestones.filter((_, i) => i !== idx))}
                                                            className="text-gray-500 hover:text-red-500 transition-colors p-1"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-500 italic">No milestones defined yet. Add at least one milestone goal below.</p>
                                )}

                                {!isDeveloper && (
                                    <div className="pt-2 border-t border-border/30 space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                value={newMilestoneTitle}
                                                onChange={(e) => setNewMilestoneTitle(e.target.value)}
                                                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                                placeholder="Milestone title..."
                                            />
                                            <input
                                                type="number"
                                                value={newMilestoneAmount}
                                                onChange={(e) => setNewMilestoneAmount(e.target.value)}
                                                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                                placeholder="Amount ($)..."
                                            />
                                            <input
                                                type="date"
                                                value={newMilestoneDueDate}
                                                onChange={(e) => setNewMilestoneDueDate(e.target.value)}
                                                className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                            />
                                        </div>
                                        <textarea
                                            value={newMilestoneDescription}
                                            onChange={(e) => setNewMilestoneDescription(e.target.value)}
                                            className="w-full bg-surface-hover border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:border-[#F26522] transition-colors resize-none"
                                            placeholder="Milestone description (optional)..."
                                            rows={2}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddMilestone}
                                            className="w-full md:w-auto px-4 py-2 bg-surface border border-border text-foreground hover:text-white hover:bg-[#F26522] text-xs rounded-lg transition-colors font-semibold"
                                        >
                                            + Add Milestone
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Due Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Priority</label>
                                <select
                                    required
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                                <select
                                    required
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors appearance-none"
                                >
                                    <option value="Planning">Planning</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="On Hold">On Hold</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                            <textarea
                                required
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors resize-none"
                                placeholder="Brief detailed description of the project scope..."
                            />
                        </div>
                    </div>
                )}

                {/* TAB 2: FILES & SPECS */}
                {activeTab === 'specs' && (
                    <div className="space-y-6">
                        {!isDeveloper && (
                            <div
                                className="border-2 border-dashed border-border bg-surface-hover/20 rounded-xl p-8 text-center transition-colors hover:border-[#F26522]/50 hover:bg-surface-hover"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleFileDrop}
                            >
                                <Upload className="mx-auto text-gray-500 mb-3" size={32} />
                                <p className="text-gray-400 text-sm font-medium">Drag & drop requirements, designs, or assets here</p>
                                <p className="text-gray-500 text-xs mt-1">or</p>
                                <input
                                    type="file"
                                    id="file-upload"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="inline-block mt-3 px-4 py-2 bg-surface-card hover:bg-surface-hover text-foreground text-xs rounded-lg cursor-pointer transition-colors border border-border"
                                >
                                    Browse Files
                                </label>
                            </div>
                        )}

                        {/* Pre-existing Files uploaded to Railway Bucket */}
                        {existingFiles.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-400">Uploaded Files</h4>
                                <div className="space-y-2">
                                    {existingFiles.map((keyOrUrl, idx) => {
                                        const displayUrl = getFileUrl(keyOrUrl);
                                        const name = getFileName(keyOrUrl);
                                        return (
                                            <div key={idx} className="flex items-center justify-between bg-surface-hover border border-border p-3 rounded-lg">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <FileText size={18} className="text-emerald-500 shrink-0" />
                                                    <a
                                                        href={displayUrl || undefined}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-foreground hover:text-[#F26522] hover:underline truncate transition-colors font-medium"
                                                        title="Click to view/download file"
                                                    >
                                                        {name}
                                                    </a>
                                                </div>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {displayUrl ? (
                                                        <a
                                                            href={displayUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            download
                                                            className="p-1.5 text-gray-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                                            title="Download File"
                                                        >
                                                            <Download size={16} />
                                                        </a>
                                                    ) : (
                                                        <Loader2 size={16} className="text-gray-500 animate-spin" />
                                                    )}
                                                    {!isDeveloper && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setExistingFiles(existingFiles.filter((_, i) => i !== idx))}
                                                            className="text-gray-500 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                                                            title="Remove File"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Local Attached Files waiting for Railway Bucket Upload */}
                        {files.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-400">Uploading to Railway Bucket...</h4>
                                <div className="space-y-2">
                                    {files.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-surface-hover border border-border p-3 rounded-lg">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FileText size={18} className="text-[#F26522] shrink-0" />
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-sm text-foreground truncate">{file.name}</span>
                                                    <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <span className="text-xs text-[#F26522] italic animate-pulse">Uploading...</span>
                                                <Loader2 size={16} className="text-[#F26522] animate-spin shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Enter Pill Tags Interface */}
                        <div>
                            <label className="block text-sm font-medium text-gray-500 mb-2">Project Tags</label>

                            {tagList.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {tagList.map((tag, idx) => (
                                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F26522]/10 border border-[#F26522]/20 text-[#F26522] text-xs font-bold rounded-full">
                                            {tag}
                                            {!isDeveloper && (
                                                <button
                                                    type="button"
                                                    onClick={() => setTagList(tagList.filter((_, i) => i !== idx))}
                                                    className="text-[#F26522] hover:text-orange-600 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isDeveloper && tagList.length === 0 && (
                                <p className="text-xs text-gray-500 italic">No tags defined for this project.</p>
                            )}

                            {!isDeveloper && (
                                <input
                                    type="text"
                                    id="tag-input"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            const val = tagInput.trim();
                                            if (val) {
                                                if (!tagList.includes(val)) {
                                                    setTagList([...tagList, val]);
                                                }
                                                setTagInput('');
                                            }
                                        }
                                    }}
                                    className="w-full bg-surface-hover border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-[#F26522] transition-colors"
                                    placeholder="Type a tag and press Enter"
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* TAB 3: CREDENTIALS */}
                {activeTab === 'access' && (
                    <div className="space-y-6">
                        <div className="bg-surface-card p-4 rounded-lg border border-border">
                            <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                                Add any necessary credentials, API keys, or access details for the team.
                                These will be encrypted and shared securely with assigned members.
                            </p>
                            <CredentialsManager credentials={credentials} onChange={setCredentials} />
                        </div>
                    </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-border">
                    <div className="text-xs text-gray-500">
                        {activeTab === 'info' ? 'Step 1 of 3' : activeTab === 'specs' ? 'Step 2 of 3' : 'Step 3 of 3'}
                    </div>
                    <div className="flex gap-3">
                        {activeTab !== 'info' && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(activeTab === 'access' ? 'specs' : 'info')}
                                className="px-5 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-foreground hover:bg-surface-hover transition-colors"
                            >
                                Back
                            </button>
                        )}

                        {activeTab !== 'access' && (
                            <button
                                key="btn-next"
                                type="button"
                                onClick={handleNextStep}
                                className="px-5 py-2 rounded-lg text-sm font-medium bg-surface-hover hover:bg-surface text-foreground transition-colors border border-border"
                            >
                                Next Step
                            </button>
                        )}

                        {activeTab === 'access' && (
                            <button
                                key="btn-create"
                                type="submit"
                                disabled={isCreating || isUploading || isDeveloper}
                                className="px-6 py-2 rounded-lg text-sm font-medium bg-[#F26522] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Uploading files...
                                    </>
                                ) : isCreating ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        {isEditMode ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : isDeveloper ? (
                                    isEditMode ? 'Update Project (Disabled)' : 'Create Project (Disabled)'
                                ) : isEditMode ? 'Update Project' : 'Create Project'}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </Modal>
    );
}
