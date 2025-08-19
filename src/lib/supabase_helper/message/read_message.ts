import createClient from '@/utils/supabase/server'

export default async function read_message (chat_id:string){
    if(!chat_id ) throw new Error('chat_id and uid must be provided together',)
    const supabse = await createClient()

    try{
        const db = await supabse.from('messages')
            .select('message_id,created_at,user_prompt,prompt_tokens,response_tokens,llm_response,llm_model')
            .eq('chat_id', chat_id)
            .order('created_at',{ascending:false})
        if(!db.data) throw new Error(`no such chat / no data provided ${db.error.message} hint is ${db.error.hint}`)
        //return array of rows
        return db.data
    }
    catch(err){
        throw err
    }


}