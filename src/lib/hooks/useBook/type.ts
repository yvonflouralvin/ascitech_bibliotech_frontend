
export class Book {
    id!: string
    title!: string
    description!: string
    categories!: string []
    slug!: string
    page!: number
    book_format!: "pdf" | "epub"
}

export interface BookPage {
    id: string
    title: string
    content: string
    order: number
    book: string
}

export interface BookCategory {
    id: string
    label: string
    description?: string
}