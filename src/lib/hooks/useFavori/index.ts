'use client';

import { useCallback, useEffect, useState } from "react";

import useIndexedDB from "../useIndexedDB";
import { Book } from "../useBook/type";

/** Livres mis en favori, conserves localement (aucun equivalent cote serveur). */
const useFavori = () => {
    const { db, get, getAll, put, deleteById } = useIndexedDB<Book>("booksfavorites");

    const [favorites, setFavorites] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const refresh = useCallback(async () => {
        try {
            setFavorites(await getAll());
        } catch (e) {
            console.error("Lecture des favoris impossible :", e);
        } finally {
            setIsLoading(false);
        }
    }, [getAll]);

    useEffect(() => {
        if (db) refresh();
    }, [db, refresh]);

    const addToFavorite = useCallback(
        async (book: Book) => {
            await put(book);
            setFavorites((current) =>
                current.some((item) => item.id === book.id) ? current : [...current, book],
            );
        },
        [put],
    );

    const removeToFavorite = useCallback(
        async (bookId: string) => {
            await deleteById(bookId);
            setFavorites((current) => current.filter((item) => item.id !== bookId));
        },
        [deleteById],
    );

    const toggleFavorite = useCallback(
        async (book: Book): Promise<boolean> => {
            const exists = favorites.some((item) => item.id === book.id);
            if (exists) {
                await removeToFavorite(book.id);
                return false;
            }
            await addToFavorite(book);
            return true;
        },
        [favorites, addToFavorite, removeToFavorite],
    );

    const isFavorite = useCallback(
        (bookId: string) => favorites.some((item) => item.id === bookId),
        [favorites],
    );

    return {
        favorites,
        isLoading,
        isFavorite,
        toggleFavorite,
        addToFavorite,
        removeToFavorite,
        refresh,
        /** Acces direct au magasin, pour une verification ponctuelle. */
        getFavorite: get,
        dbFavorite: db,
    };
};

export default useFavori;
