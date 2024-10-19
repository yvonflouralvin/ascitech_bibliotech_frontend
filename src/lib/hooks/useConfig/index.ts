'use client'

import { useState } from "react"
import useIndexedDB from "../useIndexedDB"

export interface Config {
    id: string
    value: any
}
const useConfig = ()=>{
    // Fetch the configuration from the server 
    const {
        get,
        put,
        db
    } = useIndexedDB<Config>("configs");

    return {
        get,
        put,
        db
    }
}

export default useConfig;