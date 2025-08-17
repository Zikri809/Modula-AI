import {NextRequest, NextResponse} from "next/server";
import {prismaClient} from "@/lib/prisma/prisma";
import verifyJWT from "@/lib/jwt/verifyJWT";


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
    const exist = await prismaClient.users.findUnique({where: {uid:uid as string}})
    if(exist) return NextResponse.json({message: 'User already exists'},{status:200})

    try{
        const db_result = await prismaClient.users.create({
            data: {
                uid: uid as string,
                email: email as string,
                created_at: new Date(),
                credit_remain: 0,
                plan: 'free',
                free_upload_remain: 3,
                user_details: [],

            }
        })
        return NextResponse.json({message:'successfully created the user',},{status:200})

    }
    catch(error){
        console.log(error)
        return NextResponse.json({message:'error creating user', cause:String(error)},{status:500})
    }

}

/*
test at POST localhost:3000/api/user/create
*/ 