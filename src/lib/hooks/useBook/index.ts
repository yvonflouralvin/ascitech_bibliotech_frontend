'use client';

import { useCallback, useEffect, useState } from "react";

import useIndexedDB from "../useIndexedDB";
import functions from "./functions";
import { Book } from "./type";

/**
 * Catalogue de livres, en strategie « cache d'abord ».
 *
 * Les livres deja connus sont affiches immediatement depuis IndexedDB — donc
 * hors ligne aussi — puis rafraichis depuis l'API en arriere-plan. Une panne
 * reseau n'efface jamais le catalogue local.
 */
const useBook = (autoload: boolean = true) => {
    const { db, datas, setDatas, putMany, get, getAll } = useIndexedDB<Book>("books");

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [error, setError] = useState<string | undefined>(undefined);

    const loadBooks = useCallback(async () => {
        setIsRefreshing(true);
        try {
            const remote = await functions.loadBooks();
            await putMany(remote);
            setError(undefined);
        } catch (e) {
            console.error("Rafraichissement du catalogue impossible :", e);
            // On garde ce qui est en cache et on signale simplement le mode degrade.
            setError("Catalogue hors ligne : affichage des livres deja enregistres.");
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    }, [putMany]);

    const getBook = useCallback(
        async (id: string): Promise<Book | undefined> => {
            try {
                return await get(id);
            } catch (e) {
                console.error(e);
                return undefined;
            }
        },
        [get],
    );

    useEffect(() => {
        if (!db) return;
        let cancelled = false;

        const bootstrap = async () => {
            try {
                const cached = await getAll();
                if (!cancelled && cached.length > 0) {
                    setDatas(cached);
                    setIsLoading(false);
                }
            } catch (e) {
                console.error(e);
            }

            if (autoload && !cancelled) await loadBooks();
            else if (!cancelled) setIsLoading(false);
        };

        bootstrap();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [db, autoload]);

    return {
        books: datas,
        isLoading,
        isRefreshing,
        error,
        reload: loadBooks,
        getBook,
        db,
    };
};

export default useBook;
