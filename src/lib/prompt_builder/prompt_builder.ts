import createClient from "@/utils/supabase/server";

export default async function prompt_builder(chat_id:string , uid:string) {
    if (!chat_id || !uid) throw new Error("No chat_id or uid, please provide adequent data");
    const supabse = await createClient()
    try{
        const {data:message_data, error:message_error} = await supabse.from('messages')
            .select('user_prompt,llm_response,context_prompt_tokens,response_tokens').eq('chat_id', chat_id).order('created_at',{ascending:true}).limit(8)
        if(message_error) throw message_error;
        //read user details for memory
        const {data:user_data, error:user_error} = await supabse.from('users').select('user_details').eq('uid',uid).single()
        if(user_error) throw user_error;
        //constructing context from previous convo based on 3000 token limit
        if( !message_data ) return {
            past_conv_arr: [],
            user_data:''+JSON.stringify(user_data.user_details)
        }
        //the last one is the latest
        let sum_tokens = 0
        let previous_convo = []
        for(const {user_prompt,llm_response,context_prompt_tokens,response_tokens} of message_data){
            sum_tokens +=context_prompt_tokens
            if(sum_tokens <=3000){
               previous_convo.push(`<convo> user: ${user_prompt} || llm_response: ${llm_response} </convo>`)
            }
        }
        return{
            past_conv_arr: previous_convo,
            user_data:''+JSON.stringify(user_data.user_details),
        }


    }
    catch(err){
        throw err;
    }

}