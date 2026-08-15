import api from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";

import { Book } from "./type";

/** Catalogue accessible a l'utilisateur connecte. */
async function loadBooks(): Promise<Book[]> {
    const response = await api(cookies).get(`/books/`);
    const payload = response.data;

    // L'API peut renvoyer une liste simple ou une reponse paginee.
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.results)) return payload.results;
    return [];
}

const functions = { loadBooks };

export default functions;
