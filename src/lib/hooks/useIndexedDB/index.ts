'use client';

import { useCallback, useEffect, useState } from 'react';

const DB_NAME = 'AscitechBibliotech';
/**
 * v3 : ajout du magasin `covers` et d'un index `book` sur `bookpages`.
 * L'index evite de charger toutes les pages (des images base64) en memoire
 * juste pour compter celles qui sont deja telechargees.
 */
const DB_VERSION = 3;

export type ObjectStore = 'books' | 'configs' | 'bookpages' | 'booksfavorites' | 'covers';

const OBJECT_STORES: ObjectStore[] = [
    'books',
    'configs',
    'bookpages',
    'booksfavorites',
    'covers',
];

/** Index secondaires a creer, par magasin. */
const INDEXES: Partial<Record<ObjectStore, { name: string; keyPath: string }[]>> = {
    bookpages: [{ name: 'book', keyPath: 'book' }],
};

export type Criteria = { key: string; value: any };

/**
 * Une seule connexion IndexedDB partagee par tous les hooks : ouvrir la base
 * une fois par composant multiplie les connexions et bloque les migrations de
 * version (evenement `versionchange` en attente).
 */
let connection: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
    if (connection) return connection;

    connection = new Promise<IDBDatabase>((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error("IndexedDB n'est pas disponible dans cet environnement."));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            const transaction = request.transaction;
            if (!transaction) return;

            OBJECT_STORES.forEach((name) => {
                const store = db.objectStoreNames.contains(name)
                    ? transaction.objectStore(name)
                    : db.createObjectStore(name, { keyPath: 'id' });

                (INDEXES[name] ?? []).forEach(({ name: indexName, keyPath }) => {
                    if (!store.indexNames.contains(indexName)) {
                        store.createIndex(indexName, keyPath, { unique: false });
                    }
                });
            });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () =>
            reject(new Error('Mise a jour de la base locale bloquee par un autre onglet.'));
    }).catch((error) => {
        // Une ouverture en echec ne doit pas etre mise en cache definitivement.
        connection = null;
        throw error;
    });

    return connection;
};

const promisify = <T,>(request: IDBRequest<T>): Promise<T> =>
    new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });

function useIndexedDB<T extends { id: string }>(storeName: ObjectStore) {
    const [db, setDb] = useState<IDBDatabase | undefined>(undefined);
    const [datas, setDatas] = useState<T[]>([]);
    const [error, setError] = useState<Error | undefined>(undefined);

    useEffect(() => {
        let cancelled = false;

        openDatabase()
            .then((database) => {
                if (!cancelled) setDb(database);
            })
            .catch((e: Error) => {
                console.error('Ouverture de la base locale impossible :', e);
                if (!cancelled) setError(e);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const withStore = useCallback(
        async <R,>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => Promise<R>): Promise<R> => {
            const database = db ?? (await openDatabase());
            const transaction = database.transaction([storeName], mode);
            return run(transaction.objectStore(storeName));
        },
        [db, storeName],
    );

    /**
     * Ecrit un enregistrement.
     *
     * N'alimente volontairement pas `datas` : le magasin `bookpages` contient
     * des images base64, et les accumuler dans l'etat React ferait grimper la
     * memoire a chaque page telechargee. Les listes reactives sont gerees par
     * les hooks metier (`useBook`, `useFavori`), qui savent ce qu'ils affichent.
     */
    const put = useCallback(
        async (data: T): Promise<T> => {
            await withStore('readwrite', (store) => promisify(store.put(data)));
            return data;
        },
        [withStore],
    );

    /** Ecrit un lot en une seule transaction (bien plus rapide qu'un put par element). */
    const putMany = useCallback(
        async (params: T[]): Promise<T[]> => {
            if (params.length === 0) {
                setDatas([]);
                return params;
            }

            const database = db ?? (await openDatabase());
            await new Promise<void>((resolve, reject) => {
                const transaction = database.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                params.forEach((item) => store.put(item));
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
                transaction.onabort = () => reject(transaction.error);
            });

            setDatas(params);
            return params;
        },
        [db, storeName],
    );

    const get = useCallback(
        async (id: string): Promise<T | undefined> => withStore('readonly', (store) => promisify<T>(store.get(id))),
        [withStore],
    );

    const getAll = useCallback(
        async (): Promise<T[]> => withStore('readonly', (store) => promisify<T[]>(store.getAll())),
        [withStore],
    );

    const deleteById = useCallback(
        async (id: string): Promise<void> => {
            await withStore('readwrite', (store) => promisify(store.delete(id)));
        },
        [withStore],
    );

    /** Compte les enregistrements via un index, sans charger leur contenu. */
    const countByIndex = useCallback(
        async (indexName: string, value: any): Promise<number> =>
            withStore('readonly', (store) => {
                if (!store.indexNames.contains(indexName)) return Promise.resolve(0);
                return promisify(store.index(indexName).count(IDBKeyRange.only(value)));
            }),
        [withStore],
    );

    /** Lit les enregistrements d'un index donne. */
    const getByIndex = useCallback(
        async (indexName: string, value: any): Promise<T[]> =>
            withStore('readonly', (store) => {
                if (!store.indexNames.contains(indexName)) return Promise.resolve([] as T[]);
                return promisify<T[]>(store.index(indexName).getAll(IDBKeyRange.only(value)));
            }),
        [withStore],
    );

    /**
     * Valeurs distinctes d'un index, parcourues par curseur de cles.
     * Ne charge aucun enregistrement : indispensable pour `bookpages`, dont les
     * valeurs sont des images base64.
     */
    const distinctByIndex = useCallback(
        async (indexName: string): Promise<string[]> =>
            withStore('readonly', (store) => {
                if (!store.indexNames.contains(indexName)) return Promise.resolve([] as string[]);

                return new Promise<string[]>((resolve, reject) => {
                    const values: string[] = [];
                    const request = store.index(indexName).openKeyCursor(null, 'nextunique');
                    request.onsuccess = () => {
                        const cursor = request.result;
                        if (!cursor) {
                            resolve(values);
                            return;
                        }
                        values.push(String(cursor.key));
                        cursor.continue();
                    };
                    request.onerror = () => reject(request.error);
                });
            }),
        [withStore],
    );

    const selectAll = useCallback(
        async (criteria: Criteria[]): Promise<T[]> => {
            // On restreint d'abord par index quand c'est possible, puis on
            // affine en memoire sur les criteres restants.
            const indexed = criteria.find(({ key }) =>
                (INDEXES[storeName] ?? []).some((index) => index.name === key),
            );

            const base = indexed ? await getByIndex(indexed.key, indexed.value) : await getAll();
            return base.filter((item) =>
                criteria.every((criterion) => (item as any)[criterion.key] === criterion.value),
            );
        },
        [getAll, getByIndex, storeName],
    );

    const selectOne = useCallback(
        async (criteria: Criteria[]): Promise<T | undefined> => (await selectAll(criteria))[0],
        [selectAll],
    );

    return {
        db,
        error,
        datas,
        setDatas,
        put,
        putMany,
        get,
        getAll,
        deleteById,
        selectAll,
        selectOne,
        countByIndex,
        getByIndex,
        distinctByIndex,
    };
}

export default useIndexedDB;
