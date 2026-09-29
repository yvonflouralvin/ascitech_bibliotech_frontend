'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValue } from 'framer-motion';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ImageOffIcon,
    Maximize2Icon,
    Minimize2Icon,
    RotateCcwIcon,
    XIcon,
    ZoomInIcon,
    ZoomOutIcon,
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

/** Bornes du zoom. Au-dela de 4x, une page numerisee ne revele plus rien. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

/** Delai maximal entre deux touchers pour un double tap. */
const DOUBLE_TAP_DELAY = 300;

const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);

/** Ecartement entre deux doigts, pour le pincement. */
const touchGap = (touches: TouchList) =>
    Math.hypot(
        touches[0].clientX - touches[1].clientX,
        touches[0].clientY - touches[1].clientY,
    );

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
    const [zoom, setZoom] = useState(MIN_ZOOM);

    // Evite qu'une reponse tardive n'ecrase la page affichee apres un changement rapide.
    const requestRef = useRef(0);

    // Deplacement de la page agrandie. Des valeurs de mouvement plutot que de
    // l'etat React : le panoramique suit le doigt sans repasser par un rendu.
    const panX = useMotionValue(0);
    const panY = useMotionValue(0);
    const [panBounds, setPanBounds] = useState({ left: 0, right: 0, top: 0, bottom: 0 });

    const viewportRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);
    const pinchRef = useRef<{ gap: number; zoom: number } | null>(null);
    const lastTapRef = useRef(0);

    const isZoomed = zoom > MIN_ZOOM;

    // Les gestes lisent le zoom courant sans redeclencher leurs abonnements.
    const zoomRef = useRef(zoom);
    zoomRef.current = zoom;

    /**
     * Change le niveau de zoom.
     *
     * « Ajuster a la largeur » est un preset qui etire deja l'image : le
     * combiner avec une mise a l'echelle ferait deborder la page sans moyen
     * d'atteindre ses bords. Les deux sont donc exclusifs.
     */
    const applyZoom = useCallback((next: number | ((current: number) => number)) => {
        setZoom((current) =>
            clamp(typeof next === 'function' ? next(current) : next, MIN_ZOOM, MAX_ZOOM),
        );
    }, []);

    useEffect(() => {
        if (zoom > MIN_ZOOM) setFitWidth(false);
    }, [zoom]);

    const resetZoom = useCallback(() => {
        setZoom(MIN_ZOOM);
        panX.set(0);
        panY.set(0);
    }, [panX, panY]);

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

    /**
     * Bornes du deplacement : la page ne doit pas pouvoir sortir du cadre.
     * `offsetWidth` donne la taille de mise en page, que la mise a l'echelle
     * ne modifie pas — d'ou la multiplication explicite par le zoom.
     */
    const computePanBounds = useCallback(() => {
        const viewport = viewportRef.current;
        const image = imageRef.current;
        if (!viewport || !image) return;

        const maxX = Math.max(0, (image.offsetWidth * zoom - viewport.clientWidth) / 2);
        const maxY = Math.max(0, (image.offsetHeight * zoom - viewport.clientHeight) / 2);

        setPanBounds({ left: -maxX, right: maxX, top: -maxY, bottom: maxY });

        // Un retour arriere du zoom peut laisser la page hors cadre.
        panX.set(clamp(panX.get(), -maxX, maxX));
        panY.set(clamp(panY.get(), -maxY, maxY));
    }, [zoom, panX, panY]);

    useEffect(() => {
        computePanBounds();
        window.addEventListener('resize', computePanBounds);
        return () => window.removeEventListener('resize', computePanBounds);
    }, [computePanBounds, source, fitWidth]);

    // Le zoom est conserve d'une page a l'autre — on lit rarement une seule
    // page en gros caracteres — mais la position revient au centre.
    useEffect(() => {
        panX.set(0);
        panY.set(0);
    }, [page, panX, panY]);

    /**
     * Pincement a deux doigts.
     *
     * Les ecouteurs sont poses a la main : React attache `touchmove` en mode
     * passif, ou `preventDefault` n'a aucun effet — le navigateur zoomerait
     * alors toute la page par-dessus le lecteur.
     *
     * L'etat du geste vit dans une ref, jamais dans la portee de l'effet :
     * le zoom change a chaque mouvement de doigt, et un effet qui en depend
     * se reabonnerait en plein pincement, perdant le point de depart.
     */
    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return undefined;

        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length === 2) {
                pinchRef.current = { gap: touchGap(event.touches), zoom: zoomRef.current };
            }
        };

        const onTouchMove = (event: TouchEvent) => {
            const pinch = pinchRef.current;
            if (event.touches.length !== 2 || !pinch || pinch.gap <= 0) return;
            event.preventDefault();
            applyZoom((touchGap(event.touches) / pinch.gap) * pinch.zoom);
        };

        const onTouchEnd = (event: TouchEvent) => {
            if (event.touches.length < 2) pinchRef.current = null;
        };

        viewport.addEventListener('touchstart', onTouchStart, { passive: true });
        viewport.addEventListener('touchmove', onTouchMove, { passive: false });
        viewport.addEventListener('touchend', onTouchEnd, { passive: true });
        viewport.addEventListener('touchcancel', onTouchEnd, { passive: true });

        return () => {
            viewport.removeEventListener('touchstart', onTouchStart);
            viewport.removeEventListener('touchmove', onTouchMove);
            viewport.removeEventListener('touchend', onTouchEnd);
            viewport.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [applyZoom]);

    /**
     * Un seul chemin pour le clic et le tap : le second coup annule la
     * bascule de la barre d'outils declenchee par le premier, puis zoome.
     * Un `onDoubleClick` separe s'ajouterait au double tap synthetise par le
     * navigateur mobile, et les deux s'annuleraient.
     */
    const handleViewportClick = useCallback(() => {
        const now = Date.now();
        const isSecondTap = now - lastTapRef.current < DOUBLE_TAP_DELAY;
        lastTapRef.current = isSecondTap ? 0 : now;

        setChromeVisible((current) => !current);
        if (!isSecondTap) return;

        if (zoomRef.current > MIN_ZOOM) resetZoom();
        else applyZoom(2);
    }, [applyZoom, resetZoom]);

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
                case '+':
                case '=':
                    event.preventDefault();
                    applyZoom((current) => current + ZOOM_STEP);
                    break;
                case '-':
                    event.preventDefault();
                    applyZoom((current) => current - ZOOM_STEP);
                    break;
                case '0':
                    event.preventDefault();
                    resetZoom();
                    break;
                case 'Escape':
                    event.preventDefault();
                    // Le zoom se defait avant le lecteur : sortir d'une page
                    // agrandie ne doit pas fermer le livre.
                    if (zoom > MIN_ZOOM) resetZoom();
                    else onClose();
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [next, previous, goTo, totalPages, onClose, applyZoom, resetZoom, zoom]);

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
            className="reader-surface viewport-fill fixed inset-x-0 top-0 z-[70] flex flex-col"
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
                            onClick={() => {
                                resetZoom();
                                setFitWidth((current) => !current);
                            }}
                        >
                            {fitWidth ? <Minimize2Icon size={17} /> : <Maximize2Icon size={17} />}
                        </IconButton>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* Zone de page */}
            <div
                ref={viewportRef}
                className={cn(
                    'scroll-area relative flex-1 overflow-auto',
                    fitWidth ? 'overflow-y-auto' : 'overflow-hidden',
                    // Le navigateur ne doit pas s'emparer du pincement : c'est
                    // le lecteur qui zoome, pas la page entiere.
                    // `manipulation` supprime le zoom par double tap du
                    // navigateur : c'est le lecteur qui doit y repondre.
                    isZoomed ? 'touch-none' : 'touch-manipulation',
                )}
                onClick={handleViewportClick}
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
                            // Page agrandie : le glissement sert a se deplacer
                            // dans la page, plus a tourner la page.
                            drag={fitWidth || isZoomed ? false : 'x'}
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
                                <motion.div
                                    drag={isZoomed}
                                    dragConstraints={panBounds}
                                    dragElastic={0.04}
                                    dragMomentum={false}
                                    style={{ x: panX, y: panY }}
                                    animate={{ scale: zoom }}
                                    transition={{ type: 'spring', stiffness: 260, damping: 30 }}
                                    className={cn('flex', isZoomed && 'cursor-grab active:cursor-grabbing')}
                                >
                                    {/* Les pages sont des images base64 issues
                                        d'IndexedDB : next/image ne sait pas
                                        optimiser une data URL. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        ref={imageRef}
                                        src={source}
                                        alt={`Page ${page} de ${book.title}`}
                                        draggable={false}
                                        onLoad={computePanBounds}
                                        className={cn(
                                            'select-none rounded-sm bg-white shadow-book',
                                            fitWidth
                                                ? 'w-full max-w-none rounded-none'
                                                : 'reader-page-fit w-auto max-w-full object-contain',
                                        )}
                                    />
                                </motion.div>
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

            {/* Commandes de zoom : une colonne flottante plutôt qu'un ajout à la
                barre inférieure, déjà occupée par la pagination sur mobile. */}
            <AnimatePresence>
                {chromeVisible && (
                    <motion.div
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        onClick={(event) => event.stopPropagation()}
                        className="absolute bottom-20 right-3 z-20 flex flex-col items-center gap-2 sm:right-5"
                    >
                        <IconButton
                            label="Agrandir"
                            variant="glass"
                            onClick={() => applyZoom((current) => current + ZOOM_STEP)}
                            disabled={zoom >= MAX_ZOOM}
                        >
                            <ZoomInIcon size={17} />
                        </IconButton>

                        <IconButton
                            label="Réduire"
                            variant="glass"
                            onClick={() => applyZoom((current) => current - ZOOM_STEP)}
                            disabled={zoom <= MIN_ZOOM}
                        >
                            <ZoomOutIcon size={17} />
                        </IconButton>

                        {isZoomed && (
                            <IconButton
                                label={`Revenir à la page entière (${Math.round(zoom * 100)} %)`}
                                variant="glass"
                                onClick={resetZoom}
                            >
                                <RotateCcwIcon size={16} />
                            </IconButton>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

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
