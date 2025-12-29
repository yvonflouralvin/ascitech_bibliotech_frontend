
import { useEffect } from "react"
import functions from "./functions"
import bookReducer from "./bookReducer"
import { useAppDispatch, useAppSelector } from "@/lib/shared/store"
import useIndexedDB from "../useIndexedDB"
import { Book } from "./type"



const useBook = (initialized?: boolean) => {

    const {
       put,
       putMany,
       datas,
       db,
       get
    } = useIndexedDB<Book>("books");

    const loadBooks = async () => {
        try {
            const lastBooks = await functions.loadBooks(); 
            await putMany(lastBooks);
        } catch (e) {
            console.error(e);
        } 
    }

    const getBook = async (id:string) : Promise<Book|undefined> => {
        try{
            const book = await get(id);
            return Promise.resolve(book);
        }catch(e){  
            console.error(e);
            return Promise.resolve(undefined);
        }
    }

   
    useEffect(() => {
        if(db && initialized !== false)loadBooks();
    }, [db])

    

    return {
        books: datas,
        getBook,
        db
    }
}

export default useBook