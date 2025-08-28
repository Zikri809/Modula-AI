import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import OpenAI from "openai";
import {kimi_k2_prompt, kimi_k2_response_format} from "@/system_prompts/prompst";
import gemini_ocr from "@/lib/llm_based_processing/gemini_ocr";
import {JWTPayload} from "jose";
import context_builder from "@/lib/prompt_builder/openai/context_builder";
import openai_retrievial from "@/lib/prompt_builder/openai/openai_retrievial";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";

type Extracted_obj = {
    mark_down_extracted_content: string,
    confidence_level: number,
    file_name: string
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: `${process.env.KIMI_K2_API_KEY}`,
});


export async function POST(request: NextRequest) {
    const url = new URL(request.url)
    const chat_id = url.searchParams.get('chat_id')
    if(!chat_id) return NextResponse.json({message: 'missing chat_id in the params '},{status:400})

    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({error: 'No token present in the request'}, {status: 400})
    const JWT_token_payload = await verifyJWT(api_token ) as JWTPayload
    if (!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'}, {status: 400})

    const {uid} = JWT_token_payload
    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;
    let confidence_level: number | null = null

    try {

        const {file_meta_data} = await gemini_ocr(files,uid as string)
        const {past_conv_arr} = await context_builder(chat_id,uid as string)
        const {content_file_arr, lowest_confidence} = await openai_retrievial(chat_id, true)

        const messages:ChatCompletionMessageParam[] = [
            {
                role: "system",
                content: kimi_k2_prompt,
            },
            ...content_file_arr,
            ...past_conv_arr,
            {
                role: "user" as const,
                content: query,
            }
        ] as ChatCompletionMessageParam[]
        const open_ai_responses = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2:free",
            messages: messages,


        });


        //const parsed_response = await JSON.parse(open_ai_responses.choices[0].message.content as string)
        console.log('output is \n', open_ai_responses.choices[0].message.content) //to test copy this and paste into website do not copy from postman because it contains \n needed to save space for json
        return NextResponse.json({
            response: open_ai_responses.choices[0].message.content ?? null,
            confidence_level: lowest_confidence,
        }, {status: 200}) //the front end must parse the json string
        //the front end should notify the user if the confidence level is below 75 percent ask thme to change model
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: ' Problem with contacting the llm api ', cause: String(error)}, {status: 500})
    }

}

//test localhost:3000/api/llm/kimi-k2