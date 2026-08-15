'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    BookOpenIcon,
    CheckCircle2Icon,
    CloudOffIcon,
    DownloadIcon,
    FileTextIcon,
    HeartIcon,
    LayersIcon,
    Trash2Icon,
    XIcon,
} from 'lucide-react';

import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import { Book, BookAvailability, BookPage } from '@/lib/hooks/useBook/type';
import { COVER_DETAIL_WIDTH } from '@/lib/hooks/useBookPage';
import cn from '@/lib/ui/cn';

import BookCover, { GetCover } from './BookCover';
import BookReader from './BookReader';

interface BookDetailsProps {
    book: Book;
    onClose: () => void;
    getCover: GetCover;
    getPage: (bookId: string, order: number) => Promise<BookPage | undefined>;
    countDownloadedPages: (bookId: string) => Promise<number>;
    getAvailability: (bookId: string) => Promise<BookAvailability | undefined>;
    removeDownloadedPages: (bookId: string) => Promise<void>;
    isFavorite: boolean;
    onToggleFavorite: (book: Book) => Promise<boolean> | void;
    onDownloadsChanged?: (bookId: string, count: number) => void;
}

const FORMAT_LABELS: Record<string, string> = {
    pdf: 'PDF',
    epub: 'EPUB',
    audiobook: 'Audio',
    paper: 'Papier',
    numeric: 'Numérique',
};

export default function BookDetails({
    book,
    onClose,
    getCover,
    getPage,
    countDownloadedPages,
    getAvailability,
    removeDownloadedPages,
    isFavorite,
    onToggleFavorite,
    onDownloadsChanged,
}: BookDetailsProps) {
    const [downloaded, setDownloaded] = useState<number>(0);
    const [availability, setAvailability] = useState<BookAvailability | undefined>(undefined);
    const [isReading, setIsReading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState<number | undefined>(undefined);
    const [feedback, setFeedback] = useState<string | undefined>(undefined);

    // Permet d'interrompre un telechargement en cours (fermeture, annulation).
    const cancelRef = useRef(false);

    /** Nombre de pages a considerer : ce que le serveur possede vraiment. */
    const totalPages = availability?.available_pages ?? book.page;
    const isComplete = downloaded > 0 && downloaded >= totalPages;
    const hasNoContent = availability?.has_content === false;

    useEffect(() => {
        let cancelled = false;

        countDownloadedPages(book.id).then((count) => {
            if (!cancelled) setDownloaded(count);
        });

        getAvailability(book.id).then((result) => {
            if (!cancelled) setAvailability(result);
        });

        return () => {
            cancelled = true;
            cancelRef.current = true;
        };
    }, [book.id, countDownloadedPages, getAvailability]);

    // Fermeture au clavier.
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !isReading) onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose, isReading]);

    const handleDownload = useCallback(async () => {
        cancelRef.current = false;
        setDownloadProgress(0);
        setFeedback(undefined);

        let failures = 0;

        // Les pages sont numerotees a partir de 1 et jusqu'a `totalPages` inclus.
        for (let order = 1; order <= totalPages; order += 1) {
            if (cancelRef.current) break;

            const page = await getPage(book.id, order);
            if (!page) failures += 1;

            setDownloadProgress(Math.round((order / totalPages) * 100));
        }

        const count = await countDownloadedPages(book.id);
        setDownloaded(count);
        onDownloadsChanged?.(book.id, count);
        setDownloadProgress(undefined);

        if (cancelRef.current) setFeedback('Téléchargement interrompu.');
        else if (failures > 0) setFeedback(`${failures} page(s) n’ont pas pu être téléchargées.`);
        else setFeedback('Livre disponible hors ligne.');
    }, [book.id, totalPages, getPage, countDownloadedPages, onDownloadsChanged]);

    const handleRemoveDownload = useCallback(async () => {
        await removeDownloadedPages(book.id);
        setDownloaded(0);
        onDownloadsChanged?.(book.id, 0);
        setFeedback('Pages hors ligne supprimées.');
    }, [book.id, removeDownloadedPages, onDownloadsChanged]);

    const meta = useMemo(
        () =>
            [
                {
                    icon: <FileTextIcon size={13} />,
                    label: FORMAT_LABELS[book.book_format] ?? book.book_format,
                },
                { icon: <LayersIcon size={13} />, label: `${book.page} pages` },
                downloaded > 0
                    ? {
                          icon: isComplete ? <CheckCircle2Icon size={13} /> : <DownloadIcon size={13} />,
                          label: isComplete
                              ? 'Hors ligne'
                              : `${downloaded}/${totalPages} hors ligne`,
                          highlight: true,
                      }
                    : null,
            ].filter(Boolean) as { icon: React.ReactNode; label: string; highlight?: boolean }[],
        [book.book_format, book.page, downloaded, isComplete, totalPages],
    );

    const isDownloading = downloadProgress !== undefined;

    return (
        <>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={onClose}
                className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm"
                aria-hidden
            />

            <motion.div
                role="dialog"
                aria-modal="true"
                aria-label={book.title}
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className={cn(
                    'fixed inset-x-0 bottom-0 z-[60] mx-auto flex max-h-[92vh] w-full flex-col',
                    'overflow-hidden rounded-t-3xl border border-line bg-surface shadow-overlay',
                    'sm:inset-y-auto sm:top-1/2 sm:max-w-2xl sm:-translate-y-1/2 sm:rounded-3xl',
                )}
            >
                {/* Poignée de glissement, sur mobile. */}
                <div className="flex justify-center pt-2.5 sm:hidden">
                    <span className="h-1 w-10 rounded-full bg-line" />
                </div>

                <header className="flex items-center gap-3 px-5 py-3">
                    <IconButton label="Fermer" variant="ghost" onClick={onClose} className="sm:hidden">
                        <ArrowLeftIcon size={18} />
                    </IconButton>
                    <p className="flex-1 text-[13px] font-medium text-ink-muted">Détail du livre</p>
                    <IconButton label="Fermer" variant="ghost" onClick={onClose} className="hidden sm:flex">
                        <XIcon size={18} />
                    </IconButton>
                </header>

                <div className="scroll-area flex-1 overflow-y-auto px-5 pb-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="mx-auto w-40 shrink-0 overflow-hidden rounded-xl shadow-lifted sm:mx-0 sm:w-44"
                        >
                            <div className="aspect-[3/4] w-full">
                                <BookCover book={book} getCover={getCover} width={COVER_DETAIL_WIDTH} eager />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="min-w-0 flex-1"
                        >
                            <h2 className="text-balance text-xl font-semibold leading-tight text-ink">
                                {book.title}
                            </h2>
                            {book.author && (
                                <p className="mt-1 text-[13px] text-ink-muted">{book.author}</p>
                            )}

                            <div className="mt-3 flex flex-wrap gap-2">
                                {meta.map((item) => (
                                    <span
                                        key={item.label}
                                        className={cn(
                                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium',
                                            item.highlight
                                                ? 'bg-success-soft text-success'
                                                : 'bg-surface-muted text-ink-muted',
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </span>
                                ))}
                            </div>

                            {book.description && (
                                <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
                                    {book.description}
                                </p>
                            )}

                            {hasNoContent && (
                                <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-accent-soft px-3.5 py-3 text-[12px] text-accent">
                                    <CloudOffIcon size={15} className="mt-0.5 shrink-0" />
                                    <p>
                                        Les pages de ce livre ne sont pas encore disponibles sur le
                                        serveur. La couverture affichée est générée automatiquement.
                                    </p>
                                </div>
                            )}

                            <AnimatePresence>
                                {feedback && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-3 text-[12px] text-ink-muted"
                                    >
                                        {feedback}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                <motion.footer
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.35 }}
                    className="border-t border-line bg-surface-raised px-5 py-4"
                >
                    {isDownloading ? (
                        <div className="space-y-2.5">
                            <div className="flex items-center justify-between text-[12px] text-ink-muted">
                                <span>Téléchargement en cours…</span>
                                <span className="font-semibold tabular-nums text-ink">
                                    {downloadProgress}%
                                </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    animate={{ width: `${downloadProgress}%` }}
                                    transition={{ ease: 'linear', duration: 0.25 }}
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                block
                                onClick={() => {
                                    cancelRef.current = true;
                                }}
                            >
                                Annuler
                            </Button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button
                                size="md"
                                className="flex-1"
                                disabled={hasNoContent}
                                icon={<BookOpenIcon size={16} />}
                                onClick={() => setIsReading(true)}
                            >
                                Lire le livre
                            </Button>

                            {!isComplete && !hasNoContent && (
                                <Button
                                    variant="secondary"
                                    size="md"
                                    icon={<DownloadIcon size={16} />}
                                    onClick={handleDownload}
                                >
                                    <span className="hidden sm:inline">Télécharger</span>
                                </Button>
                            )}

                            {downloaded > 0 && (
                                <IconButton
                                    label="Supprimer les pages hors ligne"
                                    variant="surface"
                                    size={44}
                                    onClick={handleRemoveDownload}
                                >
                                    <Trash2Icon size={17} />
                                </IconButton>
                            )}

                            <IconButton
                                label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                variant="surface"
                                size={44}
                                onClick={() => onToggleFavorite(book)}
                            >
                                <motion.span
                                    key={String(isFavorite)}
                                    initial={{ scale: 0.6 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                                    className="flex"
                                >
                                    <HeartIcon
                                        size={17}
                                        className={isFavorite ? 'fill-red-500 text-red-500' : ''}
                                    />
                                </motion.span>
                            </IconButton>
                        </div>
                    )}
                </motion.footer>
            </motion.div>

            <AnimatePresence>
                {isReading && (
                    <BookReader
                        book={{ ...book, page: totalPages }}
                        getPage={getPage}
                        onClose={() => {
                            setIsReading(false);
                            countDownloadedPages(book.id).then((count) => {
                                setDownloaded(count);
                                onDownloadsChanged?.(book.id, count);
                            });
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
