import { NextRequest,NextResponse } from "next/server";
import { db } from "@/Firebase/firebase-admin/firebase_admin";
import verifyJWT from "@/lib/jwt/verifyJWT";
import { UserSchema } from "@/Firebase/Database/user_schema";



export async function POST(request: NextRequest){
    //we verify the request by the cookies 
    //auth layer
    const api_token = request.cookies.get('api_token')?.value
    if(!api_token) return NextResponse.json({error: 'No token present in the request',path: '/api/user/create/route.ts'}, {status:400})
    const JWT_token_payload = await verifyJWT(api_token) 
    if(!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired ',path: '/api/user/create/route.ts'},{status:400})

    const {uid, email} = JWT_token_payload
    const user:UserSchema = {
        uid: uid as string,
        email: email as string,
        plan: 'free',
        sessionIDs: [],
        token_remain: 0,
        free_upload: 3

    }
    try{
        let collection =   db.collection('user')
        if(!collection){
            console.log('collection is missing')
        }
        //check if it exist 
        const user_existed = await collection.doc(uid as string ).get()
        if(user_existed.exists) return NextResponse.json({message: ' user already created'}, {status: 200})
        //if not create a user
        const create_user = await collection.doc(uid as string).create(user)
        return NextResponse.json({message: 'succefully created new user'}, {status: 200})

    }
    catch(error){
        console.log('error occured creating new user ', String(error))
        return NextResponse.json({messsage: ' fail to create user ' ,cause: String(error),path: '/api/user/create/route.ts'},{status:400})
    }
}
/*
test at POST localhost:3000/api/user/create
*/ 