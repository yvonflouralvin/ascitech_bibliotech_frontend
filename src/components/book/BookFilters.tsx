'use client';

import React from 'react';
import { ArrowDownAZIcon, ClockIcon, DownloadCloudIcon, HeartIcon, LibraryIcon } from 'lucide-react';

import Chip from '@/components/ui/Chip';
import cn from '@/lib/ui/cn';

export type BookScope = 'all' | 'favorites' | 'offline';
export type BookSort = 'title' | 'recent';

interface BookFiltersProps {
    scope: BookScope;
    onScopeChange: (scope: BookScope) => void;
    sort: BookSort;
    onSortChange: (sort: BookSort) => void;
    counts: Record<BookScope, number>;
    className?: string;
}

const SCOPES: { key: BookScope; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Tout le catalogue', icon: <LibraryIcon size={14} /> },
    { key: 'favorites', label: 'Favoris', icon: <HeartIcon size={14} /> },
    { key: 'offline', label: 'Hors ligne', icon: <DownloadCloudIcon size={14} /> },
];

/**
 * Filtres du catalogue.
 *
 * Ils remplacent les anciennes categories, qui provenaient de donnees fictives
 * cote client et ne filtraient rien. Ceux-ci s'appuient sur l'etat reel :
 * favoris enregistres et pages disponibles hors ligne.
 */
export default function BookFilters({
    scope,
    onScopeChange,
    sort,
    onSortChange,
    counts,
    className,
}: BookFiltersProps) {
    return (
        <div className={cn('flex items-center gap-3', className)}>
            <div className="no-scrollbar -mx-1 flex flex-1 items-center gap-2 overflow-x-auto px-1 py-1">
                {SCOPES.map((item) => (
                    <Chip
                        key={item.key}
                        icon={item.icon}
                        active={scope === item.key}
                        count={counts[item.key]}
                        onClick={() => onScopeChange(item.key)}
                        layoutGroup="scope-indicator"
                    >
                        {item.label}
                    </Chip>
                ))}
            </div>

            <button
                type="button"
                onClick={() => onSortChange(sort === 'title' ? 'recent' : 'title')}
                aria-label={
                    sort === 'title' ? 'Trier par ajout récent' : 'Trier par ordre alphabétique'
                }
                className={cn(
                    'hidden h-9 shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3.5',
                    'text-[13px] font-medium text-ink-muted transition-colors hover:text-ink sm:flex',
                )}
            >
                {sort === 'title' ? <ArrowDownAZIcon size={14} /> : <ClockIcon size={14} />}
                {sort === 'title' ? 'A → Z' : 'Récents'}
            </button>
        </div>
    );
}
