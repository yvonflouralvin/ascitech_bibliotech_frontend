import { useState, useEffect, useCallback } from 'react';

// Nom de la base de données et version
const DB_NAME = 'AscitechBibliotech';
const DB_VERSION = 2;

type ObjectStore = "books" | "configs" | "bookpages" | "booksfavorites";
const objectStores: ObjectStore[] = [
    "books",
    "configs",
    "bookpages",
    "booksfavorites"
]

function useIndexedDB<T>(storeName: ObjectStore) {
    const [db, setDb] = useState<IDBDatabase | undefined>(undefined);
    const [datas, setDatas] = useState<T[]>([]);

    useEffect(() => {
        const request: IDBOpenDBRequest = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e: IDBVersionChangeEvent) => {
            const _db = (e.target as IDBOpenDBRequest).result;
            setDb(_db);
            objectStores.map(ost => {
                if (!_db.objectStoreNames.contains(ost)) {
                    _db.createObjectStore(ost, { keyPath: 'id' });
                }
            })

        };

        request.onsuccess = (e: Event) => {
            const _db = (e.target as IDBOpenDBRequest).result;
            setDb(_db);
            try {
                if (!_db.objectStoreNames.contains(storeName)) {
                    _db.createObjectStore(storeName, { keyPath: 'id' });
                }
            } catch (e) {

            }
        };

        request.onerror = (e: Event) => {
            console.error("IndexedDB error:", (e.target as IDBRequest).error);
        };

    }, [storeName]);

    const put = async (data: T) => {
        if (db) {
            return new Promise<T>((resolve, reject) => {
                const transaction = db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
                const request = store.put(data);

                request.onsuccess = () => resolve(data);
                request.onerror = () => reject(request.error);
                setDatas([...datas, data]);
            });
        }
        return Promise.reject({ error: "IndexedDB not initialized!" });
    };

    const get = async (id: string) => {
        if (db) {
            return new Promise<T | undefined>((resolve, reject) => {
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.get(id);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        return Promise.reject({ error: "IndexedDB not initialized!" });
    };

    const getAll = async () => {
        if (db) {
            return new Promise<T[]>((resolve, reject) => {
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        }
        return Promise.reject({ error: "IndexedDB not initialized!" });
    };

    const deleteById = async (id: string) => {
        if (db) {
            return new Promise<void>((resolve, reject) => {
                const transaction = db.transaction([storeName], "readwrite");
                const store = transaction.objectStore(storeName);
                const request = store.delete(id);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
        return Promise.reject({ error: "IndexedDB not initialized!" });
    };

    const putMany = async (params: T[]) => {
        if (db) {
            params.map(async data => await put(data));
            setDatas(params);
        }
        return Promise.reject({ error: "IndexedDB not initialized!" });
    }

    const selectAll = async (criteria: { key: string, value: any }[]) => {
        if (db) {
            return new Promise<T[]>((resolve, reject) => {
                const transaction = db.transaction([storeName], "readonly");
                const store = transaction.objectStore(storeName);

                let results: T[] = [];
                const request = store.getAll();
                request.onsuccess = ()=>{
                    results = request.result as T[];
                    criteria.map(cri => {
                        results = results.filter( (res: any) => res[cri.key] == cri.value );
                    })
                    resolve(results);
                }
                request.onerror = () => reject(request.error);
               

                // const index = criteria[0].key;
                // // store.getAll(IDBKeyRange.)
                
                // const request = store.index(index).getAll(IDBKeyRange.only(criteria[0].value));

                // request.onsuccess = () => {
                //     let results = request.result as T[];
                //     criteria.slice(1).forEach(({ key, value }) => {
                //         results = results.filter(item => (item as any)[key] === value);
                //     });
                //     resolve(results);
                // };
                // request.onerror = () => reject(request.error);
            });
        }
        return Promise.resolve([]);
    };

    const selectOne = async (criteria: { key: string, value: any }[]): Promise<T|undefined> => {
        if(db === undefined) return Promise.resolve(undefined);
        try {
            const results: T[] = await selectAll(criteria);
            //console.log("Result for : ", criteria, " -> ", results);
            if(results.length === 0) return Promise.resolve(undefined);
            return Promise.resolve(results[0]);
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve(undefined);
    };

    return {
        put,
        get,
        getAll,
        deleteById,
        datas,
        putMany,
        db,
        selectAll,
        selectOne
    };
};

export default useIndexedDB;