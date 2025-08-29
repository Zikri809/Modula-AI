import { NextRequest, NextResponse } from 'next/server';
import prompt_builder from '@/lib/prompt_builder/prompt_builder';
import verifyJWT from '@/lib/jwt/verifyJWT';
import { JWTPayload } from 'jose';

export async function POST(request: NextRequest) {
    const api_token = request.cookies.get('api_token')?.value as string;
    const JWT_token_payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = JWT_token_payload;

    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    if (!chat_id)
        return NextResponse.json(
            { message: 'please provide chat_id in request params' },
            { status: 400 }
        );

    try {
        const prompt = await prompt_builder(chat_id, uid as string);
        return NextResponse.json({ response: prompt }, { status: 200 });
    } catch (err) {
        return NextResponse.json(
            { message: 'testing error ', cause: String(err) },
            { status: 500 }
        );
    }
}
