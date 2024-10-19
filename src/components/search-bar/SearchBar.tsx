'use client'
import { SearchIcon } from 'lucide-react'
import React from 'react'

interface SearchBarProps {
    searchKeyWord: string
    setSearchKeyWord: (searchKeyword: string) => any
}
export default function SearchBar(props: SearchBarProps) {
    return <div className='w-full flex items-center bg-[rgba(0,0,0,0.05)] p-[10px] rounded'>
        {
            props.searchKeyWord.length > 0 && <div className='flex cursor-pointer items-center gap-[5px] text-[15px] font-bold mr-[10px] text-gray-500' onClick={()=>props.setSearchKeyWord("")}>
                <p>X</p> 
            </div>
        }
        <input placeholder='Recherche' className='border-0 outline-none flex-1 bg-transparent' value={props.searchKeyWord} onChange={(e)=>props.setSearchKeyWord(e.target.value)} />
        <SearchIcon size={15} className='cursor-pointer' />
    </div>
}