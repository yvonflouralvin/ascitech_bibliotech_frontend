'use client';

import React from 'react';

import cn from '@/lib/ui/cn';

interface SpinnerProps {
    size?: number;
    className?: string;
    label?: string;
}

/** Indicateur de chargement circulaire, anime en CSS pur. */
export default function Spinner({ size = 18, className, label }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label={label ?? 'Chargement en cours'}
            className={cn('inline-block shrink-0 animate-spin rounded-full', className)}
            style={{
                width: size,
                height: size,
                borderWidth: Math.max(2, Math.round(size / 9)),
                borderStyle: 'solid',
                borderColor: 'currentColor',
                borderTopColor: 'transparent',
                opacity: 0.85,
            }}
        />
    );
}
