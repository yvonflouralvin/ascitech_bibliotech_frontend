'use client';

import React from 'react';
import { motion } from 'framer-motion';

import cn from '@/lib/ui/cn';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
                'flex flex-col items-center justify-center gap-3 px-6 py-16 text-center',
                className,
            )}
        >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-muted text-ink-subtle">
                <span className="absolute inset-0 animate-pulse-ring rounded-2xl border border-line" />
                {icon}
            </div>

            <div className="max-w-sm space-y-1.5">
                <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
                {description && <p className="text-[13px] leading-relaxed text-ink-muted">{description}</p>}
            </div>

            {action}
        </motion.div>
    );
}
