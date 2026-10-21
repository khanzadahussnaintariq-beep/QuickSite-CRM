'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import QuickSiteLogo from '@/components/QuickSiteLogo';

export default function LogoPreloader({ onFinish }: { onFinish: () => void }) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onFinish, 500); // Wait for exit animation
        }, 2500); // Duration of logo display

        return () => clearTimeout(timer);
    }, [onFinish]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    key="preloader"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
                >
                    <div className="text-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="mb-4"
                        >
                            <QuickSiteLogo
                                layout="stacked"
                                size="lg"
                                label="QUICK SITE"
                                descriptor="TECHNOLOGIES"
                                className="mx-auto"
                            />
                        </motion.div>

                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="mt-4 text-sm font-medium tracking-[0.2em] text-foreground/70"
                        >
                            One Site | Big Impact
                        </motion.h1>

                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 1.5, ease: "easeInOut" }}
                            className="h-0.5 bg-primary mt-4 mx-auto max-w-[150px]"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
