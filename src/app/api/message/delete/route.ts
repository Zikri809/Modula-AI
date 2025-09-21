
import { NextRequest, NextResponse } from 'next/server';
import delete_message from '@/lib/supabase_helper/message/delete_message';
export async function DELETE(request: NextRequest) {
    //get chat_id from params
    const url = new URL(request.url);
    const message_id = url.searchParams.get('message_id');
    const chat_id = url.searchParams.get('chat_id');
    if (!message_id || !chat_id)
        return NextResponse.json(
            { message: 'please provide message_id and chat_id in the params' },
            { status: 400 }
        );

    try {

        const response = await delete_message(message_id,chat_id);
        if (response)
            return NextResponse.json(
                { message: 'successfully deleted', message_id: message_id, response: response },
                { status: 200 }
            );
        throw new Error('Failed to delete message');
    } catch (err) {
        return NextResponse.json(
            { message: 'error while deleting message', cause: String(err) },
            { status: 500 }
        );
    }
}
