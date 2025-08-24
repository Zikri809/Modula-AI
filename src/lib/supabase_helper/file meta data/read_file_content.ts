import createClient from "@/utils/supabase/server";

export default async function (chat_id: string) {
    if(!chat_id) throw new Error("chat_id is not present in the params");
    try{
        const supabase= await createClient()
        const {data, error} = await supabase.from('file_meta_data')
            .select('file_name,extracted_text, confidence_level, storge_ref').eq('chat_id',chat_id)
        if(error) throw error;
        //data is in array of object/ rows
        return data
    }catch (error){
        throw error;
    }
}