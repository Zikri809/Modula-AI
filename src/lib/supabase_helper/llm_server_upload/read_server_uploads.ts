import createClient from "@/utils/supabase/server";
//remember to parse the date string into a date object for expired at for easy checking
export default async function (chat_id: string, llm_model:string) {
    if(!chat_id || ! llm_model) throw  new Error("Missing params required");
    const supabase = await createClient()
    try{
        const {data, error} = await supabase.from('LLM_server_uploads')
            .select('expired_at, file_part').eq('chat_id', chat_id)
            .eq('LLM_model', llm_model)
        if(error) throw error
        return data
    }catch(error){
        throw error;
    }
}