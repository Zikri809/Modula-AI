import createClient from '@/utils/supabase/server'

export default async function delete_chat(chat_id:string, uid:string) {
    if(!chat_id) throw new  Error('no chat id is given')
    if(!uid) throw new  Error('no uid is given')
    const supabse = await createClient()

    try{
        const db_result = await supabse.from('Chats').delete()
            .eq('chat_id', chat_id)
            .eq('uid',uid)
        if(db_result.error) throw new  Error('failed to delete chat', {cause:db_result.error})
        return true
    }
    catch(err){
        throw err
    }
}