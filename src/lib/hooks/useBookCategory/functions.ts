import fixtures from "@/lib/data/fixtures";
import { BookCategory } from "../useBook/type";



async function loadBooksCategories(): Promise<BookCategory[]> {
    try {
        const booksCategories = fixtures.booksCategories;
        return Promise.resolve(booksCategories);
    } catch (e) {
        console.error(e)
        return Promise.resolve([]);
    }
}


export default {
    loadBooksCategories
}