'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    List,
    ListOrdered,
    Type as TypeIcon,
    Eraser,
    Undo2,
    Redo2,
    Plus,
    Minus,
    CaseSensitive,
    Save,
    Pencil,
    Layers,
    Baseline,
    ChevronDown,
    Table as TableIconItem,
    Paintbrush
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProjectCanvas() {
    const editorRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [textColor, setTextColor] = useState('#000000');
    const [savedRange, setSavedRange] = useState<Range | null>(null);
    const [activeCategory, setActiveCategory] = useState<number | null>(null);
    const [isOverToolbar, setIsOverToolbar] = useState(false);
    const [mode, setMode] = useState<'text' | 'pencil'>('text');
    const [isDrawing, setIsDrawing] = useState(false);

    const saveSelection = () => {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
            setSavedRange(sel.getRangeAt(0));
        }
    };

    const restoreSelection = () => {
        if (savedRange) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(savedRange);
            }
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('canvas-v3-content');

        if (saved && editorRef.current) {
            editorRef.current.innerHTML = saved;
            setIsEmpty(saved === '' || saved === '<p><br></p>');
        } else if (editorRef.current) {
            editorRef.current.innerHTML = '<h1 style="font-size: 3rem; font-weight: 900; opacity: 0.9;">Project Overview</h1><p><br></p>';
            setIsEmpty(false);
        }

        // Set initial color based on theme
        const isDark = document.documentElement.classList.contains('dark');
        setTextColor(isDark ? '#ffffff' : '#000000');
    }, []);

    // Canvas Freehand Drawing Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resizeCanvas = () => {
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.offsetWidth;
                canvas.height = container.offsetHeight;
            }
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        return () => window.removeEventListener('resize', resizeCanvas);
    }, [mode]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (mode !== 'pencil') return;
        setIsDrawing(true);
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.strokeStyle = textColor;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || mode !== 'pencil') return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
        const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleInput = () => {
        if (!editorRef.current) return;
        const html = editorRef.current.innerHTML;
        setIsEmpty(html === '' || html === '<p><br></p>');
        localStorage.setItem('canvas-v3-content', html);
    };

    const exec = (command: string, value?: string) => {
        editorRef.current?.focus();
        restoreSelection();
        try {
            document.execCommand(command, false, value);
        } catch (e) {
            console.error("Exec command failed", e);
        }
        handleInput();
    };

    const insertAtSelection = (html: string) => {
        editorRef.current?.focus();
        restoreSelection();
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            if (editorRef.current?.contains(range.commonAncestorContainer)) {
                range.deleteContents();
                const el = document.createElement("div");
                el.innerHTML = html;
                const frag = document.createDocumentFragment();
                let node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    const newRange = range.cloneRange();
                    newRange.setStartAfter(lastNode);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                    saveSelection();
                }
                handleInput();
                return;
            }
        }
        if (editorRef.current) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            editorRef.current.appendChild(wrapper.firstChild!);
            handleInput();
        }
    };

    const insertTable = () => {
        const rowsStr = prompt("Enter number of rows:", "3");
        const colsStr = prompt("Enter number of columns:", "3");
        if (!rowsStr || !colsStr) return;
        const rows = Math.min(20, parseInt(rowsStr));
        const cols = Math.min(20, parseInt(colsStr));
        if (isNaN(rows) || isNaN(cols)) return;

        const table = `
            <table style="width:100%; border-collapse: collapse; margin: 25px 0; border: 2px solid #cbd5e1; border-radius: 12px; overflow: hidden; background: white; cursor: text;">
                ${Array(rows).fill(0).map(() => `
                    <tr style="height: 50px;">
                        ${Array(cols).fill(0).map(() => `
                            <td style="border: 1px solid #cbd5e1; padding: 12px; min-width: 80px; position: relative;" onmouseover="this.style.backgroundColor='rgba(242,101,34,0.05)'" onmouseout="this.style.backgroundColor='transparent'">&nbsp;</td>
                        `).join('')}
                    </tr>
                `).join('')}
            </table>
            <p><br></p>
        `;
        insertAtSelection(table);
    };

    const addTableRow = () => {
        const sel = window.getSelection();
        const table = sel?.anchorNode?.parentElement?.closest('table');
        if (table) {
            const row = table.insertRow();
            const cols = (table as HTMLTableElement).rows[0].cells.length;
            for (let i = 0; i < cols; i++) {
                const cell = row.insertCell();
                cell.style.border = '1px solid #cbd5e1';
                cell.style.padding = '12px';
                cell.style.minWidth = '80px';
                cell.innerHTML = '&nbsp;';
            }
            handleInput();
        } else {
            alert('Selection must be inside a table');
        }
    };

    const addTableCol = () => {
        const sel = window.getSelection();
        const table = sel?.anchorNode?.parentElement?.closest('table') as HTMLTableElement;
        if (table) {
            for (let i = 0; i < table.rows.length; i++) {
                const cell = table.rows[i].insertCell();
                cell.style.border = '1px solid #cbd5e1';
                cell.style.padding = '12px';
                cell.style.minWidth = '80px';
                cell.innerHTML = '&nbsp;';
            }
            handleInput();
        } else {
            alert('Selection must be inside a table');
        }
    };

    // Removal of Shape logic functions


    const downloadCanvas = () => {
        if (!editorRef.current) return;
        const content = editorRef.current.innerHTML;
        const blob = new Blob([`
            <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
                        td { border: 1px solid #ddd; padding: 12px; }
                        div[contenteditable="false"] { border: 2px solid #000; display: inline-block; }
                    </style>
                </head>
                <body>${content}</body>
            </html>
        `], { type: 'application/msword' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `project-overview-${new Date().toISOString().split('T')[0]}.doc`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
            <div className="flex-1 bg-background relative flex flex-col overflow-hidden transition-all duration-500">
                {/* Project Title and Header Area */}
                <div className="pt-8 px-12 pb-4 z-20 flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-black text-foreground tracking-tighter opacity-90">Project Overview</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shadow-sm">
                            <span className="font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mr-2">Mode:</span>
                            <span className="font-black uppercase tracking-widest text-primary">
                                {mode === 'text' ? 'Text Editing' : 'Pencil Drawing'}
                            </span>
                        </div>
                        <button
                            onClick={downloadCanvas}
                            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl hover:bg-primary-hover shadow-xl shadow-primary/20 transition-all font-black text-xs uppercase tracking-widest active:scale-95 group"
                        >
                            <Save size={16} className="group-hover:rotate-12 transition-transform" />
                            Download Doc
                        </button>
                    </div>
                </div>

                {/* Main Editor Container (Red box area from Pic 1) */}
                <div className="flex-1 overflow-hidden relative px-12 pb-12">
                    {/* Writing Area */}
                    <div className="mx-auto w-full h-full bg-background rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] border border-slate-200 dark:border-zinc-800 relative z-10 transition-all duration-500 overflow-y-auto p-12 scroll-smooth custom-scrollbar">
                        {/* Grid Background */}
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none rounded-xl" />

                        <div className="w-full relative min-h-full z-10 flex flex-col">
                            {/* Drawing Canvas Overlay */}
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className={`absolute inset-0 z-20 transition-opacity duration-300 ${mode === 'pencil' ? 'opacity-100 cursor-crosshair' : 'opacity-0 pointer-events-none'}`}
                            />

                            {isEmpty && (
                                <div className="absolute top-0 left-0 text-slate-200 dark:text-zinc-800 text-4xl font-black pointer-events-none select-none italic">
                                    start typing or writing...
                                </div>
                            )}
                            <div
                                ref={editorRef}
                                contentEditable={mode === 'text'}
                                onInput={handleInput}
                                onBlur={saveSelection}
                                onKeyUp={saveSelection}
                                onMouseUp={saveSelection}
                                className={`w-full h-full focus:outline-none text-2xl leading-relaxed text-foreground selection:bg-primary/30 py-4 relative z-10 ${mode !== 'text' ? 'cursor-default pointer-events-none opacity-80' : ''}`}
                                style={{ outline: 'none', color: 'inherit', caretColor: 'currentColor' }}
                            />
                        </div>
                    </div>
                </div>

                <div
                    className="fixed right-8 top-[58%] -translate-y-1/2 z-[100] flex flex-col gap-3 p-3 bg-background  backdrop-blur-2xl border border-slate-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:scale-[1.02]"
                    onMouseEnter={() => setIsOverToolbar(true)}
                    onMouseLeave={() => setIsOverToolbar(false)}
                    style={{ cursor: 'default' }}
                >
                    {/* TOOL 1: Typography */}
                    <CategoryGroup id={1} icon={<TypeIcon size={20} />} label="Typography" activeId={activeCategory} setActiveId={(id) => { setActiveCategory(id); if (id === 1) setMode('text'); }}>
                        <div className="flex flex-col gap-2">
                            <ToolbarButton icon={<Bold size={18} />} onClick={() => { setMode('text'); exec('bold'); }} tooltip="Bold" />
                            <ToolbarButton icon={<Italic size={18} />} onClick={() => { setMode('text'); exec('italic'); }} tooltip="Italic" />
                            <ToolbarButton icon={<Underline size={18} />} onClick={() => { setMode('text'); exec('underline'); }} tooltip="Text Underline" />
                            <ToolbarButton icon={<Strikethrough size={18} />} onClick={() => { setMode('text'); exec('strikeThrough'); }} tooltip="Text Center Cut Line" />
                        </div>
                    </CategoryGroup>

                    {/* TOOL 2: Lists */}
                    <CategoryGroup id={2} icon={<List size={20} />} label="Bullets & Counting" activeId={activeCategory} setActiveId={(id) => { setActiveCategory(id); if (id === 2) setMode('text'); }}>
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-1 p-1 bg-zinc-50 dark:bg-zinc-800 rounded-xl mb-2">
                                <p className="text-[10px] font-black text-center opacity-40 uppercase py-1 dark:text-zinc-400">Bullets</p>
                                <div className="flex gap-1 justify-center">
                                    <button onClick={() => { setMode('text'); exec('insertUnorderedList'); }} className="p-2 hover:bg-primary/20 rounded text-sm dark:text-zinc-200">●</button>
                                    <button onClick={() => { setMode('text'); exec('insertHTML', '<ul style="list-style-type: \'★ \';"><li>&nbsp;</li></ul>'); }} className="p-2 hover:bg-primary/20 rounded text-sm dark:text-zinc-200">★</button>
                                    <button onClick={() => { setMode('text'); exec('insertHTML', '<ul style="list-style-type: \'> \';"><li>&nbsp;</li></ul>'); }} className="p-2 hover:bg-primary/20 rounded text-sm dark:text-zinc-200">&gt;</button>
                                    <button onClick={() => { setMode('text'); exec('insertHTML', '<ul style="list-style-type: \'♦ \';"><li>&nbsp;</li></ul>'); }} className="p-2 hover:bg-primary/20 rounded text-sm dark:text-zinc-200">♦</button>
                                    <button onClick={() => { setMode('text'); exec('insertHTML', '<ul style="list-style-type: \'■ \';"><li>&nbsp;</li></ul>'); }} className="p-2 hover:bg-primary/20 rounded text-sm dark:text-zinc-200">■</button>
                                </div>
                            </div>
                            <ToolbarButton icon={<CaseSensitive size={18} />} onClick={() => { setMode('text'); exec('insertOrderedList'); const sel = window.getSelection(); const parent = sel?.anchorNode?.parentElement?.closest('ol'); if (parent) parent.setAttribute('type', 'A'); }} tooltip="Alphabets" />
                            <ToolbarButton icon={<ListOrdered size={18} />} onClick={() => { setMode('text'); exec('insertOrderedList'); }} tooltip="Counting" />
                            <div className="flex gap-1 border-t border-zinc-200 dark:border-zinc-700 mt-2 pt-2">
                                <ToolbarButton icon={<Plus size={14} />} onClick={() => { setMode('text'); exec('indent'); }} tooltip="Sub Bullet" />
                                <ToolbarButton icon={<Minus size={14} />} onClick={() => { setMode('text'); exec('outdent'); }} tooltip="Remove Indent" />
                            </div>
                        </div>
                    </CategoryGroup>

                    {/* TOOL 3: Artistic */}
                    <CategoryGroup id={3} icon={<Paintbrush size={20} />} label="Artistic Tools" activeId={activeCategory} setActiveId={setActiveCategory}>
                        <div className="flex flex-col gap-2">
                            <div className="relative group/color mb-1">
                                <ToolbarButton icon={<Baseline size={18} />} tooltip="Font Color" />
                                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => { setTextColor(e.target.value); if (mode === 'text') exec('foreColor', e.target.value); }} />
                            </div>
                            <div className="relative group/highlight mb-1">
                                <ToolbarButton icon={<Paintbrush size={18} />} tooltip="Color Picker" />
                                <input type="color" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                    setTextColor(e.target.value);
                                    if (mode === 'pencil') {
                                        const ctx = canvasRef.current?.getContext('2d');
                                        if (ctx) ctx.strokeStyle = e.target.value;
                                    }
                                }} />
                            </div>
                        </div>
                    </CategoryGroup>

                    {/* TOOL 6: Pencil */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                const newMode = mode === 'pencil' ? 'text' : 'pencil';
                                setMode(newMode);
                                if (newMode === 'pencil') toast.success("Pencil Mode Activated");
                                else toast.success("Text Mode Activated");
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all group relative ${mode === 'pencil' ? 'bg-primary text-white shadow-xl scale-110 z-[60]' : 'text-zinc-500 hover:text-primary hover:bg-primary/10'}`}
                        >
                            <Pencil size={20} />
                            <div className="absolute right-full mr-3 px-2 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[70]">
                                {mode === 'pencil' ? 'Enabled' : 'Pencil'}
                                <div className="absolute top-1/2 left-full -translate-y-1/2 w-1.5 h-1.5 bg-zinc-900 rotate-45 -translate-x-[3px]" />
                            </div>
                        </button>
                        {mode === 'pencil' && (
                            <div className="absolute right-full mr-4 top-0 p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[55] animate-in fade-in slide-in-from-right-4 duration-300">
                                <ToolbarButton icon={<Eraser size={18} />} tooltip="Eraser" onClick={() => {
                                    const ctx = canvasRef.current?.getContext('2d');
                                    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                                }} />
                            </div>
                        )}
                    </div>

                    {/* TOOL 5: Table Tools */}
                    <CategoryGroup id={5} icon={<Layers size={20} />} label="Table & Structure" activeId={activeCategory} setActiveId={(id) => { setActiveCategory(id); if (id === 5) setMode('text'); }}>
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                <span className="text-[9px] font-black uppercase opacity-50 dark:text-zinc-400">Table</span>
                                <div className="flex gap-1">
                                    <button onClick={() => { setMode('text'); insertTable(); }} className="p-1 hover:bg-primary/20 rounded text-primary transition-colors" title="New Table"><TableIconItem size={14} /></button>
                                    <button onClick={() => { setMode('text'); addTableRow(); }} className="p-1 hover:bg-primary/20 rounded text-primary transition-colors" title="Add Row"><Plus size={14} /></button>
                                    <button onClick={() => { setMode('text'); addTableCol(); }} className="p-1 hover:bg-primary/20 rounded text-primary transition-colors" title="Add Column"><ChevronDown className="-rotate-90" size={14} /></button>
                                </div>
                            </div>
                        </div>
                    </CategoryGroup>

                    <div className="flex flex-col gap-1 border-t border-zinc-100 dark:border-zinc-800 pt-2">
                        <ToolbarButton icon={<Undo2 size={18} />} onClick={() => exec('undo')} tooltip="Undo" />
                        <ToolbarButton icon={<Redo2 size={18} />} onClick={() => exec('redo')} tooltip="Redo" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function CategoryGroup({ id, icon, label, children, activeId, setActiveId }: { id: number, icon: React.ReactNode, label: string, children: React.ReactNode, activeId: number | null, setActiveId: (id: number | null) => void }) {
    const isActive = activeId === id;
    return (
        <div className="relative">
            <button
                onClick={() => setActiveId(isActive ? null : id)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all group relative ${isActive ? 'bg-primary text-white shadow-xl scale-110 z-[60]' : 'text-zinc-500 hover:text-primary hover:bg-primary/10'}`}
            >
                {icon}
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 whitespace-nowrap z-[70]">
                    {label}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-zinc-900 rotate-45 -translate-y-[3px]" />
                </div>
            </button>
            {isActive && (
                <div className="absolute right-full mr-4 top-0 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl z-[55] animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-2 min-w-[60px]">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-1 px-1 text-center whitespace-nowrap">{label}</p>
                    {children}
                </div>
            )}
        </div>
    );
}

function ToolbarButton({ icon, onClick, tooltip, active }: { icon: React.ReactNode, onClick?: () => void, tooltip: string, active?: boolean }) {
    return (
        <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all group relative ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-zinc-500 hover:text-primary hover:bg-primary/10 dark:text-zinc-400'}`}
        >
            {icon}
            <div className="absolute right-full mr-4 px-3 py-1.5 bg-zinc-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-all duration-200 translate-x-2 group-hover:translate-x-0 z-[100] shadow-xl border border-white/10">
                {tooltip}
                <div className="absolute top-1/2 left-full -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 -translate-x-1" />
            </div>
        </button>
    );
}
