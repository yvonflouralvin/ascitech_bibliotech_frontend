'use client'
import { Book, BookPage } from '@/lib/hooks/useBook/type'
import useConfig from '@/lib/hooks/useConfig'
import api from '@/lib/network/api'
import cookies from '@/lib/shared/cookies'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import useBookPage from '@/lib/hooks/useBookPage'; 
interface BookWidgetProps extends Book {
    index?: number
    onClick?: (event?: any) => void
}
export default function BookWidget(props: BookWidgetProps) {

    const {
        get: getConfig,
        put: putConfig
    } = useConfig();
    const router = useRouter();
    const {
        getPage,
        db
    } = useBookPage();

    

    const handleClick = async () => {
        if(props.onClick !== undefined) {
            props.onClick();
            return;
        }
        localStorage.setItem("book-to-show", props.id)
        //await putConfig({id:"book-to-show", value: props.id});
        router.push(`/book/`);
    }

    const [cover, setCover] = useState<string>('https://via.placeholder.com/200x200');

    const handleLoadCover = async ()=>{
        try{
            const page: BookPage|undefined = await getPage(props.id, 1);
            if(page === undefined) return;
            setCover(`data:image/jpg;base64,${page.content}`);
        }catch(e){
            console.error(e);
            setCover('https://via.placeholder.com/200x200'); // default cover image
        }
    }

    useEffect(()=>{
        if(db)handleLoadCover();
    },[db]);

    return <div
        onClick={handleClick}
        className={`
            duration-300 overflow-hidden
            w-[170px] sm:w-[200px] sm:min-w-[200px] h-[260px] rounded shadow my-[10px] cursor-pointer
            hover:shadow-2xl
        `}>
        <div className='w-full h-[260px] flex flex-col'>
            <img src={`${cover}`} className='object-cover w-full h-[200px]' />
            {/* <div className={`object-cover w-[200px] h-[200px] min-w-[200px] min-h-[200px] bg-url('data:image/jpg;base64,${cover}')`}> */}
            {/* </div> */}
            <div className='p-[10px]'>
                <p className='text-[13px] line-clamp-2'>{props.title}</p>
            </div>
        </div>
    </div>
}