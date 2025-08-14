import {NextRequest, NextResponse} from "next/server";
import verifyJWT from "./lib/jwt/verifyJWT";


export default async function middleware(request: NextRequest) {
    //auth layer - to check for permission to access the backend
    if (request.nextUrl.pathname === '/api/auth/token_gateway') return NextResponse.next();
    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({error: 'No token present in the request'}, {status: 400})
    const JWT_token_payload = await verifyJWT(api_token)
    if (!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'}, {status: 400})

    //if the token is valid we proceed
    return NextResponse.next()
}
export const config = {
    matcher: [
        '/api/:path*',
    ],
}