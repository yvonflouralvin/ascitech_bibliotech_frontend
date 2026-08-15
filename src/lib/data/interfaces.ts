export interface AuthentificationTokens {
    access: string;
    refresh: string;
}

export interface UserProfile {
    id: number;
    email: string;
    username: string;
    full_name: string | null;
}

export interface Event {
    eventId: string;
    payload: any;
    uuid: string;
}

export interface LoginForm {
    email: string;
    password: string;
}
