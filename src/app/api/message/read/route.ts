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
        if (db)
            return NextResponse.json(
                {
                    message: 'user messages retrieved succesfully ',
                    response: db,
                },
                { status: 200 }
            );
        throw new Error('cannot retrieve user messages for this chat_id');
    } catch (err) {
        return NextResponse.json(
            { message: 'error occurred', cause: err },
            { status: 500 }
        );
    }
}
