'use client';
import { AuthentificationTokens, LoginForm } from "@/lib/data/interfaces";
import functions from "./functions";
import cookies from "@/lib/shared/cookies";
import { useAppDispatch, useAppSelector } from "@/lib/shared/store"; 
import authentificationReducer from "./authentificationReducer";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";


interface UseAuthentificationProps {
    redirect: boolean
}
const useAuthentification = (props?: UseAuthentificationProps) => {

    const { 
        isAuthenticated,
        isAuthChecked
    } = useAppSelector(state => state.authentificationReducer);

    const router = useRouter();
    const pathname = usePathname();

    const dispatch = useAppDispatch();

    const login = async (arg: LoginForm): Promise<AuthentificationTokens> => {
        try {
            const result = await functions.login(arg);
            cookies.set("Authorization", result.access);
            cookies.set("Refresh", result.refresh);
            return Promise.resolve(result);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    const logout = async (callback?: () => any) => {
        try {
            location.href = "/logout"
            if (callback !== undefined) callback()
            return Promise.resolve(true);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    const checkAuthentification = () => {
        try {
            
            const cookiesAuth = cookies.get("Authorization");
            if (cookiesAuth && cookiesAuth.value) {

                dispatch(authentificationReducer.actions.setIsAuthenticated(true));
            } else {
                if (pathname !== "/login" && pathname !== "/logout") {
                    dispatch(authentificationReducer.actions.setIsAuthenticated(false));
                    router.push("/login");

                }
            }
            dispatch(authentificationReducer.actions.setIsAuthChecked(true));
        } catch (e) {

        }
    }

    useEffect(() => {
        checkAuthentification();
    }, []);

    return {
        login,
        logout,
        isAuthenticated,
        isAuthChecked
    }
}

export default useAuthentification;


