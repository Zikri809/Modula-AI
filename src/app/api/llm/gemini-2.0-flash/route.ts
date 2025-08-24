import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import {gemini_processor_prompt, gemini_response_format, prompt_format} from "@/system_prompts/prompst";
import create_message from "@/lib/supabase_helper/message/create_message";
import updateChat from "@/lib/supabase_helper/chat/update_chat";


//gemini layer
import {File as File_2, GoogleGenAI, Part} from '@google/genai';
import update_user from "@/lib/supabase_helper/user/update_user";
import prompt_builder from "@/lib/prompt_builder/prompt_builder";
import {file} from "zod/v4";
import file_retrievial_gemini from "@/lib/prompt_builder/file_retrievial_gemini";
import create_server_upload from "@/lib/supabase_helper/llm_server_upload/create_server_upload";
import create_chat from "@/lib/supabase_helper/chat/create_chat";
import create_file_metadata from "@/lib/supabase_helper/file meta data/create_file_metadata";


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
    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({error: 'No token present in the request'}, {status: 400})
    const JWT_token_payload = await verifyJWT(api_token)
    if (!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'}, {status: 400})
    const {uid} = JWT_token_payload

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;

    //file uploads block
    let uploaded_files: Part[] = []
    let file_meta_data:{file_name:string , file_size:number}[] =[]
    if (files.length > 0) {
        for (const file of files) {
            const file_data = await file_upload(file)
            if (!file_data) continue
            uploaded_files.push({
                fileData: {
                    mimeType: file_data?.mimeType,
                    fileUri: file_data?.uri
                }
            },)
            file_meta_data.push({file_name:file.name , file_size:file.size})
        }

    }

    //construct the file part for the prompt to refernce it
    let promptext
    if (processer) {
        promptext = gemini_processor_prompt
    } else {
        promptext = query ?? ''
    }

    //response block
    try {
        let retrieved_uri: Part[] = []
        if(!processer){
            retrieved_uri = await file_retrievial_gemini(chat_id,'gemini-2.0-flash-001')
        }
        const past_context = await prompt_builder(chat_id,uid as string)

        const contentBlock: Part[] = [{text: (processer? promptext:`${past_context} <user_query> ${promptext} </user_query>`)}, ...[...uploaded_files,...retrieved_uri]]
        const response = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: [{role: "user", parts: contentBlock}],
            config: {
                responseMimeType: "application/json",
                ...(!processer && {systemInstruction: prompt_format}),
                ...(!processer && {responseJsonSchema: gemini_response_format}),

            },

        });
        const json_response = JSON.parse(response.text ?? '')
        let cleaned = json_response.response
        console.log('output is ', cleaned) //copy this into the renderer not the postman one since /n in postman to save space fro json
        if(!processer){

            //updating the user details of user
            if(json_response.user_details.length>0) {
                const db_user = await update_user(uid as string, {user_details:json_response.user_details} , 'add')
            }

            //updating title for the chat
            if(json_response.title){
                const db_chat_ = await updateChat(chat_id, json_response.title)
            }

            //create new message
            const total_cost = (json_response.prompt_tokens/1000000 * 0.1)  + (json_response.response_tokens/1000000 * 0.4)
            const db_create_message = await create_message(
                uid as string,
                chat_id,
                JSON.stringify(promptext),
                JSON.stringify(json_response.response),
                response.usageMetadata?.promptTokenCount as number,
                response.usageMetadata?.candidatesTokenCount as number,
                total_cost,
                'gemini-2.0-flash-001'
            )
            await create_file_metadata(chat_id,db_create_message,file_meta_data)
            const db_upload = await create_server_upload(chat_id, uploaded_files,48,'gemini-2.0-flash-001')
        }


        return NextResponse.json({response: json_response}, {status: 200})

    } catch (error) {
        console.error(error)
        return NextResponse.json({
            message: 'fail to get a response from gemini api',
            cause: String(error)
        }, {status: 500})
    }
}

/*
testing

localhost:3000/api/llm/gemini-2.0-flash?processer=true
//please use github markdown to test online website is bs
*/ 