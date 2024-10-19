'use client'

import api from "@/lib/network/api";
import { BookPage } from "../useBook/type";
import useIndexedDB from "../useIndexedDB"
import cookies from "@/lib/shared/cookies";

interface StoredBookPage {

}

const useBookPage = ()=>{
    const {
        put, 
        get,
        selectOne,
        db,
        selectAll
    } = useIndexedDB<BookPage>("bookpages");

    const storePage = async (bookPage: BookPage)=>{
        try{
            await put(bookPage);
            return Promise.resolve(true);
        }catch(e){
            console.error(e);
            return Promise.reject(false);
        }
    }

    const getPage = async (bookId: string, pageId: number): Promise<BookPage|undefined>=>{
        try{
            const storedPage = await selectOne([
                {key:"book", value: bookId},
                {key:"order", value: pageId}
            ])
            if(storedPage !== undefined)return Promise.resolve(storedPage);
            console.log("Page for : ", bookId, " / ", pageId, "not found");
            const load_online: BookPage = (await api(cookies).get(`/ascitech_bibliotech/books/${bookId}/page/${pageId}/`)).data;
            if(db)await storePage(load_online); // store the fetched page in IndexedDB for offline usage
            return Promise.resolve(load_online);
        }catch(e){
            console.error(e);
            return Promise.resolve(undefined);
        }
    }

    const countDownloadedPages = async (id:string): Promise<number>=>{
        if(db === undefined) return Promise.resolve(0);
        try{
            const bookPages: BookPage[] = await selectAll([
                {key:"book", value:id}
            ])
            return Promise.resolve(bookPages.length);
        }catch(e){
            console.error(e);
            
        }
        return Promise.resolve(0);
    }

    return {
        getPage, 
        storePage,
        db,
        countDownloadedPages
    }
}

export default useBookPage;