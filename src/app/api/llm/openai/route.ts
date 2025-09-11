import verifyJWT from '@/lib/jwt/verifyJWT';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { kimi_k2_prompt } from '@/system_prompts/prompst';
import gemini_ocr from '@/lib/llm_based_processing/gemini_ocr';
import { JWTPayload } from 'jose';
import context_builder from '@/lib/openai/context_builder';
import openai_retrievial from '@/lib/openai/openai_retrievial';
import {
    ChatCompletionContentPart,
    ChatCompletionMessageParam,
} from 'openai/resources/chat/completions/completions';
import get_request_data from '@/lib/open_router/get_request_data';
import memory_extractor from '@/lib/llm_based_processing/memory_extractor';
import db_updates from '@/lib/openai/db_updates';

const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: `${process.env.KIMI_K2_API_KEY}`,
});

export async function POST(request: NextRequest) {
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    const web_search = url.searchParams.get('web_search') === 'true';
    if (!chat_id)
        return NextResponse.json(
            { message: 'missing chat_id in the params ' },
            { status: 400 }
        );

    const api_token = request.cookies.get('api_token')?.value;
    if (!api_token)
        return NextResponse.json(
            { error: 'No token present in the request' },
            { status: 400 }
        );
    const JWT_token_payload = (await verifyJWT(api_token)) as JWTPayload;
    if (!JWT_token_payload)
        return NextResponse.json(
            { error: 'invalid token possibly expired' },
            { status: 400 }
        );

    const { uid } = JWT_token_payload;
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;
    let confidence_level: number | null = null;

    try {
        const { file_meta_data, ocr_response } = await gemini_ocr(
            files,
            uid as string
        );
        const { past_conv_arr_openai, previous_convo_gemini } =
            await context_builder(chat_id, uid as string);
        const { content_file_arr, lowest_confidence } = await openai_retrievial(
            chat_id,
            true
        );

        const uploaded_file_content: ChatCompletionContentPart[] =
            file_meta_data.map((object) => {
                return {
                    text: `${object.file_name} : ${object.extracted_text}`,
                    type: 'text',
                };
            });

        const messages: ChatCompletionMessageParam[] = [
            {
                role: 'system',
                content: kimi_k2_prompt,
            },
            ...content_file_arr,
            ...past_conv_arr_openai,
            {
                role: 'user' as const,
                content: [
                    { text: query, type: 'text' },
                    ...uploaded_file_content,
                ],
            },
        ] as ChatCompletionMessageParam[];
        const open_ai_responses = await openai.chat.completions.create({
            model: `deepseek/deepseek-chat-v3.1:free${web_search ? ':online' : ''}`,
            messages: messages,
        });

        const request_data = await get_request_data(open_ai_responses.id);
        console.log('request data is ', request_data);
        const {
            total_cost: open_ai_cost,
            tokens_completion: open_ai_tokens_completion,
            tokens_prompt: open_ai_tokens_prompt,
            num_search_results: open_ai_num_search_result,
        } = request_data;

        const memory_extraction = await memory_extractor(
            { past_conv_arr: previous_convo_gemini },
            query,
            { text: open_ai_responses.choices[0].message.content }
        );

        const message_id = await db_updates(
            memory_extraction,
            `<convo> user: ${query} || llm_response: ${open_ai_responses.choices[0].message.content} </convo>`,
            uid as string,
            chat_id,
            {
                total_completions_token: open_ai_tokens_completion,
                total_prompt_token: open_ai_tokens_prompt,
                total_cost: open_ai_cost,
                total_token: open_ai_tokens_prompt + open_ai_tokens_completion,
            },
            query,
            open_ai_responses.choices[0].message.content ?? '',
            file_meta_data,
            ocr_response,
            'Deepseek-V3.1'
        );

        console.log(
            'output is \n',
            open_ai_responses.choices[0].message.content
        ); //to test copy this and paste into website do not copy from postman because it contains \n needed to save space for json
        return NextResponse.json(
            {
                response: open_ai_responses.choices[0].message.content ?? null,
                message_id: message_id,
                confidence_level: lowest_confidence,
                meta_data: JSON.parse(memory_extraction.text as string),
            },
            { status: 200 }
        ); //the front end must parse the json string
        //the front end should notify the user if the confidence level is below 75 percent ask thme to change model
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            {
                error: ' Problem with contacting the llm api ',
                cause: String(error),
            },
            { status: 500 }
        );
    }
}

//test localhost:3000/api/llm/kimi-k2
