'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ImageOffIcon,
    Maximize2Icon,
    Minimize2Icon,
    XIcon,
} from 'lucide-react';

import IconButton from '@/components/ui/IconButton';
import Spinner from '@/components/ui/Spinner';
import { Book, BookPage } from '@/lib/hooks/useBook/type';
import { toDataUrl } from '@/lib/hooks/useBookPage';
import cn from '@/lib/ui/cn';

interface BookReaderProps {
    book: Book;
    onClose: () => void;
    getPage: (bookId: string, order: number) => Promise<BookPage | undefined>;
    /** Page d'ouverture (1 par defaut). */
    initialPage?: number;
    onPageChange?: (page: number) => void;
}

/** Distance (px) ou vitesse de glissement au-dela de laquelle on change de page. */
const SWIPE_DISTANCE = 70;
const SWIPE_VELOCITY = 450;

export default function BookReader({
    book,
    onClose,
    getPage,
    initialPage = 1,
    onPageChange,
}: BookReaderProps) {
    const totalPages = Math.max(book.page, 1);

    const [[page, direction], setPage] = useState<[number, number]>([
        Math.min(Math.max(initialPage, 1), totalPages),
        0,
    ]);
    const [source, setSource] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [fitWidth, setFitWidth] = useState(false);
    const [chromeVisible, setChromeVisible] = useState(true);

    // Evite qu'une reponse tardive n'ecrase la page affichee apres un changement rapide.
    const requestRef = useRef(0);

    const goTo = useCallback(
        (next: number) => {
            const clamped = Math.min(Math.max(next, 1), totalPages);
            setPage(([current]) => (clamped === current ? [current, 0] : [clamped, clamped > current ? 1 : -1]));
        },
        [totalPages],
    );

    const next = useCallback(() => goTo(page + 1), [goTo, page]);
    const previous = useCallback(() => goTo(page - 1), [goTo, page]);

    useEffect(() => {
        onPageChange?.(page);
    }, [page, onPageChange]);

    // Chargement de la page courante.
    useEffect(() => {
        const token = ++requestRef.current;
        setIsLoading(true);
        setFailed(false);

        getPage(book.id, page)
            .then((result) => {
                if (token !== requestRef.current) return;
                const url = toDataUrl(result?.content, result?.mime);
                setSource(url);
                setFailed(!url);
            })
            .catch(() => {
                if (token === requestRef.current) setFailed(true);
            })
            .finally(() => {
                if (token === requestRef.current) setIsLoading(false);
            });
    }, [book.id, page, getPage]);

    // Prechargement de la page suivante : la lecture enchaine sans attente.
    useEffect(() => {
        if (page >= totalPages) return;
        const timer = setTimeout(() => {
            getPage(book.id, page + 1).catch(() => undefined);
        }, 350);
        return () => clearTimeout(timer);
    }, [book.id, page, totalPages, getPage]);

    // Navigation au clavier.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            switch (event.key) {
                case 'ArrowRight':
                case 'PageDown':
                case ' ':
                    event.preventDefault();
                    next();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    event.preventDefault();
                    previous();
                    break;
                case 'Home':
                    event.preventDefault();
                    goTo(1);
                    break;
                case 'End':
                    event.preventDefault();
                    goTo(totalPages);
                    break;
                case 'Escape':
                    event.preventDefault();
                    onClose();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [next, previous, goTo, totalPages, onClose]);

    const progress = useMemo(() => (page / totalPages) * 100, [page, totalPages]);

    const variants = {
        enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 90 : dir < 0 ? -90 : 0, scale: 0.98 }),
        center: { opacity: 1, x: 0, scale: 1 },
        exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -90 : dir < 0 ? 90 : 0, scale: 0.98 }),
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="reader-surface fixed inset-0 z-[70] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label={`Lecture de ${book.title}`}
        >
            {/* Barre supérieure */}
            <AnimatePresence>
                {chromeVisible && (
                    <motion.header
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -60, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/55 to-transparent px-3 py-3 sm:px-5"
                    >
                        <IconButton label="Fermer le lecteur" variant="glass" onClick={onClose}>
                            <XIcon size={18} />
                        </IconButton>

                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white drop-shadow">
                                {book.title}
                            </p>
                            {book.author && (
                                <p className="truncate text-[11px] text-white/70">{book.author}</p>
                            )}
                        </div>

                        <IconButton
                            label={fitWidth ? 'Ajuster à l’écran' : 'Ajuster à la largeur'}
                            variant="glass"
                            onClick={() => setFitWidth((current) => !current)}
                        >
                            {fitWidth ? <Minimize2Icon size={17} /> : <Maximize2Icon size={17} />}
                        </IconButton>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Zone de page */}
            <div
                className={cn(
                    'scroll-area relative flex-1 overflow-auto',
                    fitWidth ? 'overflow-y-auto' : 'overflow-hidden',
                )}
                onClick={() => setChromeVisible((current) => !current)}
            >
                <div
                    className={cn(
                        'flex min-h-full w-full items-center justify-center',
                        fitWidth ? 'p-0' : 'p-4 sm:p-8',
                    )}
                >
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={page}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            drag={fitWidth ? false : 'x'}
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.16}
                            onDragEnd={(_, info) => {
                                const { offset, velocity } = info;
                                if (offset.x < -SWIPE_DISTANCE || velocity.x < -SWIPE_VELOCITY) next();
                                else if (offset.x > SWIPE_DISTANCE || velocity.x > SWIPE_VELOCITY) previous();
                            }}
                            className={cn(
                                'flex items-center justify-center',
                                fitWidth ? 'w-full' : 'max-h-full',
                            )}
                        >
                            {isLoading && !source ? (
                                <div className="flex flex-col items-center gap-3 text-ink-muted">
                                    <Spinner size={26} />
                                    <p className="text-[13px]">Chargement de la page {page}…</p>
                                </div>
                            ) : failed ? (
                                <div className="flex flex-col items-center gap-3 px-8 text-center text-ink-muted">
                                    <ImageOffIcon size={30} />
                                    <p className="text-[13px]">
                                        Cette page n’est pas disponible.
                                        <br />
                                        Vérifiez votre connexion, puis réessayez.
                                    </p>
                                </div>
                            ) : (
                                // Les pages sont des images base64 issues d'IndexedDB :
                                // next/image ne sait pas optimiser une data URL.
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={source}
                                    alt={`Page ${page} de ${book.title}`}
                                    draggable={false}
                                    className={cn(
                                        'select-none rounded-sm bg-white shadow-book',
                                        fitWidth
                                            ? 'w-full max-w-none rounded-none'
                                            : 'max-h-[calc(100vh-9rem)] w-auto max-w-full object-contain',
                                    )}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Zones de clic latérales, sur grand écran uniquement. */}
                <button
                    type="button"
                    aria-label="Page précédente"
                    onClick={(event) => {
                        event.stopPropagation();
                        previous();
                    }}
                    disabled={page <= 1}
                    className="group absolute inset-y-0 left-0 hidden w-[12%] cursor-w-resize items-center justify-start pl-4 disabled:cursor-default lg:flex"
                >
                    <span className="rounded-full bg-black/40 p-2.5 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0">
                        <ChevronLeftIcon size={20} />
                    </span>
                </button>
                <button
                    type="button"
                    aria-label="Page suivante"
                    onClick={(event) => {
                        event.stopPropagation();
                        next();
                    }}
                    disabled={page >= totalPages}
                    className="group absolute inset-y-0 right-0 hidden w-[12%] cursor-e-resize items-center justify-end pr-4 disabled:cursor-default lg:flex"
                >
                    <span className="rounded-full bg-black/40 p-2.5 text-white opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0">
                        <ChevronRightIcon size={20} />
                    </span>
                </button>
            </div>

            {/* Barre inférieure */}
            <AnimatePresence>
                {chromeVisible && (
                    <motion.footer
                        initial={{ y: 70, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 70, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 bottom-0 z-20"
                    >
                        <div className="h-1 w-full bg-black/15">
                            <motion.div
                                className="h-full bg-primary"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-3 bg-surface/85 px-4 py-2.5 backdrop-blur-xl">
                            <IconButton
                                label="Page précédente"
                                variant="ghost"
                                onClick={previous}
                                disabled={page <= 1}
                            >
                                <ChevronLeftIcon size={18} />
                            </IconButton>

                            <div className="flex items-center gap-1.5 text-[13px] text-ink-muted">
                                <input
                                    type="number"
                                    min={1}
                                    max={totalPages}
                                    value={page}
                                    onChange={(event) => {
                                        const value = Number(event.target.value);
                                        if (Number.isFinite(value)) goTo(value);
                                    }}
                                    aria-label="Aller à la page"
                                    className="h-8 w-14 rounded-lg border border-line bg-surface text-center text-[13px] font-semibold tabular-nums text-ink outline-none transition-colors focus:border-primary"
                                />
                                <span className="tabular-nums">sur {totalPages}</span>
                            </div>

                            <IconButton
                                label="Page suivante"
                                variant="ghost"
                                onClick={next}
                                disabled={page >= totalPages}
                            >
                                <ChevronRightIcon size={18} />
                            </IconButton>
                        </div>
                    </motion.footer>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
