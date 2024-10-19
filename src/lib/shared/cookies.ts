
export interface CookieResponse {
    name: string
    value: any
}
export interface CookieProvider {
    get(name: string): CookieResponse | undefined;
    set(name: string, value: any, exdays?: number): void;
    remove(name: string): void; 
    removeAll: ()=> void
}
function get(cname: string): CookieResponse | undefined {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return {
                name: cname,
                value: c.substring(name.length, c.length)
            }
        }
    }
    return undefined;
}

function set(cname: string, cvalue: any, exdays: number = 30) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}


function remove(cname: string) {
    document.cookie = cname + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function removeAll() {
    document.cookie.split(';').forEach(cookie => {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    });
}

const cookies: CookieProvider = {
    get,
    set,
    removeAll,
    remove
}
export default cookies;