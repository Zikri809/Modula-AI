import createClient from '@/utils/supabase/server';
export default async function read_chat(type: 'chat_id' | 'uid', value: string){
    if (!type || !value) throw new Error('no chat id or uid provided');

    const supabse = await createClient();
    try {
        const db_result = await supabse
            .from('Chats')
            .select('chat_id, created_at,chat_title')
            .eq(type, value)
            .order('created_at', { ascending: false });
        //return array of objects each containing the row
        if (!db_result)
            throw new Error('failed to read chat table based on '+type);
        if (!db_result.data)
            throw new Error('failed to read chat table data based on '+type);

        return db_result.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
