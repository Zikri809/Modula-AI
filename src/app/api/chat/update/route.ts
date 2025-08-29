import { NextRequest, NextResponse } from 'next/server';
import verifyJWT from '@/lib/jwt/verifyJWT';
import { JWTPayload } from 'jose';
import updateChat from '@/lib/supabase_helper/chat/update_chat';

export async function PATCH(request: NextRequest) {
    const api_token = request.cookies.get('api_token')?.value as string;
    const JWT_token_payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = JWT_token_payload;

    //get the params for the chat_id
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    const chat_title = url.searchParams.get('chat_title');
    if (!chat_id)
        return NextResponse.json({ error: 'no chat_id' }, { status: 400 });
    if (!chat_title)
        return NextResponse.json({ error: 'no chat_title' }, { status: 400 });

    try {
        const result_db = await updateChat(chat_id, chat_title);
        if (!result_db)
            return NextResponse.json(
                { message: 'error updating chat' },
                { status: 500 }
            );
        return NextResponse.json(
            { message: 'successfully updated' },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json({
            message: 'error updating the chat title ',
            affected: chat_id,
            error: String(error),
        });
    }
}
