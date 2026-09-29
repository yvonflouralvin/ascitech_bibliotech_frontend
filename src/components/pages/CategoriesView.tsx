'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRightIcon, TagsIcon } from 'lucide-react';

import AppShell from '@/components/layout/AppShell';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';
import useAuthentification from '@/lib/hooks/authentification';
import useBook from '@/lib/hooks/useBook';
import useFavori from '@/lib/hooks/useFavori';
import { BookCategory, compareCategories } from '@/lib/hooks/useBook/type';

interface CategoryEntry {
    slug: string;
    name: string;
    count: number;
}

/**
 * Liste des domaines thematiques, en entree de navigation.
 *
 * Les domaines sont deduits du catalogue deja en cache — comme les puces de
 * filtre — donc la page reste consultable hors ligne et ne propose jamais un
 * rayon vide a l'eleve.
 */
export default function CategoriesView() {
    const router = useRouter();
    const { logout } = useAuthentification({ redirect: false });

    const { books, isLoading, reload } = useBook();
    const { favorites } = useFavori();

    /** Meme catalogue que la bibliotheque : les favoris completent le cache. */
    const catalogue = useMemo(() => {
        const byId = new Map(books.map((book) => [book.id, book]));
        favorites.forEach((favorite) => {
            if (!byId.has(favorite.id)) byId.set(favorite.id, favorite);
        });
        return Array.from(byId.values());
    }, [books, favorites]);

    const categories = useMemo<CategoryEntry[]>(() => {
        const known = new Map<string, BookCategory>();
        const tally = new Map<string, number>();

        catalogue.forEach((book) => {
            book.categories?.forEach((item) => {
                known.set(item.slug, item);
                tally.set(item.slug, (tally.get(item.slug) ?? 0) + 1);
            });
        });

        return Array.from(known.values())
            .sort(compareCategories)
            .map((item) => ({
                slug: item.slug,
                name: item.name,
                count: tally.get(item.slug) ?? 0,
            }));
    }, [catalogue]);

    const handleLogout = useCallback(async () => {
        await logout();
        router.push('/login');
    }, [logout, router]);

    const subtitle = `${categories.length} domaine${categories.length > 1 ? 's' : ''}`;

    return (
        <AppShell title="Catégories" subtitle={subtitle} onLogout={handleLogout}>
            {isLoading && catalogue.length === 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-[86px] rounded-2xl" delay={index * 60} />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <EmptyState
                    icon={<TagsIcon size={24} />}
                    title="Aucun domaine pour le moment"
                    description="Les livres de votre classe ne sont pas encore classés par domaine."
                    action={
                        <Button variant="secondary" size="sm" onClick={reload}>
                            Actualiser
                        </Button>
                    }
                />
            ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.slug}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: Math.min(index * 0.04, 0.3),
                                duration: 0.4,
                                ease: [0.22, 1, 0.36, 1],
                            }}
                        >
                            <Link
                                href={`/categories/${category.slug}`}
                                className="group flex h-full items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-surface-muted"
                            >
                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
                                    <TagsIcon size={19} />
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-[14px] font-semibold text-ink">
                                        {category.name}
                                    </span>
                                    <span className="block text-[12px] text-ink-muted">
                                        {category.count} livre{category.count > 1 ? 's' : ''}
                                    </span>
                                </span>

                                <ChevronRightIcon
                                    size={17}
                                    className="shrink-0 text-ink-subtle transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                                />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </AppShell>
    );
}
