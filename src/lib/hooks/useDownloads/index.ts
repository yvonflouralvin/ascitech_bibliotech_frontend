'use client';

import { useCallback, useEffect, useState } from 'react';

import useIndexedDB from '../useIndexedDB';
import { BookPage } from '../useBook/type';

/**
 * Nombre de pages disponibles hors ligne, par livre.
 *
 * Le comptage passe par l'index `book` : seuls les livres ayant au moins une
 * page sont interroges, et aucune image n'est chargee en memoire.
 */
const useDownloads = () => {
    const { db, distinctByIndex, countByIndex } = useIndexedDB<BookPage>('bookpages');
    const [counts, setCounts] = useState<Record<string, number>>({});
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            const bookIds = await distinctByIndex('book');
            const entries = await Promise.all(
                bookIds.map(async (bookId) => [bookId, await countByIndex('book', bookId)] as const),
            );
            setCounts(Object.fromEntries(entries.filter(([, count]) => count > 0)));
        } catch (e) {
            console.error('Comptage des pages hors ligne impossible :', e);
        } finally {
            setIsLoading(false);
        }
    }, [distinctByIndex, countByIndex]);

    useEffect(() => {
        if (db) refresh();
    }, [db, refresh]);

    /** Met a jour le compteur d'un livre sans relire toute la base. */
    const setCount = useCallback((bookId: string, count: number) => {
        setCounts((current) => {
            if (count <= 0) {
                const { [bookId]: _removed, ...rest } = current;
                return rest;
            }
            return { ...current, [bookId]: count };
        });
    }, []);

    return { counts, isLoading, refresh, setCount };
};

export default useDownloads;
