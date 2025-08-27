import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import {gemini_processor_prompt,  prompt_format} from "@/system_prompts/prompst";
import create_message from "@/lib/supabase_helper/message/create_message";
import updateChat from "@/lib/supabase_helper/chat/update_chat";
import create_file_metadata from "@/lib/supabase_helper/file meta data/create_file_metadata";


//gemini layer
import {File as File_2, GenerateContentResponse, GoogleGenAI, Part} from '@google/genai';
import update_user from "@/lib/supabase_helper/user/update_user";
import prompt_builder from "@/lib/prompt_builder/prompt_builder";
import file_retrievial_gemini from "@/lib/prompt_builder/file_retrievial_gemini";
import {JWTPayload} from "jose";
import upload_to_storage from "@/Firebase/Utilities/upload_to_storage";
import memory_extractor from "@/lib/llm_based_processing/memory_extractor";
import citation_builder from "@/lib/citation_builder/citation_builder";



const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({apiKey: GEMINI_API_KEY});


async function file_upload(file: File,): Promise<File_2 | null> {
    const array_buffer = await file.arrayBuffer()
    const blob = new Blob([array_buffer], {type: file.type})
    try {
        const file_upload = await gemini.files.upload({
            file: blob,
            config: {
                mimeType: file.type
            }
        })
        return file_upload
    } catch (error) {
        console.log({message: 'error occured during uploading to gemini ', cause: error})
        return null
    }
}


export async function POST(request: NextRequest) {
    //get the params if processor then file processing task
    const url = new URL(request.url)
    const processer = url.searchParams.get('processer') === 'true'
    const chat_id = url.searchParams.get('chat_id')
    if(!chat_id) return NextResponse.json({message: 'missing chat_id in the params '},{status:400})
    //auth layer
    const api_token = request.cookies.get('api_token')?.value as string
    const JWT_token_payload = await verifyJWT(api_token ) as JWTPayload
    const {uid} = JWT_token_payload

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;

    //file uploads block
    const {uploaded_files,file_meta_data} = await  upload_all_file(files,uid as string)

    //response block
    try {
        let retrieved_uri: Part[] = []
        let past_context:{past_conv_arr:string[], user_data:string} = {past_conv_arr:[], user_data:''}
        if(!processer){
            retrieved_uri = await file_retrievial_gemini(chat_id,'gemini-2.0-flash-001')
            past_context = await prompt_builder(chat_id,uid as string)
        }

        const contentBlock: Part[] = [{text: (processer? gemini_processor_prompt:`<Past_convo>${past_context.past_conv_arr.join( ' ')}</Past_convo> <user_details>${past_context.user_data}</user_details></user_details> <user_query> ${query ?? ''} </user_query>`)}, ...[...uploaded_files,...retrieved_uri]]
        const response = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: [{role: "user", parts: contentBlock}],
            config: {
                tools: [{ urlContext: {} }, {googleSearch:{}}],
                ...(!processer && {systemInstruction: prompt_format}),

            },

        });
        const cited_text = await citation_builder(response)
        // @ts-ignore
        console.log('response from origin \n',cited_text ?? response.text)
        //copy this into the renderer not the postman one since /n in postman to save space from json

        const memory_extraction = await memory_extractor(past_context,query, response)


           await db_updates(
               memory_extraction ,
               `<convo> user: ${query} || llm_response: ${cited_text? cited_text : response.text} </convo>`,
               uid as string,
               chat_id,
               response,
               query,
               file_meta_data,
           )

        return NextResponse.json({response: (cited_text?cited_text: response.text) ,meta_data:JSON.parse(memory_extraction.text as string)}, {status: 200})

    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: 'fail to get a response from gemini api',
            cause: String(error)
        }, {status: 500})
    }
}


async function upload_all_file(files: File[],uid:string) {
    let uploaded_files: Part[] = []
    let file_meta_data:{file_name:string , file_size:number,storage_ref:string, gemini_uri_part:{fileData:{mimeType:string,fileUri:string}}}[] =[]

    for (const file of files) {
        const file_data = await file_upload(file)
        if (!file_data) continue
        const storage_ref = await upload_to_storage(file,uid)
        uploaded_files.push({
            fileData: {
                mimeType: file_data?.mimeType,
                fileUri: file_data?.uri
            }})
        file_meta_data.push({
            file_name:file.name ,
            file_size:file.size,
            storage_ref: storage_ref,
            gemini_uri_part:{
                fileData: {
                    mimeType: file_data?.mimeType as string,
                    fileUri: file_data?.uri as string
                }
            }
        })
    }

    return {
        uploaded_files: uploaded_files,
        file_meta_data: file_meta_data,
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------
async function db_updates(memory_response:GenerateContentResponse, text_prompt:string,uid :string, chat_id:string , response:GenerateContentResponse, query:string | null , file_meta_data:any) {
    const {title,user_details}:{title: string , user_details: string[]} = JSON.parse(memory_response.text as string)
    try{
        //required

        //updating the user details of user optional
        if(Array.isArray(user_details) && (user_details.length>0) ){
            await update_user(uid as string, {user_details:user_details} , 'add')
        }
        //updating title for the chat
        if(title ) {
            await updateChat(chat_id, title)

        }

        //calculate the text_prompt_token
        const token_response = await gemini.models.countTokens({
            model: 'gemini-2.0-flash',
            contents: text_prompt
        })
        const context_prompt_tokens = token_response.totalTokens ?token_response.totalTokens : 0
        //create new message
        const total_cost = ( ((response.usageMetadata?.promptTokenCount ?? 0) + (memory_response.usageMetadata?.promptTokenCount ?? 0))/1000000 * 0.1)
            + (((response.usageMetadata?.candidatesTokenCount ?? 0) + (memory_response.usageMetadata?.candidatesTokenCount ?? 0))/1000000 * 0.4)

        const db_create_message = await create_message(
            uid as string,
            chat_id,
            JSON.stringify(query ?? ''),
            JSON.stringify(await citation_builder(response) ?? response.text),
            context_prompt_tokens,
            (response.usageMetadata?.promptTokenCount as number) + (memory_response.usageMetadata?.promptTokenCount as number),
            (response.usageMetadata?.candidatesTokenCount as number) + (memory_response.usageMetadata?.candidatesTokenCount as number),
            total_cost,
            'gemini-2.0-flash-001'
        )
        //optional
        if(file_meta_data.length>0){
            await create_file_metadata(chat_id,db_create_message,file_meta_data)
        }
    }
    catch(error){
        throw error
    }

}
/*
testing

localhost:3000/api/llm/gemini-2.0-flash?processer=true
//please use github markdown to test online website is bs
*/ 