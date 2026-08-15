'use client';

import { useCallback, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { AuthentificationTokens, LoginForm } from "@/lib/data/interfaces";
import cookies from "@/lib/shared/cookies";
import { ACCESS_COOKIE, REFRESH_COOKIE } from "@/lib/network/api";
import { useAppDispatch, useAppSelector } from "@/lib/shared/store";

import authentificationReducer from "./authentificationReducer";
import functions from "./functions";

/** Routes accessibles sans session valide. */
const PUBLIC_PATHS = ["/login", "/logout"];

interface UseAuthentificationProps {
    /** false pour ne pas rediriger automatiquement vers /login. */
    redirect?: boolean;
}

const useAuthentification = (props?: UseAuthentificationProps) => {
    const { isAuthenticated, isAuthChecked } = useAppSelector(
        (state) => state.authentificationReducer,
    );

    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const shouldRedirect = props?.redirect !== false;

    const login = useCallback(async (arg: LoginForm): Promise<AuthentificationTokens> => {
        const result = await functions.login(arg);
        cookies.set(ACCESS_COOKIE, result.access);
        cookies.set(REFRESH_COOKIE, result.refresh);
        dispatch(authentificationReducer.actions.setIsAuthenticated(true));
        return result;
    }, [dispatch]);

    /**
     * Ferme la session : revocation du refresh token cote serveur puis purge
     * locale des cookies. Les livres telecharges dans IndexedDB sont conserves.
     */
    const logout = useCallback(async (callback?: () => void) => {
        await functions.revokeSession();

        cookies.remove(ACCESS_COOKIE);
        cookies.remove(REFRESH_COOKIE);
        dispatch(authentificationReducer.actions.setIsAuthenticated(false));
        dispatch(authentificationReducer.actions.delTokens());

        callback?.();
    }, [dispatch]);

    const checkAuthentification = useCallback(() => {
        const hasSession = Boolean(cookies.get(ACCESS_COOKIE)?.value);
        const isPublic = PUBLIC_PATHS.includes(pathname);

        dispatch(authentificationReducer.actions.setIsAuthenticated(hasSession));
        dispatch(authentificationReducer.actions.setIsAuthChecked(true));

        if (!hasSession && !isPublic && shouldRedirect) {
            router.push("/login");
        }
    }, [dispatch, pathname, router, shouldRedirect]);

    useEffect(() => {
        checkAuthentification();
    }, [checkAuthentification]);

    return { login, logout, isAuthenticated, isAuthChecked };
};

export default useAuthentification;
