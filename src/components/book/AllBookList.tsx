'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SearchXIcon } from 'lucide-react';

import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import { Book } from '@/lib/hooks/useBook/type';
import { GetCover } from './BookCover';

import BookWidget from './BookWidget';

const GRID =
    'grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6';

interface AllBookListProps {
    books: Book[];
    getCover: GetCover;
    onSelect: (book: Book) => void;
    isFavorite: (bookId: string) => boolean;
    downloads: Record<string, number>;
    isLoading?: boolean;
    emptyState?: React.ReactNode;
}

function CardSkeleton({ index }: { index: number }) {
    return (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Skeleton className="aspect-[3/4] w-full rounded-none" delay={index * 60} />
            <div className="space-y-2 p-3">
                <Skeleton className="h-3 w-4/5" delay={index * 60} />
                <Skeleton className="h-2.5 w-2/5" delay={index * 60} />
            </div>
        </div>
    );
}

export default function AllBookList({
    books,
    getCover,
    onSelect,
    isFavorite,
    downloads,
    isLoading,
    emptyState,
}: AllBookListProps) {
    if (isLoading) {
        return (
            <div className={GRID}>
                {Array.from({ length: 12 }).map((_, index) => (
                    <CardSkeleton key={index} index={index} />
                ))}
            </div>
        );
    }

    if (books.length === 0) {
        return (
            <>
                {emptyState ?? (
                    <EmptyState
                        icon={<SearchXIcon size={24} />}
                        title="Aucun livre ne correspond"
                        description="Essayez un autre mot-clé ou changez de filtre."
                    />
                )}
            </>
        );
    }

    return (
        <motion.div layout className={GRID}>
            <AnimatePresence mode="popLayout">
                {books.map((book, index) => (
                    <BookWidget
                        key={book.id}
                        book={book}
                        index={index}
                        getCover={getCover}
                        onSelect={onSelect}
                        isFavorite={isFavorite(book.id)}
                        downloaded={downloads[book.id] ?? 0}
                    />
                ))}
            </AnimatePresence>
        </motion.div>
    );
}
