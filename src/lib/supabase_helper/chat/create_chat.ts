import createClient from '@/utils/supabase/server';

export default async function create_chat(uid: string) {
    const supabase = await createClient();
    //create chat
    try {
        const db_result = await supabase
            .from('Chats')
            .insert([{ uid: uid }])
            .select('chat_id')
            .single();
        return db_result;
    } catch (error) {
        console.log('error creating chat', error);
        return null;
    }
}
