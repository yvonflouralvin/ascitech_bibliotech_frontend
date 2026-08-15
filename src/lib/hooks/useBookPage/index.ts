'use client';

import { useCallback } from "react";

import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";

import useIndexedDB from "../useIndexedDB";
import { BookAvailability, BookCover, BookPage } from "../useBook/type";

/** Cle locale d'une page : deterministe et independante du format serveur. */
export const pageKey = (bookId: string, order: number) => `${bookId}:${order}`;

/** Largeur demandee pour les vignettes de la grille (l'original fait ~1 Mo). */
export const COVER_THUMBNAIL_WIDTH = 400;
/** Largeur de la couverture affichee sur la fiche detaillee. */
export const COVER_DETAIL_WIDTH = 700;

/** Construit l'URL de donnees affichable par une balise <img>. */
export const toDataUrl = (content?: string | null, mime?: string | null): string | undefined => {
    if (!content) return undefined;
    return `data:${mime || "image/jpeg"};base64,${content}`;
};

const useBookPage = () => {
    // Les methodes sont destructurees plutot que conservees en objet : chaque
    // fonction est memoisee individuellement, donc son identite reste stable.
    // Passer l'objet entier en dependance rejouerait les effets a chaque rendu.
    const {
        db,
        get: getStoredPage,
        put: storePage,
        selectOne: selectStoredPage,
        countByIndex: countPagesByIndex,
        getByIndex: getPagesByIndex,
        deleteById: deletePage,
    } = useIndexedDB<BookPage>("bookpages");

    const { get: getStoredCover, put: storeCover } = useIndexedDB<BookCover>("covers");

    /**
     * Page d'un livre, depuis le cache local sinon depuis l'API.
     * Toute page recuperee est stockee pour la lecture hors ligne.
     */
    const getPage = useCallback(
        async (bookId: string, order: number): Promise<BookPage | undefined> => {
            const key = pageKey(bookId, order);

            try {
                const cached = await getStoredPage(key);
                if (cached) return cached;

                // Repli sur les enregistrements ecrits par les versions
                // precedentes, qui utilisaient une autre convention de cle.
                const legacy = await selectStoredPage([
                    { key: "book", value: bookId },
                    { key: "order", value: order },
                ]);
                if (legacy) return legacy;
            } catch (e) {
                console.error("Lecture du cache de pages impossible :", e);
            }

            try {
                const response = await api(cookies).get(`/books/${bookId}/page/${order}/`);
                const page: BookPage = { ...response.data, id: key, book: bookId, order };
                await storePage(page).catch((e) => console.error("Mise en cache de la page :", e));
                return page;
            } catch (e) {
                console.error(`Page ${order} du livre ${bookId} indisponible :`, e);
                return undefined;
            }
        },
        [getStoredPage, selectStoredPage, storePage],
    );

    /**
     * Couverture d'un livre.
     *
     * S'appuie sur `/cover/`, qui retombe sur la premiere page disponible quelle
     * que soit la numerotation des fichiers — les livres EPUB dont les pages ne
     * commencent pas a `content_01.txt` ont donc bien une couverture. Lorsque le
     * serveur repond qu'aucun fichier n'existe, l'absence est memorisee pour ne
     * pas relancer la requete a chaque affichage de la vignette.
     */
    const getCover = useCallback(
        async (bookId: string, width: number = COVER_THUMBNAIL_WIDTH): Promise<BookCover | undefined> => {
            const key = width ? `${bookId}:w${width}` : bookId;

            try {
                const cached = await getStoredCover(key);
                if (cached) return cached;
            } catch (e) {
                console.error("Lecture du cache de couvertures impossible :", e);
            }

            try {
                const response = await api(cookies).get(`/books/${bookId}/cover/`, {
                    params: width ? { width } : undefined,
                });
                const cover: BookCover = { ...response.data, id: key, book: bookId };
                await storeCover(cover).catch((e) =>
                    console.error("Mise en cache de la couverture :", e),
                );
                return cover;
            } catch (e) {
                console.error(`Couverture du livre ${bookId} indisponible :`, e);
                return undefined;
            }
        },
        [getStoredCover, storeCover],
    );

    /** Nombre de pages presentes en local, compte via un index (sans charger les images). */
    const countDownloadedPages = useCallback(
        async (bookId: string): Promise<number> => {
            try {
                return await countPagesByIndex("book", bookId);
            } catch (e) {
                console.error(e);
                return 0;
            }
        },
        [countPagesByIndex],
    );

    /** Nombre de pages reellement disponibles cote serveur. */
    const getAvailability = useCallback(
        async (bookId: string): Promise<BookAvailability | undefined> => {
            try {
                const response = await api(cookies).get(`/books/${bookId}/availability/`);
                return response.data;
            } catch (e) {
                console.error(`Disponibilite du livre ${bookId} inconnue :`, e);
                return undefined;
            }
        },
        [],
    );

    /** Supprime les pages telechargees d'un livre (liberation d'espace). */
    const removeDownloadedPages = useCallback(
        async (bookId: string): Promise<void> => {
            try {
                const stored = await getPagesByIndex("book", bookId);
                await Promise.all(stored.map((page) => deletePage(page.id)));
            } catch (e) {
                console.error(e);
            }
        },
        [getPagesByIndex, deletePage],
    );

    return {
        db,
        getPage,
        getCover,
        countDownloadedPages,
        getAvailability,
        removeDownloadedPages,
        storePage,
    };
};

export default useBookPage;
