'use client' 
import { useEffect } from "react"
import functions from "./functions"
import bookReducer from "../useBook/bookReducer"
import { useAppDispatch, useAppSelector } from "@/lib/shared/store"


const useBookCategory = () => {

    const dispatch = useAppDispatch();
    const {
        categories
    } = useAppSelector(state => state.bookReducer)

    useEffect(() => {
        functions.loadBooksCategories()
        .then(result => {
            dispatch(bookReducer.actions.setCategories(result));
        })
    }, [])


    return {
        categories
    }
}

export default useBookCategory;