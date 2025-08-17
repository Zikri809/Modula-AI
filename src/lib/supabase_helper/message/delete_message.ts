import createClient from '@/utils/supabase/server'
export default async function delete_message(message_id:string){
    //even though in db its bigint which is a number it exceeds js max int
    //thus the db will send it in string and can pass it back in string
    //if we really need use Bigint()

    if(!message_id) throw new  Error('missing message_id in params')

    const supabase = await createClient()

    try{
        const db = await supabase.from('messages')
            .delete().eq('message_id', message_id)
        if(db.error) throw new  Error(`failed to delete message ${db.error.message} hint is ${db.error.hint}`, )
        return true
    }
    catch(err){
        throw err
    }
}