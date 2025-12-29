'use client'
import useBook from '@/lib/hooks/useBook'
import React from 'react' 
import BookWidget from './BookWidget'

interface RecentlyAddedBookListProps{
    className?: string
}
export default function RecentlyAddedBookList(props: RecentlyAddedBookListProps) {
    const { books } = useBook()
    return <div className={`
        flex w-full overflow-y-scroll gap-[10px]
        ${props.className}
    `}>
        {/* {
            books.map((book, index) => {
                return <BookWidget key={book.id} {...book} index={index} />
            })
        } */}
    </div>
}