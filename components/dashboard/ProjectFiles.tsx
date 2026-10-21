'use client';

import FileManager from './files/FileManager';

export default function ProjectFiles() {
    return (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
        <div className="flex-1 flex flex-col p-6 overflow-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto w-full">
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-foreground mb-1">Project Files</h2>
                    <p className="text-sm text-muted-foreground">Upload, manage, and view project documents</p>
                </div>
                <FileManager />
            </div>
        </div>
        </div>
    );
}
