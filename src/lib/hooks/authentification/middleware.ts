import { NextRequest } from "next/server";

const authentificationMiddleware = (request: NextRequest) => {
    try {
        
        const authorization = request.cookies.get('Authorization');
        if(authorization === undefined){ 
            return undefined;
        }
        return authorization;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}



export default authentificationMiddleware;