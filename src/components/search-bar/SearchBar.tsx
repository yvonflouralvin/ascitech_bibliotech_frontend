'use client';

import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchIcon, XIcon } from 'lucide-react';

import cn from '@/lib/ui/cn';

interface SearchBarProps {
    searchKeyWord: string;
    setSearchKeyWord: (value: string) => void;
    placeholder?: string;
    resultCount?: number;
}

export default function SearchBar({
    searchKeyWord,
    setSearchKeyWord,
    placeholder = 'Rechercher un titre, un auteur…',
    resultCount,
}: SearchBarProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // Raccourcis : « / » pour chercher, « Echap » pour effacer.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const isTyping =
                target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

            if (event.key === '/' && !isTyping) {
                event.preventDefault();
                inputRef.current?.focus();
            }

            if (event.key === 'Escape' && isTyping && target === inputRef.current) {
                setSearchKeyWord('');
                inputRef.current?.blur();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [setSearchKeyWord]);

    return (
        <div
            className={cn(
                'group flex h-11 w-full items-center gap-2.5 rounded-xl px-3.5',
                'border border-line bg-surface transition-all duration-200',
                'focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10',
            )}
        >
            <SearchIcon size={17} className="shrink-0 text-ink-subtle" />

            <input
                ref={inputRef}
                type="search"
                value={searchKeyWord}
                onChange={(event) => setSearchKeyWord(event.target.value)}
                placeholder={placeholder}
                aria-label="Rechercher un livre"
                className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subtle [&::-webkit-search-cancel-button]:appearance-none"
            />

            <AnimatePresence>
                {searchKeyWord.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-center gap-2"
                    >
                        {resultCount !== undefined && (
                            <span className="hidden text-[11px] font-medium tabular-nums text-ink-subtle sm:block">
                                {resultCount} résultat{resultCount > 1 ? 's' : ''}
                            </span>
                        )}
                        <button
                            type="button"
                            onClick={() => setSearchKeyWord('')}
                            aria-label="Effacer la recherche"
                            className="rounded-full p-1 text-ink-subtle transition-colors hover:bg-surface-muted hover:text-ink"
                        >
                            <XIcon size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 text-[10px] font-medium text-ink-subtle md:block">
                /
            </kbd>
        </div>
    );
}
