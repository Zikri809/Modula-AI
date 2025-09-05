import { NextRequest, NextResponse } from 'next/server';
import read_chat from '@/lib/supabase_helper/chat/read_chat';
import verifyJWT from '@/lib/jwt/verifyJWT';
import { JWTPayload } from 'jose';


export async function POST(request: NextRequest) {
    const api_token = request.cookies.get('api_token')?.value as string;
    const JWT_token_payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = JWT_token_payload;
    //get url query
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    console.log(chat_id, ' chat id presence in api')
    try {
        const array_result = await read_chat(chat_id ? "chat_id" : "uid", chat_id ?? uid as string);
        if (!array_result)
            return NextResponse.json(
                {
                    message: 'failed to read chat table based on uid',
                    cause: 'array_result is null',
                },
                { status: 500 }
            );
        return NextResponse.json(
            { message: 'success', response: array_result },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: 'fail to read user chats', error: String(error) },
            { status: 500 }
        );
    }
}
