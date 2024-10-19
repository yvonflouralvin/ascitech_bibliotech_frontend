'use client'
import { BookCategory } from '@/lib/hooks/useBook/type';
import useBookCategory from '@/lib/hooks/useBookCategory';
import React from 'react';
import BookCategorieBadge from './BookCategorieBadge';

export default function BookCategoriesWidget() {
    const {
        categories
    } = useBookCategory();

    return <div className='flex items-center w-full overflow-x-scroll gap-[10px] overflow-y-hidden'>
        {
            categories.map((categorie: BookCategory, index: number) => {
                return <BookCategorieBadge key={categorie.id} categorie={categorie} index={index} />
            })
        }
    </div>
}