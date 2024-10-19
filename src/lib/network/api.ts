import axios from "axios";
import { CookieProvider } from "../shared/cookies";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

const refreshAccess = async (cookies: CookieProvider|ReadonlyRequestCookies) => {
    
    try {
        const result = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/apps/auth/token/refresh/`, {
            refresh: cookies.get("Refresh")?.value
        });
        cookies.set("Authorization", result.data.access);
        return Promise.resolve(result.data.access);
    } catch (e: any) {
        if (e?.response?.status === 401) {  

            location.href = "/login"
            
        }
        return Promise.reject(e);
    }
}

 
const api = (cookies: CookieProvider|ReadonlyRequestCookies) => {
    const axios_instance = axios.create({
        baseURL: `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/apps`
    })

    axios_instance.interceptors.request.use(config => {
        const access_token = cookies.get('Authorization');
        if (access_token != null) {
            config.headers['Authorization'] = `Bearer ${access_token.value}`;
        }
        return config;
    }, error => {
        return error;
    })


    axios_instance.interceptors.response.use(result => {
        return result;
    }, async error => {
        if (error.response.status === 401) { 
            const access = await refreshAccess(cookies);
            const config = error.config;
            config.headers = {
                ...config.headers,
                'Authorization': `Bearer ${access}`
            }
            const result =  await axios.request(config);
            return Promise.resolve(result);
        }
        return error;
    });

    return axios_instance;
}


export default api;