export type BookFormat = 'pdf' | 'epub' | 'audiobook' | 'paper' | string;
export type PublishState = 'draft' | 'published' | 'archived' | string;

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
    created_at: string;
    updated_at: string;
}

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
