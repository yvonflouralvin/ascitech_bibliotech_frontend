import fixtures from "@/lib/data/fixtures";
import { Book } from "./type";
import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";


async function loadBooks(): Promise<Book[]> {
    try {
        const books = (await api(cookies).get(`/ascitech_bibliotech/books/all-books/`)).data;
        return Promise.resolve(books)
    } catch (e) {
        console.error('Error loading books:', e);
        return Promise.resolve([]);
    }
}

export default {
    loadBooks
}