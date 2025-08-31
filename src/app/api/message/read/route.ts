import { NextRequest, NextResponse } from 'next/server';
import read_message from '@/lib/supabase_helper/message/read_message';

export async function POST(request: NextRequest) {
    //get chat id from params
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    if (!chat_id)
        return NextResponse.json(
            { message: 'please provide chat_id in request params' },
            { status: 400 }
        );

    //message id even though in db its bigint which is a number it exceeds js max int
    //thus the db will send it in string and can pass it back in string
    //if we really need use Bigint()
    try {
        const db = await read_message(chat_id);
        if (db) {
            //format in form query and response
            let messages = []
            for (const row_message of db) {
                messages.push(
                    {role:'user', message:row_message.user_prompt , created_at: row_message.created_at},
                    {role: row_message.llm_model, message:row_message.llm_response, created_at: row_message.created_at}
                    );
            }

            return NextResponse.json(
                messages,
                {status: 200}
            );
        }
        throw new Error('cannot retrieve user messages for this chat_id');
    } catch (err) {
        console.log(err);
        return NextResponse.json(
            { message: 'error occurred', cause: err },
            { status: 500 }
        );
    }
}
