'use client'
import api from '@/lib/network/api';
import cookies from '@/lib/shared/cookies';
import { useState, useEffect } from 'react';

type PaginatedResult = {
    total_pages: number
    count: number
    next: any
    previous: any
    results: any[]
}
type UsePaginatorProps = {
    path: string
}
const usePaginator = (props?: UsePaginatorProps) => {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalPage, setTotalPage] = useState<number>(1);
    const [datas, setDatas] = useState<any[]>([]);

    const loadDatas = async (page: number) => {
        try {
            setCurrentPage(page);
            var params = `page=${page}`
            if(props?.path.includes("?") === true)params = `&${params}`
            else params = `?${params}`;
            
            const response: PaginatedResult = (await api(cookies).get(`${props?.path}${params}`)).data;
            setDatas(response.results);
            setTotalPage(response.total_pages);
        } catch (e) {
            console.error(e)
        }
    }


    const prevPage = () => {
        if (currentPage > 1) {
            loadDatas(currentPage - 1);
        }
    }
    const nextPage = () => {
        if (currentPage < totalPage) {
            loadDatas(currentPage + 1);
        }
    }

    useEffect(() => {
        loadDatas(currentPage)
    }, [currentPage])


    return {
        setCurrentPage,
        currentPage,
        totalPage,
        datas,
        prevPage,
        nextPage,
        loadDatas
    }
}


export default usePaginator;