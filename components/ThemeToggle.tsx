'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors border border-transparent hover:border-border"
            data-tooltip={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
             data-tooltip-pos="bottom"
        >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
    );
}
