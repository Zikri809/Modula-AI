import createClient from "@/utils/supabase/server";

export default async function (chat_id: string, file_object:any , expiration_time_hours:number, LLM_model:string) {
    if(!file_object || !chat_id || !expiration_time_hours || !LLM_model) throw new Error("some params are missing");

    const supabase = await createClient()
    try{
        const {data, error} = await supabase.from('LLM_server_uploads')
            .insert([{
                created_at: Date.now(),
                expired_at: Date.now() + expiration_time_hours*3600*1000,
                file_part: file_object,
                chat_id: chat_id,
                LLM_model: LLM_model
            }])
        if(error) throw error;
        return true
    }catch(error){
        throw error;
    }
}