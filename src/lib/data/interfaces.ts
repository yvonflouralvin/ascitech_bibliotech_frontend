




export interface AuthentificationTokens {
    access: string
    refresh: string
}


export interface Event { 
    eventId: string, 
    payload: any, 
    uuid: string 
}

export interface LoginForm { 
    email: string
    password: string 
}