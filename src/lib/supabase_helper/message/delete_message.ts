import createClient from "@/utils/supabase/server";
import delete_from_storage from "@/Firebase/Utilities/delete_from_storage";


export default async function edit_past(message_id: string, chat_id: string) {
    const supabase = await createClient()
    //get the files contain by messages
    //prevent accidental edit during error triggering the delete all
    if(message_id==null) return []
    const {data:message_object, error} = await supabase
        .from('messages')
        .select(
            'file_meta_data (storage_ref)'
        )
        .gte('message_id', message_id).eq('chat_id', chat_id)
    if(error) throw error;
    //destructured
    const refs_to_delete:string[] = message_object.map((element) => {
        if(element.file_meta_data.length>0) return element.file_meta_data[0].storage_ref
    }).filter(Boolean);
    console.table(refs_to_delete)

    //delete messages
    const{error:delete_error} = await supabase.from('messages').delete().gte('message_id', message_id).eq('chat_id', chat_id)
    if(delete_error) throw delete_error;
    const failed_to_delete:string[] = []
    Promise.all(refs_to_delete.map((ref) => {
        delete_from_storage(ref).catch((e) =>{
            console.error(e)
            failed_to_delete.push(ref)
        });
    }))

    console.table(failed_to_delete)

    return refs_to_delete;
}