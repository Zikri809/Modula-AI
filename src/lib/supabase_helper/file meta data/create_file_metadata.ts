import createClient from "@/utils/supabase/server";
import * as z from "zod"

const params_schema = z.object({
    file_name: z.string(),
    file_size: z.number().nonnegative(),
    extracted_text: z.string().optional(),
    confidence_level: z.number().nonnegative().min(0,'value of the confidence level must be >= 0').optional(),
    storage_ref: z.string().optional(),
})
//message_id in the db is in int8 but since it's big the db will send in string, and we can send back in string
export default async function (chat_id:string, message_id:string, insert_params: typeof params_schema) {
    if(!chat_id || !message_id) throw  new Error('chat_id and message_id must be provided must be provided');
    const parsed = params_schema.strict().safeParse(insert_params);
    const {data, error, success} = parsed
    if(!success) throw error
    const supabase = await createClient()
    try{
        const {error} = await supabase.from('file_meta_data')
            .insert([{...data,chat_id: chat_id, message_id:message_id, created_at: Date.now()}])
        if(error) throw error;
        return true
    }catch(err){
        console.log(err)
        throw err;
    }

}