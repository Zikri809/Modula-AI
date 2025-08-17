import delete_chat from "@/lib/supabase_helper/chat/delete_chat";
import {NextRequest, NextResponse} from "next/server";
import verifyJWT from "@/lib/jwt/verifyJWT";
import {JWTPayload} from "jose";

export async function DELETE(request:NextRequest){
    //get the chat id to be deleted from the params
    const url = new URL(request.url);
    const chat_id = url.searchParams.get('chat_id');
    //get the token containing user uid
    const api_token = request.cookies.get('api_token')?.value as string
    const JWT_token_payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = JWT_token_payload

    if(!chat_id) return NextResponse.json({message:'no chat id is provided in the params'})

    try{
        const db_result = await delete_chat(chat_id, uid as string)
        if(db_result) return NextResponse.json({message:'successfully deleted', uid_affected : uid , chat_id:chat_id}, {status:200})
        throw new Error('Failed to delete chat')
    }
    catch(err){
        return NextResponse.json({message:'error while deleting chat', cause:String(err)}, {status: 500})
    }
}