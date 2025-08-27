/*import {NextRequest, NextResponse} from "next/server";
import create_message from "@/lib/supabase_helper/message/create_message";
import * as z from "zod";
import verifyJWT from "@/lib/jwt/verifyJWT";
import {JWTPayload} from "jose";
import {number} from "zod";

const body_schema = z.object({
    chat_id: z.string(),
    user_prompt: z.string(),
    llm_response: z.string(),
    prompt_tokens: z.number().nonnegative(),
    response_tokens: z.number().nonnegative(),
    total_cost :z.number().nonnegative(),
    llm_model : z.string(),
})

export async function POST(request:NextRequest){
    const api_token = request.cookies.get('api_token')?.value as string
    const JWT_token_payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = JWT_token_payload


    try{
        const body = await request.json()
        const parsed = body_schema.strict().safeParse(body)
        if(parsed.error) return NextResponse.json({message: 'ensure that the request body matches the schema ',cause: parsed.error},{status:400})
        const {chat_id,user_prompt,llm_response,prompt_tokens,response_tokens,total_cost,llm_model} = parsed.data
        console.log('here')

        const message_id = await create_message(
            uid as string,
            chat_id,
            user_prompt,
            llm_response,
            prompt_tokens,
            response_tokens,
            total_cost,
            llm_model
        )
        if(message_id) return NextResponse.json({message:'message created successfully',message_id:message_id},{status:200})
        throw new Error('cannot obtain message id ')
    }
    catch(err){
        return NextResponse.json({message: 'error occurred', cause: err}, {status:500})
    }
}
*/
