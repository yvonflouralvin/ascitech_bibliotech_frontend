'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MoonIcon, SunIcon } from 'lucide-react';

import useTheme from '@/lib/hooks/useTheme';
import IconButton from './IconButton';

/** Bascule clair / sombre, avec permutation animee de l'icone. */
export default function ThemeToggle({ size = 40 }: { size?: number }) {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <IconButton
            label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
            variant="surface"
            size={size}
            onClick={toggleTheme}
            className="overflow-hidden"
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={theme}
                    initial={{ y: 14, opacity: 0, rotate: -35 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: -14, opacity: 0, rotate: 35 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center justify-center"
                >
                    {isDark ? <MoonIcon size={17} /> : <SunIcon size={17} />}
                </motion.span>
            </AnimatePresence>
        </IconButton>
    );
}
