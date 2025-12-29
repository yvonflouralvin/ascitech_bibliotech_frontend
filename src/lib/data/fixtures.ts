import { Book, BookCategory } from "../hooks/useBook/type";


const booksCategories: BookCategory[] = [
    { id: `bc-1`, label: "Science", description: "Tout ce qui concerne la science" },
    { id: `bc-2`, label: "Mathematique", description: "Tout ce qui concerne les mathematiques" },
    { id: `bc-3`, label: "Chimies", description: "Tout ce qui concerne la chimie" },
    { id: `bc-4`, label: "Bandes Dessinées", description: "Tout ce qui concerne les bandes dessinées" },
    { id: `bc-5`, label: "Romans", description: "Tout ce qui concerne les romans" },
    { id: `bc-6`, label: "Histoire", description: "Tout ce qui concerne l'histoire" },
    { id: `bc-7`, label: "Géographie", description: "Tout ce qui concerne la géographie" },
]
 


export default {
    booksCategories, 
}