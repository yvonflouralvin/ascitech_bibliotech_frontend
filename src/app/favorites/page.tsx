'use client'
import FavoritesBookList from '@/components/book/FavoritesBookList';
import BookPageLayout from '@/components/pages/BookPage';
import BackButton from '@/components/widgets/BackButton';
import { Book } from '@/lib/hooks/useBook/type';
import useBookPage from '@/lib/hooks/useBookPage';
import React, { useState } from 'react';


export default function Page() {
    const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);
    const {
        getPage,
        db: dbBookPage,
        countDownloadedPages
    } = useBookPage();
    
    return <>
        <div className='flex flex-col h-screen w-screen'>
            <div className='flex items-center gap-[10px] p-[20px]'>
                <BackButton />
                <p className='text-[14px]'>Livres Favoris</p>
            </div>
            <div className='flex-1 overflow-y-scroll p-[20px]'>
                <FavoritesBookList selectedBook={selectedBook} setSelectedBook={setSelectedBook}/>
            </div>
        </div>
        <div className={`
            duration-300
            h-full 
            w-screen
            backdrop-none
            flex 
            flex-col
            fixed 
            left-0
            items-center
            justify-center
            ${
                selectedBook !== undefined ? `
                    backdrop-blur
                    top-0
                `: `
                    -top-[100%]
                `
            }
        `}>
            {
                selectedBook !== undefined && <div className='max-w-[700px] w-full bg-white h-full overflow-y-scroll shadow-xl'>
                    <BookPageLayout
                        countDownloadedPages={countDownloadedPages}
                        dbBookPage={dbBookPage}
                        getPage={getPage}
                        book={selectedBook}
                        onClose={() => setSelectedBook(undefined)}
                    />
                </div>
            }
        </div>
    </>
}