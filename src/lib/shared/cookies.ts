export interface CookieResponse {
    name: string;
    value: string;
}

export interface CookieProvider {
    get(name: string): CookieResponse | undefined;
    set(name: string, value: string, exdays?: number): void;
    remove(name: string): void;
    removeAll: () => void;
}

const isBrowser = () => typeof document !== "undefined";

function get(cname: string): CookieResponse | undefined {
    if (!isBrowser()) return undefined;

    const prefix = `${cname}=`;
    const parts = document.cookie.split(";");

    for (const part of parts) {
        const entry = part.trimStart();
        if (entry.startsWith(prefix)) {
            return {
                name: cname,
                value: decodeURIComponent(entry.substring(prefix.length)),
            };
        }
    }
    return undefined;
}

function set(cname: string, cvalue: string, exdays: number = 30) {
    if (!isBrowser()) return;

    const expires = new Date(Date.now() + exdays * 24 * 60 * 60 * 1000).toUTCString();
    // SameSite=Lax limite l'envoi du cookie aux requetes cross-site ;
    // Secure est ajoute des que la page est servie en HTTPS.
    const secure = window.location.protocol === "https:" ? ";Secure" : "";
    document.cookie = `${cname}=${encodeURIComponent(cvalue)};expires=${expires};path=/;SameSite=Lax${secure}`;
}

function remove(cname: string) {
    if (!isBrowser()) return;
    document.cookie = `${cname}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

function removeAll() {
    if (!isBrowser()) return;

    document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = (eqPos > -1 ? cookie.substring(0, eqPos) : cookie).trim();
        if (name) remove(name);
    });
}

const cookies: CookieProvider = { get, set, remove, removeAll };

export default cookies;
