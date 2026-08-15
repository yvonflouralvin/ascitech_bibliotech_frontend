'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, DownloadCloudIcon, HeartIcon } from 'lucide-react';

import { Book } from '@/lib/hooks/useBook/type';
import cn from '@/lib/ui/cn';
import BookCover, { GetCover } from './BookCover';

interface BookWidgetProps {
    book: Book;
    getCover: GetCover;
    onSelect: (book: Book) => void;
    isFavorite?: boolean;
    /** Nombre de pages deja disponibles hors ligne. */
    downloaded?: number;
    index?: number;
}

export default function BookWidget({
    book,
    getCover,
    onSelect,
    isFavorite,
    downloaded = 0,
    index = 0,
}: BookWidgetProps) {
    const isComplete = downloaded > 0 && downloaded >= book.page;
    const isPartial = downloaded > 0 && !isComplete;

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
                // Cascade limitee aux premieres cartes : au-dela l'attente serait visible.
                delay: Math.min(index, 11) * 0.035,
            }}
            className="group"
        >
            <motion.button
                type="button"
                onClick={() => onSelect(book)}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                aria-label={`Ouvrir ${book.title}`}
                className={cn(
                    'flex w-full flex-col overflow-hidden rounded-2xl text-left',
                    'border border-line bg-surface shadow-card',
                    'transition-shadow duration-300 hover:shadow-lifted',
                )}
            >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                    <BookCover book={book} getCover={getCover} compact />

                    {/* Voile au survol, pour signaler l'interactivite. */}
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="pointer-events-none absolute left-2 right-2 top-2 flex items-start justify-between gap-1">
                        {isFavorite && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                className="rounded-full bg-black/45 p-1.5 backdrop-blur-md"
                            >
                                <HeartIcon size={12} className="fill-red-400 text-red-400" />
                            </motion.span>
                        )}

                        <span className="ml-auto">
                            {isComplete && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                                    title="Disponible hors ligne"
                                    className="flex rounded-full bg-black/45 p-1.5 text-emerald-300 backdrop-blur-md"
                                >
                                    <CheckCircle2Icon size={12} />
                                </motion.span>
                            )}
                            {isPartial && (
                                <span
                                    title={`${downloaded} page${downloaded > 1 ? 's' : ''} sur ${book.page}`}
                                    className="flex rounded-full bg-black/45 p-1.5 text-white/85 backdrop-blur-md"
                                >
                                    <DownloadCloudIcon size={12} />
                                </span>
                            )}
                        </span>
                    </div>

                    {isPartial && (
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/25">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (downloaded / Math.max(book.page, 1)) * 100)}%` }}
                                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                className="h-full bg-primary"
                            />
                        </div>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-1 p-3">
                    <h3 className="line-clamp-2 text-[13px] font-semibold leading-snug text-ink">
                        {book.title}
                    </h3>
                    <p className="mt-auto text-[11px] text-ink-subtle">
                        {book.author ? `${book.author} · ` : ''}
                        {book.page} page{book.page > 1 ? 's' : ''}
                    </p>
                </div>
            </motion.button>
        </motion.article>
    );
}
