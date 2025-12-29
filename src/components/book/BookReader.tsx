'use client'
import { Book } from '@/lib/hooks/useBook/type'
import React, { useEffect } from 'react'

interface BookReaderProps extends Book {

}
export default function BookReader(props: BookReaderProps){
    useEffect(()=>{
        console.log("Height", window.innerHeight);
        window.addEventListener("scroll", ()=>{

        });
    },[]);
    return <div>

    </div>
}