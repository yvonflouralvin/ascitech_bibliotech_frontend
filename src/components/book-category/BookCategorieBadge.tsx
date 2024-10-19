'use client'
import { BookCategory } from '@/lib/hooks/useBook/type'
import React from 'react'

interface BookCategorieBadgeProps {
    categorie: BookCategory
    index: number
}
export default function BookCategorieBadge(props: BookCategorieBadgeProps) {
    return <p className={`
        ${props.index === 0 ? "ml-[20px]" : ""}
        duration-300 bg-primary-foreground text-black flex text-nowrap items-center cursor-pointer text-[14px] py-[5px] px-[10px] rounded
        hover:bg-primary hover:text-white
        select-none
    `} key={props.categorie.id}>
        {props.categorie.label}
    </p>
}