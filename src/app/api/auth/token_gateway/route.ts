import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/Firebase/firebase-admin/firebase_admin';
import signJWT from '@/lib/jwt/signJWT';

export async function POST(request: NextRequest) {
    //a request will come with the firebase token in the header of the request
    const auth_header = request.headers.get('Authorization');
    const firebase_token = auth_header?.split(' ')[1];
    if (!firebase_token) {
        return NextResponse.json(
            { error: 'firebase token are not present in the body header' },
            { status: 400 }
        );
    }
    try {
        const result = await auth.verifyIdToken(firebase_token);
        const uid = result.uid;
        const payload = {
            uid: uid,
            email: result.email,
            plan: 'free',
        };
        const jwt = await signJWT(payload);
        if (!jwt) {
            return NextResponse.json(
                { error: 'fail to generate the jwt token' },
                { status: 400 }
            );
        }

        let res = NextResponse.json(
            { message: 'success generating the token' },
            { status: 200 }
        );
        res.cookies.set('api_token', jwt, {
            secure: true,
            httpOnly: true,
            path: '/',
            maxAge: 3600,
            sameSite: 'strict',
        });
        return res;
    } catch (error) {
        return NextResponse.json(
            {
                error: 'error occured in function try block might be jwt or verify problem',
                cause: error,
            },
            { status: 400 }
        );
    }
}

//test localhost:3000/api/auth/token_gateway
