import cookies from "@/lib/shared/cookies";
import api from "../../network/api" 
import { AuthentificationTokens, LoginForm } from "@/lib/data/interfaces";


async function login(arg: LoginForm): Promise<AuthentificationTokens> {
   
    try {
        const result: AuthentificationTokens = (await api(cookies).post(`/auth/`, arg)).data;
        
        return Promise.resolve(result)
    } catch (e) {
        return Promise.reject(e)
    }
}


export default {
    login
}