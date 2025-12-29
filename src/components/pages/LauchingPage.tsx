"use client"
import React, { useState } from 'react';

import BookCategoriesWidget from '../book-category/BookCategoriesWidget';
import SearchBar from '../search-bar/SearchBar';
import AllBookList from '../book/AllBookList';
import DrawerOptions from '../widgets/DrawerOptions';
import { Book } from '@/lib/hooks/useBook/type';
import useBookPage from '@/lib/hooks/useBookPage';
import BookPageLayout from './BookPage';
export default function LauchingPage() {

    const [searchKeyWord, setSearchKeyWord] = useState<string>("");
    const [selectedBook, setSelectedBook] = useState<Book | undefined>(undefined);

    const {
        getPage,
        db: dbBookPage,
        countDownloadedPages
    } = useBookPage();


    return <>
        <div className="h-screen w-screen flex">
            <div className='h-full w-full flex flex-col flex-1'>
                <div className='p-[20px] flex items-center gap-[10px]'>
                    <DrawerOptions />
                    <SearchBar
                        searchKeyWord={searchKeyWord}
                        setSearchKeyWord={setSearchKeyWord}
                    />
                </div>

                <div className='flex-1 overflow-y-scroll'>
                    <BookCategoriesWidget />
                    <div className='px-[20px] mt-[5px]'>
                        <p className='font-bold text-[20px]'>Tous les livres</p>
                    </div>
                    <AllBookList filtre={searchKeyWord} selectedBook={selectedBook} setSelectedBook={setSelectedBook} />
                </div>
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