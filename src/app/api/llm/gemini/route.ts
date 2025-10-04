import verifyJWT from '@/lib/jwt/verifyJWT';
import { NextRequest, NextResponse } from 'next/server';
import { prompt_format } from '@/system_prompts/prompst';
import create_message from '@/lib/supabase_helper/message/create_message';
import updateChat from '@/lib/supabase_helper/chat/update_chat';
import create_file_metadata from '@/lib/supabase_helper/file meta data/create_file_metadata';

//gemini layer
import { GenerateContentResponse, GoogleGenAI, Part } from '@google/genai';
import update_user from '@/lib/supabase_helper/user/update_user';
import prompt_builder from '@/lib/prompt_builder/prompt_builder';
import file_retrievial_gemini from '@/lib/prompt_builder/file_retrievial_gemini';
import { JWTPayload } from 'jose';
import memory_extractor from '@/lib/llm_based_processing/memory_extractor';
import citation_builder from '@/lib/citation_builder/citation_builder';
import gemini_ocr from '@/lib/llm_based_processing/gemini_ocr';

import Verify_credit_upload from "@/lib/supabase_helper/user/verify_credit_upload";

import update_credit_upload from "@/lib/supabase_helper/user/update_credit_upload";

const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    const gemini_model = url.searchParams.get('gemini_model');
    const llm_model = url.searchParams.get('llm');
    if (!chat_id || !gemini_model || !llm_model )
        return NextResponse.json(
            { message: 'missing chat_id or gemini model or llm  in the params ' },
            { status: 400 }
        );
    //auth layer
    const api_token = request.cookies.get('api_token')?.value as string;
    const JWT_token_payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = JWT_token_payload;



    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;

    const is_credit_enough = await Verify_credit_upload(uid as string, files.length)
    if(!is_credit_enough) return NextResponse.json({exceeded: true , message: 'No credit remain for your account.'},{status:402})


    //response block
    try {
        //throw new Error('testing ui handler')
        //file uploads block
        const { uploaded_files, file_meta_data, ocr_response } = await gemini_ocr(
            files,
            uid as string
        );

        const retrieved_uri: Part[] = await file_retrievial_gemini(
            chat_id as string,
            'gemini-2.0-flash-001'
        );
        const past_context = await prompt_builder(chat_id as string, uid as string);
        //console.table(...[...uploaded_files, ...retrieved_uri]);
        const contentBlock: Part[] = [
            {
                text: `<Past_convo>${past_context.past_conv_arr.join(' ')}</Past_convo> <user_details>${past_context.user_data}</user_details></user_details> <user_query> ${query ?? ''} </user_query>`,
            },
            ...[...uploaded_files, ...retrieved_uri],
        ];
        console.log('generating content on gemini api')
        const response = await gemini.models.generateContent({
            model: gemini_model as string,
            contents: [{ role: 'user', parts: contentBlock }],
            config: {
                tools: [ { googleSearch: {} }],
                systemInstruction: prompt_format,
            },
        });
        const cited_text = await citation_builder(response);
        // @ts-ignore
        console.log('response from origin \n', cited_text ?? response.text);
        //copy this into the renderer not the postman one since /n in postman to save space from json

        const memory_extraction = await memory_extractor(
            past_context,
            query,
            response
        );

        const message_id = await db_updates(
            memory_extraction,
            `<convo> user: ${query} || llm_response: ${cited_text ? cited_text : response.text} </convo>`,
            uid as string,
            chat_id as string,
            response,
            query,
            file_meta_data,
            ocr_response,
            llm_model as string,
        );

        return NextResponse.json(
            {
                response: cited_text ? cited_text : response.text,
                message_id: message_id,
                meta_data: JSON.parse(memory_extraction.text as string),
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                message: 'fail to get a response from gemini api',
                cause: error,
            },
            { status: 500 }
        );
    }
}

//-------------------------------------------------------------------------------------------------------------------------------------
async function db_updates(
    memory_response: GenerateContentResponse,
    text_prompt: string,
    uid: string,
    chat_id: string,
    response: GenerateContentResponse,
    query: string | null,
    file_meta_data: any,
    ocr_response: GenerateContentResponse | undefined,
    llm: string
) {
    const { title, user_details }: { title: string; user_details: string[] } =
        JSON.parse(memory_response.text as string);
    try {
        //required

        //updating the user details of user optional
        if (Array.isArray(user_details)) {
            console.log(
                'user details passed to db on gemini endpoint\n',
                user_details
            );
            await update_user(
                uid as string,
                { user_details: user_details },
                'add'
            );
        }
        //updating title for the chat
        if (title) {
            await updateChat(chat_id, title);
        }

        //calculate the text_prompt_token
        const token_response = await gemini.models.countTokens({
            model: 'gemini-2.0-flash',
            contents: text_prompt,
        });
        const context_prompt_tokens = token_response.totalTokens
            ? token_response.totalTokens
            : 0;
        //create new message
        const total_cost =
            //input cost
            (((ocr_response?.usageMetadata?.promptTokenCount ?? 0) +
                (response.usageMetadata?.promptTokenCount ?? 0) +
                (memory_response.usageMetadata?.promptTokenCount ?? 0)) /
                1000000) *
                0.1 +
            //output cost
            (((ocr_response?.usageMetadata?.candidatesTokenCount ?? 0) +
                (response.usageMetadata?.candidatesTokenCount ?? 0) +
                (memory_response.usageMetadata?.candidatesTokenCount ?? 0)) /
                1000000) *
                0.4;

        const message_id = await create_message(
            uid as string,
            chat_id,
            JSON.stringify(query ?? ''),
            JSON.stringify((await citation_builder(response)) ?? response.text),
            context_prompt_tokens,
            (response.usageMetadata?.promptTokenCount as number) +
                (memory_response.usageMetadata?.promptTokenCount as number) +
                (ocr_response?.usageMetadata?.promptTokenCount ?? 0),
            (response.usageMetadata?.candidatesTokenCount as number) +
                (memory_response.usageMetadata
                    ?.candidatesTokenCount as number) +
                (ocr_response?.usageMetadata?.candidatesTokenCount ?? 0),
            total_cost,
            llm
        );
        //optional
       console.log('file meta data',file_meta_data)
         await update_credit_upload({
             credit_type: "subtract",
             credit_value: total_cost,
             uid: uid as string,
             upload_type: "subtract",
             upload_value: file_meta_data.length ?? 0,
         })


        if (file_meta_data.length > 0) {
            await create_file_metadata(
                chat_id,
                message_id,
                file_meta_data
            );
        }
        return message_id;
    } catch (error) {
        throw error;
    }
}




/*
testing

localhost:3000/api/llm/gemini-2.0-flash?processer=true
//please use github markdown to test online website is bs
*/
