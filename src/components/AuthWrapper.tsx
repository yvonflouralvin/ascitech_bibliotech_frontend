'use client'
import useAuthentification from '@/lib/hooks/authentification';
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react';
interface AuthWrapperProps {
    children: React.ReactNode,
}
export default function AuthWrapper(props: AuthWrapperProps) {
    const pathname = usePathname();
    const {
        isAuthenticated,
        isAuthChecked
    } = useAuthentification({ redirect: true });
    useEffect(() => {
    }, [isAuthenticated,
        isAuthChecked])

    return <>{
        pathname === "/login" ? <>{props.children}</> : <>
            {
                isAuthenticated === true && isAuthChecked === true ? <>{props.children}</> : <></>
            }</>
    }
    </>;
}