import createClient from '@/utils/supabase/server'

export default async function create_message(
    uid:string,
    chat_id:string,
    user_prompt: string,
    llm_response:string,
    text_prompt_tokens:number,
    file_input_tokens:number,
    response_tokens:number,
    total_cost :number,
    llm_model: string
    )  {
    if(!chat_id || !uid) throw new Error('chat_id and uid must be provided')

    const supabase = await createClient()

    try{
        const db = await supabase.from('messages')
            .insert([{ chat_id:chat_id, user_prompt:user_prompt, llm_response:llm_response ,text_prompt_tokens:text_prompt_tokens, file_input_tokens:file_input_tokens, response_tokens:response_tokens,total_tokens: (response_tokens + text_prompt_tokens + file_input_tokens), total_cost: total_cost, llm_model:llm_model}])
            .select('message_id').single()
        //console.log('db result is',db)
        if(db.error) throw new Error(`problem inserting message to db  ${db.error.message} hint is ${db.error.hint}`,)
        return db.data.message_id
    }
    catch(err){
        throw err
    }
}