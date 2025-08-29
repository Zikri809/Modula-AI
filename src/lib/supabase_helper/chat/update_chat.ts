import createClient from '@/utils/supabase/server';
import * as z from 'zod';
import { NextResponse } from 'next/server';
import { cause } from 'effect/Effect';

export default async function updateChat(chatId: string, chat_title: string) {
    if (!chatId)
        throw new Error('missing chat_id', { cause: 'missing_chat_title' });
    if (!chat_title)
        throw new Error('missing chat_title', { cause: 'missing_chat_title' });

    const supabase = await createClient();
    //update the field
    try {
        const result_db = await supabase
            .from('Chats')
            .update({ chat_title: chat_title, modified_at: new Date() })
            .eq('chat_id', chatId)
            .select('chat_title');

        if (result_db.data?.[0].chat_title === chat_title) return true;
    } catch (error) {
        console.error(error);
        throw new Error('', { cause: error });
    }
}
