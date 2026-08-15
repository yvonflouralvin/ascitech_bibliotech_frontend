import api, { REFRESH_COOKIE } from "@/lib/network/api";
import cookies from "@/lib/shared/cookies";
import { AuthentificationTokens, LoginForm, UserProfile } from "@/lib/data/interfaces";

async function login(arg: LoginForm): Promise<AuthentificationTokens> {
    const result = await api(cookies).post(`/auth/`, arg);
    return result.data;
}

async function profile(): Promise<UserProfile> {
    const result = await api(cookies).get(`/users/me/`);
    return result.data;
}

/**
 * Revoque le refresh token cote serveur. L'echec n'est pas bloquant : la
 * deconnexion locale (purge des cookies) doit aboutir meme hors ligne.
 */
async function revokeSession(): Promise<void> {
    const refresh = cookies.get(REFRESH_COOKIE)?.value;
    if (!refresh) return;

    try {
        await api(cookies).post(`/users/logout/`, { refresh });
    } catch (e) {
        console.warn("Revocation du token impossible (session fermee localement).", e);
    }
}

const functions = { login, profile, revokeSession };

export default functions;
