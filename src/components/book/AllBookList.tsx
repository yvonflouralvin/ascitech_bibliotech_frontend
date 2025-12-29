'use client'
import useBook from '@/lib/hooks/useBook'
import React from 'react'
import BookWidget from './BookWidget';
import { Book } from '@/lib/hooks/useBook/type';

interface AllBookListProps {
    filtre: string
    selectedBook: Book|undefined
    setSelectedBook: (book: Book) => any
}
export default function AllBookList(props: AllBookListProps) {

    const { books } = useBook();
    return <div className='flex flex-wrap justify-center gap-[10px]'>
        {
            props.filtre === "" ?  books.map((book, index) => {
                return <BookWidget {...book} key={book.id} onClick={()=>props.setSelectedBook(book)} />
            }) :  books.filter(item => item.title.toLowerCase().includes(props.filtre.toLowerCase())).map((book, index) => {
                return <BookWidget {...book} key={book.id}  onClick={()=>props.setSelectedBook(book)} />
            })
        }
    </div>
}