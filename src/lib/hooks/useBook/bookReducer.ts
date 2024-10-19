import { createSlice } from "@reduxjs/toolkit";
import { Book, BookCategory } from "./type";

interface InitialState {
    books: Book[]
    categories: BookCategory[]
}

const initialState: InitialState = {
    books: [],
    categories: []
}

const slice = createSlice({
    name:"books",
    initialState,
    reducers: {
        setBooks: (state, action: { payload: Book[] }) => {
            state.books = action.payload
        },
        setCategories: (state, action: { payload: BookCategory[] }) => {
            state.categories = action.payload
        },
        addBook: (state, action: { payload: Book }) => {
            state.books.push(action.payload)
        },
        deleteBook: (state, action: { payload: string }) => {
            state.books = state.books.filter(book => book.id!== action.payload)
        }
    }
})

export default {
    reducer: slice.reducer,
    actions: slice.actions
}