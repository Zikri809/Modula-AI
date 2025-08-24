import read_server_uploads from "@/lib/supabase_helper/llm_server_upload/read_server_uploads";
import {File as File_2, GoogleGenAI, Part} from '@google/genai';

//this is only to be used by gemini
export default async function (chat_id:string, llm_model:string){
    try{
        //get the uri for gemini use
        const db_read = await read_server_uploads(chat_id, llm_model);
        let assembled_uri = []
        for(const element of db_read){
            //if expired we reupload it
            if( Date.now() > new Date(element.expired_at).getTime()) {
                //do the reading from db to get the storage ref then upload it
                //to the gemini get the uri update in db then
                //push to assembled uri then continue with the next one
                continue
            }
            assembled_uri.push(element.file_part);
        }
        return assembled_uri;

    }catch(error){
        //console.error(error);
        throw error;
    }
}