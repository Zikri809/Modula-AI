import verifyJWT from '@/lib/jwt/verifyJWT';
import { NextRequest, NextResponse } from 'next/server';
import read_user from '@/lib/supabase_helper/user/read_user';
import { JWTPayload } from 'jose';

export async function POST(request: NextRequest) {
    //we verify the request by the cookies
    //NOTE: if a rquest to this endpoint is made from another api makesure to pass the cookies along
    const api_token: string = request.cookies.get('api_token')?.value as string;
    const payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = payload as JWTPayload;

    //find in the db
    try {
        const data = await read_user(uid as string);
        if (!data) return NextResponse.json({ error: 'User not found' });

        return NextResponse.json({ response: data }, { status: 200 });
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { error: 'problem when connecting to the db ', cause: String(err) },
            { status: 500 }
        );
    }
}

/*
test GET localhost:3000/api/user/find
*/
