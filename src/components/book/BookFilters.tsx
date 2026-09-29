'use client';

import React from 'react';
import {
    ArrowDownAZIcon,
    ClockIcon,
    DownloadCloudIcon,
    HeartIcon,
    LibraryIcon,
    TagsIcon,
} from 'lucide-react';

import Chip from '@/components/ui/Chip';
import cn from '@/lib/ui/cn';

export type BookScope = 'all' | 'favorites' | 'offline';
export type BookSort = 'title' | 'recent';

/** Categorie presentee dans la barre de filtres, avec son effectif courant. */
export interface CategoryFilter {
    slug: string;
    name: string;
    count: number;
}

interface BookFiltersProps {
    scope: BookScope;
    onScopeChange: (scope: BookScope) => void;
    sort: BookSort;
    onSortChange: (sort: BookSort) => void;
    counts: Record<BookScope, number>;
    /** Categories reellement representees dans le catalogue de l'eleve. */
    categories?: CategoryFilter[];
    /** Slug de la categorie active ; `undefined` = tous les domaines. */
    category?: string;
    onCategoryChange?: (category: string | undefined) => void;
    /** Pages dediees (favoris, hors ligne) : la portee y est imposee. */
    hideScopes?: boolean;
    className?: string;
}

const SCOPES: { key: BookScope; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'Tout le catalogue', icon: <LibraryIcon size={14} /> },
    { key: 'favorites', label: 'Favoris', icon: <HeartIcon size={14} /> },
    { key: 'offline', label: 'Hors ligne', icon: <DownloadCloudIcon size={14} /> },
];

/**
 * Filtres du catalogue : portee (catalogue / favoris / hors ligne) sur une
 * premiere ligne, domaines thematiques sur une seconde.
 *
 * Les categories affichees sont deduites du catalogue deja charge, et non
 * d'un appel dedie : le filtrage reste donc disponible hors ligne, et un
 * domaine sans aucun livre accessible ne se presente pas a l'eleve comme un
 * rayon vide.
 */
export default function BookFilters({
    scope,
    onScopeChange,
    sort,
    onSortChange,
    counts,
    categories = [],
    category,
    onCategoryChange,
    hideScopes,
    className,
}: BookFiltersProps) {
    // Sur une page dediee sans aucun domaine a proposer, la barre n'aurait
    // plus rien a montrer.
    if (hideScopes && categories.length === 0) return null;

    return (
        <div className={cn('flex flex-col gap-2', className)}>
            {!hideScopes && (
                <div className="flex items-center gap-3">
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
            )}

            {categories.length > 0 && (
                <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 py-1">
                    <Chip
                        icon={<TagsIcon size={14} />}
                        active={category === undefined}
                        onClick={() => onCategoryChange?.(undefined)}
                        layoutGroup="category-indicator"
                    >
                        Tous les domaines
                    </Chip>

                    {categories.map((item) => (
                        <Chip
                            key={item.slug}
                            active={category === item.slug}
                            count={item.count}
                            onClick={() =>
                                onCategoryChange?.(category === item.slug ? undefined : item.slug)
                            }
                            layoutGroup="category-indicator"
                        >
                            {item.name}
                        </Chip>
                    ))}
                </div>
            )}
        </div>
    );
}
