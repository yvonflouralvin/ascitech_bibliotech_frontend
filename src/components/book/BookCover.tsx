'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenIcon } from 'lucide-react';

import { Book } from '@/lib/hooks/useBook/type';
import { toDataUrl } from '@/lib/hooks/useBookPage';
import useInView from '@/lib/hooks/useInView';
import cn from '@/lib/ui/cn';

/** Palettes utilisees pour les couvertures generees. */
const PALETTES: [string, string][] = [
    ['#0F5E70', '#12A2B8'],
    ['#4B3F72', '#8368B0'],
    ['#7A3E2F', '#C4713F'],
    ['#1F4D3A', '#3E9C6D'],
    ['#3B3F58', '#6B7398'],
    ['#6B2B45', '#B45577'],
    ['#25476B', '#4E86B5'],
    ['#6A5518', '#B8912F'],
];

/** Hash stable : la meme couverture generee doit reapparaitre a chaque visite. */
const hash = (value: string): number => {
    let acc = 0;
    for (let i = 0; i < value.length; i += 1) {
        acc = (acc << 5) - acc + value.charCodeAt(i);
        acc |= 0;
    }
    return Math.abs(acc);
};

const initials = (title: string): string =>
    title
        .split(/\s+/)
        .filter((word) => /[a-zA-Z0-9]/.test(word))
        .slice(0, 2)
        .map((word) => word[0]?.toUpperCase() ?? '')
        .join('') || '?';

interface GeneratedCoverProps {
    book: Book;
    compact?: boolean;
}

/**
 * Couverture de repli dessinee localement.
 *
 * Remplace l'ancien appel a `via.placeholder.com` : ce service externe n'est
 * plus joignable, et une image distante ne fonctionnerait de toute facon pas
 * en mode hors ligne.
 */
export function GeneratedCover({ book, compact }: GeneratedCoverProps) {
    const [from, to] = PALETTES[hash(book.id) % PALETTES.length];

    return (
        <div
            className="book-spine relative flex h-full w-full flex-col justify-between overflow-hidden p-3 text-white"
            style={{ background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)` }}
        >
            {/* Motif discret pour eviter un aplat trop plat. */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-25"
                style={{
                    backgroundImage:
                        'radial-gradient(circle at 78% 18%, rgba(255,255,255,0.5) 0, transparent 42%), radial-gradient(circle at 12% 88%, rgba(0,0,0,0.4) 0, transparent 46%)',
                }}
            />

            <div className="relative flex items-start justify-between gap-2 pl-2">
                <span
                    className={cn(
                        'font-semibold tracking-tight text-white/85',
                        compact ? 'text-[15px]' : 'text-lg',
                    )}
                >
                    {initials(book.title)}
                </span>
                <BookOpenIcon size={compact ? 14 : 18} className="mt-0.5 shrink-0 text-white/70" />
            </div>

            <div className="relative pl-2">
                <p
                    className={cn(
                        'font-semibold leading-snug text-balance line-clamp-4 drop-shadow-sm',
                        compact ? 'text-[12px]' : 'text-[13px]',
                    )}
                >
                    {book.title}
                </p>
                {book.author && (
                    <p className="mt-1 text-[11px] text-white/75 line-clamp-1">{book.author}</p>
                )}
            </div>
        </div>
    );
}

export type GetCover = (
    bookId: string,
    width?: number,
) => Promise<{ content: string | null; mime: string | null } | undefined>;

interface BookCoverProps {
    book: Book;
    /** Recupere la couverture ; injecte pour partager le cache entre les listes. */
    getCover: GetCover;
    className?: string;
    compact?: boolean;
    /** Charge immediatement, sans attendre l'entree dans le viewport. */
    eager?: boolean;
    /** Largeur demandee au serveur ; laisse choisir la vignette par defaut. */
    width?: number;
}

/**
 * Couverture d'un livre : image reelle si le serveur en fournit une, sinon
 * couverture generee. Le chargement est differe jusqu'a l'apparition a l'ecran.
 */
export default function BookCover({
    book,
    getCover,
    className,
    compact,
    eager,
    width,
}: BookCoverProps) {
    const { ref, inView } = useInView<HTMLDivElement>();
    const [source, setSource] = useState<string | undefined>(undefined);
    const [settled, setSettled] = useState(false);

    const shouldLoad = eager || inView;

    useEffect(() => {
        if (!shouldLoad || settled) return;
        let cancelled = false;

        getCover(book.id, width)
            .then((cover) => {
                if (cancelled) return;
                setSource(toDataUrl(cover?.content, cover?.mime));
            })
            .catch(() => undefined)
            .finally(() => {
                if (!cancelled) setSettled(true);
            });

        return () => {
            cancelled = true;
        };
    }, [shouldLoad, settled, book.id, getCover, width]);

    const content = useMemo(() => {
        if (!settled) {
            return <div key="skeleton" className="skeleton h-full w-full" />;
        }

        if (source) {
            return (
                <motion.img
                    key="image"
                    src={source}
                    alt={`Couverture de ${book.title}`}
                    loading="lazy"
                    decoding="async"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="book-spine h-full w-full object-cover"
                />
            );
        }

        return (
            <motion.div
                key="generated"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="h-full w-full"
            >
                <GeneratedCover book={book} compact={compact} />
            </motion.div>
        );
    }, [settled, source, book, compact]);

    return (
        <div ref={ref} className={cn('relative h-full w-full overflow-hidden bg-surface-muted', className)}>
            <AnimatePresence mode="wait">{content}</AnimatePresence>
        </div>
    );
}
