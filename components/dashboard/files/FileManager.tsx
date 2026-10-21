'use client';

import { useState } from 'react';
import {
    Upload,
    File,
    FileText,
    Image as ImageIcon,
    Trash2,
    Eye,
    X,
    Download,
    FileCode
} from 'lucide-react';

interface FileItem {
    id: string;
    name: string;
    type: string;
    size: string;
    url?: string;
    content?: string;
}

export default function FileManager() {
    const [files, setFiles] = useState<FileItem[]>([
        { id: '1', name: 'Project Brief.pdf', type: 'pdf', size: '2.4 MB' },
        { id: '2', name: 'Design Mockups.png', type: 'image', size: '1.8 MB' },
        { id: '3', name: 'config.json', type: 'json', size: '12 KB', content: '{\n  "theme": "dark",\n  "version": "1.0.0"\n}' },
    ]);
    const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const uploadedFiles = e.target.files;
        if (!uploadedFiles) return;

        const newFiles: FileItem[] = Array.from(uploadedFiles).map((file, idx) => ({
            id: `${Date.now()}-${idx}`,
            name: file.name,
            type: file.type.includes('pdf') ? 'pdf' : file.type.includes('image') ? 'image' : file.type.includes('json') ? 'json' : 'file',
            size: `${(file.size / 1024).toFixed(1)} KB`,
            url: URL.createObjectURL(file),
        }));

        setFiles([...files, ...newFiles]);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this file?')) {
            setFiles(files.filter(f => f.id !== id));
        }
    };

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf':
                return <FileText className="text-red-500" size={24} />;
            case 'image':
                return <ImageIcon className="text-blue-500" size={24} />;
            case 'json':
                return <FileCode className="text-yellow-500" size={24} />;
            default:
                return <File className="text-gray-500" size={24} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Upload Section */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
                        <Upload size={18} />
                        Upload Files
                        <input
                            id="file-upload-input"
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.png,.jpg,.jpeg,.json"
                        />
                    </label>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">PDF, PNG, JPG, JSON</p>
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {files.length} Files Total
                </div>
            </div>

            {/* Files Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                    <div
                        key={file.id}
                        className="bg-background border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-colors" />
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl group-hover:scale-110 transition-transform duration-500">
                                {getFileIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-foreground truncate mb-1">{file.name}</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{file.size}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <button
                                onClick={() => setPreviewFile(file)}
                                className="flex-1 flex items-center justify-center gap-2 bg-background hover:bg-primary hover:text-white text-foreground text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                            >
                                <Eye size={14} />
                                Preview
                            </button>
                            <button
                                onClick={() => handleDelete(file.id)}
                                className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {files.length === 0 && (
                <div
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                    className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-border rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/20 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer group"
                >
                    <div className="w-20 h-20 bg-white dark:bg-zinc-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm border border-border">
                        <Upload className="text-gray-400 group-hover:text-primary transition-colors" size={32} />
                    </div>
                    <p className="text-gray-500 font-black text-lg uppercase tracking-widest">No documents uploaded</p>
                    <p className="text-sm text-gray-400 mt-2 font-medium">Click anywhere here to select files</p>
                </div>
            )}

            {/* Preview Modal */}
            {previewFile && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 md:p-12 animate-in fade-in duration-300" onClick={() => setPreviewFile(null)}>
                    <div className="bg-white dark:bg-zinc-900 border border-white/10 rounded-[2rem] max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-6 border-b border-border bg-zinc-50/50 dark:bg-black/20">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                    {getFileIcon(previewFile.type)}
                                </div>
                                <div>
                                    <p className="text-sm font-black text-foreground">{previewFile.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[10px] font-black text-muted-foreground uppercase underline tracking-widest">{previewFile.size}</span>
                                        <span className="w-1 h-1 bg-muted-foreground rounded-full" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{previewFile.type} DOCUMENT</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {previewFile.url && (
                                    <a
                                        href={previewFile.url}
                                        download={previewFile.name}
                                        className="p-3 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                                        title="Download File"
                                    >
                                        <Download size={20} />
                                    </a>
                                )}
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-3 hover:bg-red-500 hover:text-white rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 p-8 overflow-auto custom-scrollbar bg-white dark:bg-[#0a0a0a]">
                            {previewFile.type === 'pdf' && previewFile.url ? (
                                <iframe
                                    src={previewFile.url}
                                    className="w-full h-[65vh] rounded-2xl border border-border shadow-2xl"
                                    title={previewFile.name}
                                />
                            ) : previewFile.type === 'image' && previewFile.url ? (
                                <div className="flex items-center justify-center min-h-[50vh]">
                                    <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-[65vh] rounded-2xl shadow-2xl object-contain bg-zinc-100 dark:bg-zinc-800" />
                                </div>
                            ) : previewFile.type === 'json' ? (
                                <div className="bg-[#1e1e1e] rounded-2xl p-6 border border-white/10 shadow-2xl h-full">
                                    <pre className="text-[#9cdcfe] font-mono text-sm leading-relaxed overflow-x-auto selection:bg-primary/30">
                                        <code>{previewFile.content || '{\n  "status": "ready",\n  "preview": "no_content_available"\n}'}</code>
                                    </pre>
                                </div>
                            ) : (
                                <div className="py-20 text-center">
                                    <File size={64} className="mx-auto text-muted-foreground mb-4 opacity-20" />
                                    <p className="text-lg font-bold text-muted-foreground italic">No visual preview for this file type</p>
                                    <p className="text-xs text-muted-foreground mt-2 uppercase tracking-widest font-black">Please download the file to view its content</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
