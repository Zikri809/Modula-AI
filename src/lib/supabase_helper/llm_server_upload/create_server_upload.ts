import createClient from '@/utils/supabase/server';

export default async function (
    chat_id: string,
    file_object: any,
    expiration_time_hours: number,
    LLM_model: string
) {
    if (!file_object || !chat_id || !expiration_time_hours || !LLM_model)
        throw new Error('some params are missing');
    let rows = [];
    for (const file of file_object) {
        rows.push({
            expired_at: new Date(
                Date.now() + expiration_time_hours * 3600 * 1000
            ).toISOString(),
            file_part: file,
            chat_id: chat_id,
            LLM_model: LLM_model,
        });
    }
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('LLM_server_uploads')
            .insert(rows);
        if (error) throw error;
        return true;
    } catch (error) {
        console.error(error);
        throw error;
    }
}
