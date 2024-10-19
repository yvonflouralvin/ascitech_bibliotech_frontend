'use client' 
import React, { useEffect, useState } from 'react'
import BookWidget from './BookWidget';
import useFavori from '@/lib/hooks/useFavori';
import { Book } from '@/lib/hooks/useBook/type';
import { Spinner } from '@nextui-org/react';

interface FavoritesBookListProps {
    selectedBook: Book|undefined
    setSelectedBook: (book: Book) => any
}

export default function FavoritesBookList(
    props: FavoritesBookListProps
) {

    const [books, setBooks] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const {
        dbFavorite,
        getFavorites
    } = useFavori();

    useEffect(() => {
        if (dbFavorite !== undefined) {
            const exec = async () => {
                const favs = await getFavorites();
                setBooks(favs);
                setIsLoading(false)
            }
            exec();
        }
    }, [dbFavorite])


    return <div className='flex flex-wrap gap-[10px]'>
        {
            books.map((book, index) => {
                return <BookWidget {...book} key={book.id} onClick={()=>props.setSelectedBook(book)}/>
            })
        }
        {
            isLoading && <div className='flex flex-1 items-center justify-center gap-[10px] h-[100px]'>
                <Spinner />
                <p>Chargement...</p>
            </div>
        }
    </div>
}