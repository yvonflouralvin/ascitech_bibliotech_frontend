'use client' 
import { store } from '@/lib/shared/store'
import { NextUIProvider } from '@nextui-org/react'
import React from 'react'
import { Provider } from 'react-redux'

interface AppProviders {
    children: React.ReactNode
}
export default function AppProviders(props: AppProviders) {
    return <NextUIProvider>
        <Provider store={store}>
            {props.children}
        </Provider>
    </NextUIProvider>
}