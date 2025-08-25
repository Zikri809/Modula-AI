import createClient from "@/utils/supabase/server";
import download_from_storage from "@/Firebase/Utilities/download_from_storage";
import { GoogleGenAI, Part} from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({apiKey: GEMINI_API_KEY});

//this is only to be used by gemini
export default async function (chat_id:string, llm_model:string){
    try{
        //get the uri for gemini use
        const supabse = await  createClient()
        const {data, error} = await supabse.from('file_meta_data')
            .select('storage_ref,gemini_uri_part, gemini_expiration_time,file_id').eq('chat_id',chat_id)
        if(error) throw error;
        let assembled_uri:Part[] = []
        for(const element of data){
            //if expired we reupload it
            if( Date.now() > new Date(element.gemini_expiration_time).getTime()) {
                //do the reading from db to get the storage ref then upload it
                //to the gemini get the uri update in db then
                //push to assembled uri then continue with the next one
                const downloaded_blob = await download_from_storage(element.storage_ref)
                const file_upload = await gemini.files.upload({
                    file: downloaded_blob,
                })
                const file_part = {
                    fileData: {
                        mimeType: file_upload?.mimeType,
                        fileUri: file_upload?.uri
                    }}
                assembled_uri.push(file_part)
                const {error } = await supabse.from('file_meta_data')
                    .update({gemini_uri_part:file_part, gemini_expiration_time: new Date(Date.now()+48*3600*1000).toISOString()})
                    .eq('file_id',element.file_id)
                if(error) throw error;
                continue
            }
            assembled_uri.push(element.gemini_uri_part);
        }
        console.log(assembled_uri)
        return assembled_uri;

    }catch(error){
        //console.error(error);
        throw error;
    }
}