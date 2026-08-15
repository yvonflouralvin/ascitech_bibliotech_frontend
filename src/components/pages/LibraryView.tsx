'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { DownloadCloudIcon, HeartIcon, LibraryIcon, RefreshCwIcon, WifiOffIcon } from 'lucide-react';

import AllBookList from '@/components/book/AllBookList';
import BookDetails from '@/components/book/BookDetails';
import BookFilters, { BookScope, BookSort } from '@/components/book/BookFilters';
import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import SearchBar from '@/components/search-bar/SearchBar';
import useAuthentification from '@/lib/hooks/authentification';
import useBook from '@/lib/hooks/useBook';
import useBookPage from '@/lib/hooks/useBookPage';
import useDownloads from '@/lib/hooks/useDownloads';
import useFavori from '@/lib/hooks/useFavori';
import { Book } from '@/lib/hooks/useBook/type';

/** Normalisation pour une recherche insensible aux accents et a la casse. */
const normalize = (value: string) =>
    value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

interface LibraryViewProps {
    /** Filtre impose par la page ; l'utilisateur peut encore changer via les puces. */
    initialScope?: BookScope;
    title: string;
    /** Masque les puces de filtre (pages dediees). */
    lockScope?: boolean;
}

export default function LibraryView({ initialScope = 'all', title, lockScope }: LibraryViewProps) {
    const router = useRouter();
    const { logout } = useAuthentification({ redirect: false });

    const { books, isLoading, isRefreshing, error, reload } = useBook();
    const { getCover, getPage, countDownloadedPages, getAvailability, removeDownloadedPages } =
        useBookPage();
    const { favorites, isFavorite, toggleFavorite } = useFavori();
    const { counts: downloads, setCount } = useDownloads();

    const [search, setSearch] = useState('');
    const [scope, setScope] = useState<BookScope>(initialScope);
    const [sort, setSort] = useState<BookSort>('title');
    const [selected, setSelected] = useState<Book | undefined>(undefined);

    /** Catalogue complete par les favoris, pour rester consultable hors ligne. */
    const catalogue = useMemo(() => {
        const byId = new Map(books.map((book) => [book.id, book]));
        favorites.forEach((favorite) => {
            if (!byId.has(favorite.id)) byId.set(favorite.id, favorite);
        });
        return Array.from(byId.values());
    }, [books, favorites]);

    const scopeCounts = useMemo(
        () => ({
            all: catalogue.length,
            favorites: favorites.length,
            offline: catalogue.filter((book) => (downloads[book.id] ?? 0) > 0).length,
        }),
        [catalogue, favorites.length, downloads],
    );

    const visibleBooks = useMemo(() => {
        let list = catalogue;

        if (scope === 'favorites') list = list.filter((book) => isFavorite(book.id));
        else if (scope === 'offline') list = list.filter((book) => (downloads[book.id] ?? 0) > 0);

        const term = normalize(search.trim());
        if (term) {
            list = list.filter((book) => {
                const haystack = normalize(`${book.title} ${book.author ?? ''}`);
                return haystack.includes(term);
            });
        }

        return [...list].sort((a, b) =>
            sort === 'title'
                ? a.title.localeCompare(b.title, 'fr', { sensitivity: 'base' })
                : new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
    }, [catalogue, scope, search, sort, isFavorite, downloads]);

    const handleLogout = useCallback(async () => {
        await logout();
        router.push('/login');
    }, [logout, router]);

    const emptyState = useMemo(() => {
        if (search.trim()) return undefined;

        if (scope === 'favorites') {
            return (
                <EmptyState
                    icon={<HeartIcon size={24} />}
                    title="Aucun favori pour le moment"
                    description="Ouvrez un livre et touchez le cœur pour le retrouver ici."
                    action={
                        <Button variant="secondary" size="sm" onClick={() => setScope('all')}>
                            Parcourir le catalogue
                        </Button>
                    }
                />
            );
        }

        if (scope === 'offline') {
            return (
                <EmptyState
                    icon={<DownloadCloudIcon size={24} />}
                    title="Rien de disponible hors ligne"
                    description="Téléchargez un livre depuis sa fiche pour le lire sans connexion."
                    action={
                        <Button variant="secondary" size="sm" onClick={() => setScope('all')}>
                            Parcourir le catalogue
                        </Button>
                    }
                />
            );
        }

        return (
            <EmptyState
                icon={<LibraryIcon size={24} />}
                title="Aucun livre disponible"
                description="Aucun ouvrage n’est encore associé à votre classe. Rapprochez-vous de votre enseignant."
                action={
                    <Button variant="secondary" size="sm" icon={<RefreshCwIcon size={14} />} onClick={reload}>
                        Actualiser
                    </Button>
                }
            />
        );
    }, [scope, search, reload]);

    const subtitle = isRefreshing
        ? 'Mise à jour du catalogue…'
        : `${visibleBooks.length} livre${visibleBooks.length > 1 ? 's' : ''}`;

    return (
        <>
            <AppShell
                title={title}
                subtitle={subtitle}
                onLogout={handleLogout}
                toolbar={
                    <div className="flex flex-col gap-3">
                        <SearchBar
                            searchKeyWord={search}
                            setSearchKeyWord={setSearch}
                            resultCount={visibleBooks.length}
                        />
                        {!lockScope && (
                            <BookFilters
                                scope={scope}
                                onScopeChange={setScope}
                                sort={sort}
                                onSortChange={setSort}
                                counts={scopeCounts}
                            />
                        )}
                    </div>
                }
            >
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mb-4 flex items-center gap-2.5 rounded-xl bg-accent-soft px-4 py-3 text-[12px] text-accent"
                        >
                            <WifiOffIcon size={15} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AllBookList
                    books={visibleBooks}
                    getCover={getCover}
                    onSelect={setSelected}
                    isFavorite={isFavorite}
                    downloads={downloads}
                    isLoading={isLoading && catalogue.length === 0}
                    emptyState={emptyState}
                />
            </AppShell>

            <AnimatePresence>
                {selected && (
                    <BookDetails
                        key={selected.id}
                        book={selected}
                        onClose={() => setSelected(undefined)}
                        getCover={getCover}
                        getPage={getPage}
                        countDownloadedPages={countDownloadedPages}
                        getAvailability={getAvailability}
                        removeDownloadedPages={removeDownloadedPages}
                        isFavorite={isFavorite(selected.id)}
                        onToggleFavorite={toggleFavorite}
                        onDownloadsChanged={setCount}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
