import createClient from "@/utils/supabase/server";
import download_from_storage from "@/Firebase/Utilities/download_from_storage";
import {ChatCompletionContentPart, ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";
import {Buffer} from "node:buffer";

//this is only to be used by openai
export default async function (chat_id:string, text_only:boolean){
    try{
        //get the uri for gemini use
        const supabse = await  createClient()
        const {data, error} = await supabse.from('file_meta_data')
            .select('storage_ref,file_name,extracted_text,confidence_level,file_id').eq('chat_id',chat_id)

        if(error) throw error;

        let retrieved_extracted_file:ChatCompletionMessageParam[] = []
        let lowest_confidence = 101 //max is 100
        let content:ChatCompletionContentPart[] = []
        for(const {file_name,storage_ref,extracted_text,confidence_level} of data){
            const decoded_file_name = file_name.split('||||')[1]


            //if required file then do the if
            if(!text_only){
                const blob = await download_from_storage(storage_ref)
                const array_buffer = await blob.arrayBuffer()
                const buffer = Buffer.from(array_buffer)
                const base64data = buffer.toString('base64')

                content.push( {
                    type: "file",
                    file:{
                        file_data: base64data,
                        filename: decoded_file_name,
                    }} as ChatCompletionContentPart)
                console.log('file pushed ')
            }
            if(confidence_level< lowest_confidence) lowest_confidence = confidence_level

            if(extracted_text){
                content.push( { text: `${decoded_file_name} :${extracted_text}` , type: "text"} as ChatCompletionContentPart)
            }

        }
        retrieved_extracted_file.push({role:'user', content: [...content]} as ChatCompletionMessageParam )
        return {
            content_file_arr: retrieved_extracted_file,
            lowest_confidence: lowest_confidence,
        }

    }catch(error){
        //console.error(error);
        throw error;
    }
}