'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState } from 'react';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string;
    imageName: string;
}

export default function ImageLightbox({ isOpen, onClose, imageUrl, imageName }: ImageLightboxProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 backdrop-blur-md"
                    onClick={onClose}
                >
                    {/* Toolbar */}
                    <div
                        className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-[110]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-white">
                            <h3 className="font-bold text-lg">{imageName}</h3>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center bg-white/10 rounded-xl p-1 gap-1 border border-white/10">
                                <button
                                    onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                                >
                                    <ZoomOut size={20} />
                                </button>
                                <button
                                    onClick={() => setScale(s => Math.min(3, s + 0.2))}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                                >
                                    <ZoomIn size={20} />
                                </button>
                                <button
                                    onClick={() => setRotation(r => r + 90)}
                                    className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                                >
                                    <RotateCw size={20} />
                                </button>
                            </div>

                            <a
                                href={imageUrl}
                                download={imageName}
                                className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all border border-white/10"
                            >
                                <Download size={20} />
                            </a>

                            <button
                                onClick={onClose}
                                className="p-3 bg-red-500/20 hover:bg-red-500 text-white rounded-xl transition-all border border-red-500/20"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Image */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                            scale: scale,
                            opacity: 1,
                            rotate: rotation
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative max-w-full max-h-[80vh] flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={imageUrl}
                            alt={imageName}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition-transform duration-300"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
