import {NextRequest, NextResponse} from "next/server";
import create_chat from "@/lib/supabase_helper/chat/create_chat";
import verifyJWT from "@/lib/jwt/verifyJWT";
import {JWTPayload} from "jose";

export async function POST(request: NextRequest){
    const api_token = request.cookies.get('api_token')?.value as string
    const JWT_token_payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = JWT_token_payload

    try{
        const result = await create_chat(uid as string)
        if(!result?.data?.chat_id) return NextResponse.json({message:"no chat id obtained", db_result: result},{status:500})

        return NextResponse.json({message:"successfully created chat", chat_id:result?.data?.chat_id})
    }
    catch(error){
        console.log('error creating chat', error)
        return NextResponse.json({message:"error creating chat", cause: String(error)},{status:500})
    }
}