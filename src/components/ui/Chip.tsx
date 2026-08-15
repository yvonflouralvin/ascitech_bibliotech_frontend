'use client';

import React from 'react';
import { motion } from 'framer-motion';

import cn from '@/lib/ui/cn';

interface ChipProps {
    active?: boolean;
    onClick?: () => void;
    icon?: React.ReactNode;
    count?: number;
    children: React.ReactNode;
    className?: string;
    /** Identifiant de groupe pour l'indicateur anime partage. */
    layoutGroup?: string;
}

/**
 * Puce de filtre. L'indicateur actif est un calque `layoutId` partage : il
 * glisse d'une puce a l'autre au lieu d'apparaitre brutalement.
 */
export default function Chip({
    active,
    onClick,
    icon,
    count,
    children,
    className,
    layoutGroup = 'chip-indicator',
}: ChipProps) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            aria-pressed={active}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
            className={cn(
                'relative inline-flex items-center gap-2 whitespace-nowrap rounded-full',
                'h-9 px-4 text-[13px] font-medium transition-colors duration-200',
                active ? 'text-primary-foreground' : 'text-ink-muted hover:text-ink',
                className,
            )}
        >
            {active && (
                <motion.span
                    layoutId={layoutGroup}
                    className="absolute inset-0 rounded-full bg-primary shadow-card"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
            )}
            {!active && (
                <span className="absolute inset-0 rounded-full border border-line bg-surface" />
            )}

            <span className="relative z-10 flex items-center gap-2">
                {icon}
                {children}
                {count !== undefined && (
                    <span
                        className={cn(
                            'rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums',
                            active ? 'bg-white/20' : 'bg-surface-muted text-ink-subtle',
                        )}
                    >
                        {count}
                    </span>
                )}
            </span>
        </motion.button>
    );
}
