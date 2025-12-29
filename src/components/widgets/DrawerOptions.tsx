'use client'
import React, { useState } from 'react'
import {
    AlignLeftIcon,
    HeartIcon,
    PanelLeftCloseIcon
} from 'lucide-react'
import { useRouter } from 'next/navigation';
interface DrawerOptionsProps {

}
export default function DrawerOptions(props: DrawerOptionsProps) {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const router = useRouter()
    return <>
        <div className={`
            duration-300
        `}

        // style={{
        //         transform: `translateX(${isOpen === true ? "400" : "0"}px)`
        //     }}

        >
            <AlignLeftIcon className={`cursor-pointer ${isOpen === true ? "rotate-[90deg]" : "rotate-[0deg]"}`} onClick={() => setIsOpen(!isOpen)} />
        </div>
        {
            isOpen === true && <div className={`
            duration-300  fixed top-0 left-0 flex flex-col h-screen  overflow-y-scroll w-full max-w-[350px] bg-white shadow-lg
            p-[20px]
         `} >
                <div className='flex items-center w-full pb-[20px]'>
                    <img
                        alt="Logo Bibliotech"
                        src="/logo.png"
                        width={70}
                        height={70}
                    />
                    <div className='flex flex-1'>
                        <div className='flex flex-col flex-1'>
                            <p className='m-0'>Ascitech</p>
                            <p className='m-0 font-bold text-[20px]'>Bibliotech</p>
                        </div>
                        <div className='flex w-full justify-end p-[10px]'>
                            <PanelLeftCloseIcon onClick={() => setIsOpen(false)} size={20} className='cursor-pointer' />
                        </div>

                    </div>
                </div>
                <hr />
                <div className='pt-[20px]' >
                    <div className='flex items-center gap-[10px] bg-[rgba(0,0,0,0.07)] py-[5px] px-[20px] cursor-pointer rounded-lg' onClick={()=>router.push("/favorites")}>
                        <HeartIcon size={14}/>
                        <p className='m-0 text-[15px] font-bold'>Favoris</p>
                    </div>
                </div>
            </div>
        }

    </>
}