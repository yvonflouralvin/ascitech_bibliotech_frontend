import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import cookies, { CookieProvider } from "../shared/cookies";

export const ACCESS_COOKIE = "Authorization";
export const REFRESH_COOKIE = "Refresh";

/** Base de l'API, sans le suffixe `/apps` ajoute par l'instance axios. */
export const API_ROOT = process.env.NEXT_PUBLIC_BACKEND_BASE_URL ?? "";

type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean };

/**
 * Un seul rafraichissement de token a la fois : si plusieurs requetes echouent
 * en 401 simultanement (typique du chargement de la grille de couvertures),
 * elles attendent toutes le meme appel plutot que d'en declencher un par page.
 */
let refreshInFlight: Promise<string> | null = null;

/** Routes d'authentification, exclues du rejeu automatique apres refresh. */
const isAuthEndpoint = (url?: string) => {
    if (!url) return false;
    return url.includes("/auth/") || url.includes("/users/logout/");
};

const redirectToLogin = () => {
    if (typeof window === "undefined") return;
    if (window.location.pathname.startsWith("/login")) return;
    window.location.href = "/login";
};

const refreshAccess = async (store: CookieProvider): Promise<string> => {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
        const refresh = store.get(REFRESH_COOKIE)?.value;
        if (!refresh) throw new Error("Aucun refresh token disponible.");

        const result = await axios.post(`${API_ROOT}/apps/auth/token/refresh/`, { refresh });
        const access: string = result.data.access;
        store.set(ACCESS_COOKIE, access);
        return access;
    })();

    try {
        return await refreshInFlight;
    } finally {
        refreshInFlight = null;
    }
};

const api = (store: CookieProvider = cookies): AxiosInstance => {
    const instance = axios.create({ baseURL: `${API_ROOT}/apps` });

    instance.interceptors.request.use(
        (config) => {
            const access = store.get(ACCESS_COOKIE);
            if (access?.value) {
                config.headers.Authorization = `Bearer ${access.value}`;
            }
            return config;
        },
        (error) => Promise.reject(error),
    );

    instance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const config = error.config as RetriableConfig | undefined;
            const status = error.response?.status;

            // Une seule tentative de rejeu par requete, sinon un refresh qui
            // renvoie systematiquement 401 boucle indefiniment.
            if (status !== 401 || !config || config._retried) {
                return Promise.reject(error);
            }

            // Les routes d'authentification ne sont jamais rejouees : un 401 y
            // signifie « identifiants invalides », pas « session expiree ».
            // Sans cette exclusion, l'appelant recevrait l'erreur du refresh a
            // la place du 401 d'origine et ne pourrait plus l'interpreter.
            if (isAuthEndpoint(config.url)) {
                return Promise.reject(error);
            }

            config._retried = true;

            try {
                const access = await refreshAccess(store);
                config.headers.Authorization = `Bearer ${access}`;
                return await instance.request(config);
            } catch (refreshError) {
                // La session est definitivement perdue : on nettoie et on renvoie
                // l'utilisateur vers la page de connexion.
                store.remove(ACCESS_COOKIE);
                store.remove(REFRESH_COOKIE);
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        },
    );

    return instance;
};

export default api;
