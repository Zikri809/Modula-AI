import { NextRequest, NextResponse } from 'next/server';
import createClient from '@/utils/supabase/server';
import verifyJWT from '@/lib/jwt/verifyJWT';
import { JWTPayload } from 'jose';
import read_chat from '@/lib/supabase_helper/chat/read_chat';

export async function GET(req: NextRequest) {
    //get the list of messages along with their cost
    const url = new URL(req.url);
    const offset = parseInt(url.searchParams.get('offset') ?? '0');
    const api_token = req.cookies.get('api_token')?.value;
    const JWT_token_payload = (await verifyJWT(
        api_token as string
    )) as JWTPayload;
    const { uid } = JWT_token_payload;
    try {
        const supabse = await createClient();

        const { data, error } = await supabse
            .from('messages')
            .select(
                'total_input_tokens,response_tokens,total_cost,llm_model, Chats!inner(uid,chat_title)'
            )
            .eq('Chats.uid', uid)
            .order('created_at', { ascending: false })
            .range(offset, offset + 49);
        if (error) throw error;
        //recieved an array of objects
        return NextResponse.json(data, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: JSON.parse(String(err)) },
            { status: 500 }
        );
    }
}
