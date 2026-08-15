'use client';

import React from 'react';

import cn from '@/lib/ui/cn';

interface SkeletonProps {
    className?: string;
    /** Retarde l'apparition pour eviter un flash sur les chargements rapides. */
    delay?: number;
}

export default function Skeleton({ className, delay = 0 }: SkeletonProps) {
    return (
        <div
            aria-hidden
            className={cn('skeleton rounded-lg', className)}
            style={delay ? { animationDelay: `${delay}ms` } : undefined}
        />
    );
}
