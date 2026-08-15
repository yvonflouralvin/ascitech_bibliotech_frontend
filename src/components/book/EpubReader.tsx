'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { AlertCircleIcon, MinusIcon, PlusIcon, XIcon } from 'lucide-react';

import IconButton from '@/components/ui/IconButton';
import Spinner from '@/components/ui/Spinner';
import useTheme from '@/lib/hooks/useTheme';
import { Book } from '@/lib/hooks/useBook/type';

/**
 * `react-reader` s'appuie sur epub.js, qui touche `window` a l'import :
 * le composant est charge uniquement cote client.
 */
const ReactReader = dynamic(() => import('react-reader').then((mod) => mod.ReactReader), {
    ssr: false,
    loading: () => (
        <div className="flex h-full items-center justify-center gap-3 text-ink-muted">
            <Spinner size={24} />
            <p className="text-[13px]">Ouverture du livre…</p>
        </div>
    ),
});

/** Cle de reprise de lecture, par livre. */
const locationKey = (bookId: string) => `bibliotech-epub-location:${bookId}`;

const FONT_SIZES = [80, 90, 100, 115, 130, 150];
const DEFAULT_FONT_INDEX = 2;

interface EpubReaderProps {
    book: Book;
    onClose: () => void;
}

/**
 * Lecteur EPUB.
 *
 * Contrairement aux livres pagines en images, un EPUB est charge depuis son
 * fichier (`book_file_path`) et rendu par epub.js. La position de lecture est
 * memorisee localement pour reprendre la ou l'eleve s'est arrete.
 */
export default function EpubReader({ book, onClose }: EpubReaderProps) {
    const { theme } = useTheme();
    const [location, setLocation] = useState<string | number>(0);
    const [ready, setReady] = useState(false);
    const [fontIndex, setFontIndex] = useState(DEFAULT_FONT_INDEX);
    const [label, setLabel] = useState<string>('');

    // Conserve le rendu epub.js pour reappliquer la typographie a la volee.
    const renditionRef = useRef<any>(null);

    const applyTypography = useCallback(
        (rendition: any) => {
            if (!rendition) return;
            rendition.themes.fontSize(`${FONT_SIZES[fontIndex]}%`);
            rendition.themes.override('color', theme === 'dark' ? '#e7eaee' : '#181a1d');
            rendition.themes.override('background', theme === 'dark' ? '#161a1f' : '#ffffff');
        },
        [fontIndex, theme],
    );

    // Taille de texte et theme s'appliquent sans rouvrir le livre.
    useEffect(() => {
        applyTypography(renditionRef.current);
    }, [applyTypography]);

    // Reprise de lecture.
    useEffect(() => {
        try {
            const saved = localStorage.getItem(locationKey(book.id));
            if (saved) setLocation(saved);
        } catch (e) {
            // Stockage indisponible : la lecture demarre au debut.
        } finally {
            setReady(true);
        }
    }, [book.id]);

    const handleLocationChanged = useCallback(
        (epubcfi: string) => {
            setLocation(epubcfi);
            try {
                localStorage.setItem(locationKey(book.id), epubcfi);
            } catch (e) {
                // Sans persistance, la lecture reste fonctionnelle.
            }
        },
        [book.id],
    );

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [onClose]);

    if (!book.book_file_path) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="reader-surface fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 px-8 text-center"
            >
                <AlertCircleIcon size={30} className="text-ink-subtle" />
                <p className="text-[13px] text-ink-muted">
                    Le fichier de ce livre n’est pas disponible pour le moment.
                </p>
                <IconButton label="Fermer le lecteur" variant="surface" onClick={onClose}>
                    <XIcon size={18} />
                </IconButton>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[70] flex flex-col bg-surface"
            role="dialog"
            aria-modal="true"
            aria-label={`Lecture de ${book.title}`}
        >
            <header className="flex items-center gap-3 border-b border-line px-3 py-2.5 sm:px-5">
                <IconButton label="Fermer le lecteur" variant="ghost" onClick={onClose}>
                    <XIcon size={18} />
                </IconButton>

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{book.title}</p>
                    <p className="truncate text-[11px] text-ink-subtle">
                        {label || book.author || 'EPUB'}
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <IconButton
                        label="Réduire la taille du texte"
                        variant="ghost"
                        size={36}
                        disabled={fontIndex === 0}
                        onClick={() => setFontIndex((i) => Math.max(0, i - 1))}
                    >
                        <MinusIcon size={16} />
                    </IconButton>
                    <span className="w-10 text-center text-[11px] tabular-nums text-ink-subtle">
                        {FONT_SIZES[fontIndex]}%
                    </span>
                    <IconButton
                        label="Augmenter la taille du texte"
                        variant="ghost"
                        size={36}
                        disabled={fontIndex === FONT_SIZES.length - 1}
                        onClick={() => setFontIndex((i) => Math.min(FONT_SIZES.length - 1, i + 1))}
                    >
                        <PlusIcon size={16} />
                    </IconButton>
                </div>
            </header>

            <div className="relative flex-1">
                {ready && (
                    <ReactReader
                        url={book.book_file_path}
                        location={location}
                        locationChanged={handleLocationChanged}
                        epubOptions={{ flow: 'paginated' }}
                        tocChanged={(toc: any) => {
                            // Simple indicateur de contexte dans l'en-tete.
                            if (Array.isArray(toc) && toc.length > 0 && !label) {
                                setLabel(`${toc.length} chapitres`);
                            }
                        }}
                        readerStyles={
                            theme === 'dark'
                                ? {
                                      ...DARK_READER_STYLES,
                                      // La taille est appliquee au conteneur du texte.
                                  }
                                : undefined
                        }
                        getRendition={(rendition: any) => {
                            renditionRef.current = rendition;
                            applyTypography(rendition);
                        }}
                    />
                )}
            </div>
        </motion.div>
    );
}

/**
 * Styles sombres pour la surface de lecture. `react-reader` attend un objet de
 * styles complet ; seules les couleurs sont surchargees.
 */
const DARK_READER_STYLES: any = {
    container: { overflow: 'hidden', height: '100%' },
    readerArea: {
        position: 'relative',
        zIndex: 1,
        height: '100%',
        width: '100%',
        backgroundColor: '#161a1f',
        transition: 'all .3s ease',
    },
    titleArea: { display: 'none' },
    reader: { position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 },
    swipeWrapper: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 200,
    },
    prev: { left: 1 },
    next: { right: 1 },
    arrow: {
        outline: 'none',
        border: 'none',
        background: 'none',
        position: 'absolute',
        top: '50%',
        marginTop: -32,
        fontSize: 64,
        padding: '0 8px',
        color: '#8a9199',
        fontFamily: 'arial, sans-serif',
        cursor: 'pointer',
        userSelect: 'none',
        appearance: 'none',
        fontWeight: 'normal',
    },
    arrowHover: { color: '#e7eaee' },
    tocBackground: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 1,
    },
    tocArea: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 0,
        width: 256,
        overflowY: 'auto',
        background: '#1e2329',
        padding: '10px 0',
    },
    tocAreaButton: {
        userSelect: 'none',
        appearance: 'none',
        background: 'none',
        border: 'none',
        display: 'block',
        fontFamily: 'sans-serif',
        width: '100%',
        fontSize: '.9em',
        textAlign: 'left',
        padding: '.9em 1em',
        borderBottom: '1px solid #2f363e',
        color: '#c8cfd6',
        boxSizing: 'border-box',
        outline: 'none',
        cursor: 'pointer',
    },
    tocButton: {
        background: 'none',
        border: 'none',
        width: 32,
        height: 32,
        position: 'absolute',
        top: 10,
        left: 10,
        borderRadius: 2,
        outline: 'none',
        cursor: 'pointer',
    },
    tocButtonBar: {
        position: 'absolute',
        width: '60%',
        background: '#8a9199',
        height: 2,
        left: '50%',
        margin: '-1px -30%',
        top: '50%',
        transition: 'all .5s ease',
    },
    tocButtonBarTop: { top: '35%' },
    tocButtonBottom: { top: '66%' },
    tocButtonExpanded: { background: '#1e2329' },
    loadingView: {
        position: 'absolute',
        top: '50%',
        left: '10%',
        right: '10%',
        color: '#8a9199',
        textAlign: 'center',
        marginTop: '-.5em',
    },
};
