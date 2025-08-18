import {NextRequest, NextResponse} from "next/server";
import verifyJWT from "@/lib/jwt/verifyJWT";
import create_user from "@/lib/supabase_helper/user/create_user";

export async function POST(request: NextRequest) {
    //we verify the request by the cookies 
    //auth layer
    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({
        error: 'No token present in the request',
        path: '/api/user/create/route.ts'
    }, {status: 400})
    const JWT_token_payload = await verifyJWT(api_token)
    if (!JWT_token_payload) return NextResponse.json({
        error: 'invalid token possibly expired ',
        path: '/api/user/create/route.ts'
    }, {status: 400})

    const {uid, email} = JWT_token_payload
    //check if the user already created
    try{
        const db = await create_user(uid as string, email as string)
        if(db) return NextResponse.json({message:'successfully created user'},{status:200})
        throw new Error("db does not exist")
    }
    catch(error){
        console.log(error)
        return NextResponse.json({message:'error creating user', cause:String(error)},{status:500})
    }

}

/*
test at POST localhost:3000/api/user/create
*/ 