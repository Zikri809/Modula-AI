import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import {gemini_processor_prompt, gemini_response_format, prompt_format} from "@/system_prompts/prompst";
import create_message from "@/lib/supabase_helper/message/create_message";
import updateChat from "@/lib/supabase_helper/chat/update_chat";

//gemini layer
import {File as File_2, GoogleGenAI, Part} from '@google/genai';
import update_user from "@/lib/supabase_helper/user/update_user";


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
        }

    }

    //construct the file part for the prompt to refernce it
    let promptext
    if (processer) {
        promptext = gemini_processor_prompt
    } else {
        promptext = query ?? ''
    }

    const contentBlock: Part[] = [{text: promptext}, ...uploaded_files]

    //response block
    try {


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
            json_response.prompt_tokens,
            json_response.response_tokens,
            total_cost,
            'gemini-2.0-flash-001'
        )

        return NextResponse.json({response: json_response}, {status: 200})

    } catch (error) {
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