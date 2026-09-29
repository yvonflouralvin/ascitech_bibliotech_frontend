export type BookFormat = 'pdf' | 'epub' | 'audiobook' | 'paper' | string;
export type PublishState = 'draft' | 'published' | 'archived' | string;

/**
 * Domaine thematique d'un livre. Plusieurs categories peuvent se cumuler :
 * un manuel de robotique pedagogique releve autant de la technologie que
 * des sciences.
 */
export interface BookCategory {
    id: number;
    name: string;
    slug: string;
    /** Rang d'affichage decide dans l'administration, plus fiable que l'alphabet. */
    order: number;
}

/** Metadonnees d'un livre, telles que renvoyees par `GET /apps/books/`. */
export interface Book {
    id: string;
    title: string;
    author: string | null;
    description: string | null;
    slug: string;
    publish_state: PublishState;
    publication_date: string | null;
    page: number;
    book_format: BookFormat;
    /**
     * URL publique du fichier source (EPUB). Renseignee uniquement pour les
     * livres distribues sous forme de fichier ; les livres pagines en images
     * n'en ont pas.
     */
    book_file_path?: string | null;
    /**
     * Domaines thematiques. Optionnel : les livres mis en cache avant
     * l'arrivee des categories n'ont pas le champ tant que le catalogue n'a
     * pas ete rafraichi.
     */
    categories?: BookCategory[];
    created_at: string;
    updated_at: string;
}

/** Un EPUB se lit depuis son fichier, pas depuis des images de pages. */
export const isEpub = (book: Pick<Book, 'book_format' | 'book_file_path'>): boolean =>
    book.book_format === 'epub' && Boolean(book.book_file_path);

/** Page d'un livre : une image encodee en base64. */
export interface BookPage {
    id: string;
    title: string;
    content: string;
    order: number;
    book: string;
    /** Type MIME de l'image ; les enregistrements anterieurs n'en ont pas. */
    mime?: string;
}

/**
 * Couverture d'un livre. `available: false` memorise qu'aucun fichier n'existe
 * cote serveur, ce qui evite de redemander la couverture a chaque affichage.
 */
export interface BookCover {
    id: string;
    book: string;
    title: string;
    available: boolean;
    content: string | null;
    mime: string | null;
}

/** Disponibilite reelle du contenu d'un livre sur le serveur. */
export interface BookAvailability {
    book: string;
    declared_pages: number;
    available_pages: number;
    has_content: boolean;
}

/** Tri d'affichage des categories : rang decide en administration, puis nom. */
export const compareCategories = (a: BookCategory, b: BookCategory): number =>
    a.order - b.order || a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' });
