import createClient from "@/utils/supabase/server";

//this function only read the file name, file size the message id it belongs to show on
//to show on the front end
export default async  function (chat_id:string){
    if(!chat_id) throw new Error("chat_id is missing");
    const supabase = await createClient()
    try{
        const {data, error} = await supabase.from('file_meta_data')
            .select('file_name, file_size, message_id').eq('chat_id',chat_id)
        if(error) throw error;
        return data
    }catch(err){
        console.log(err)
        throw err;
    }
}