'use client'
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import React from "react"

export default function BackButton() {
    const router = useRouter()
    const handleClick = () => {
        router.back()
    }
    return <ArrowLeft onClick={handleClick} size={20} className="cursor-pointer"/>
}