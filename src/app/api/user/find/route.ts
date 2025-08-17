import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import {prismaClient} from "@/lib/prisma/prisma";
import * as z from "zod";
import {Prisma} from "@prisma/client"
import {JWTPayload} from "jose";

const find_schema = z.object({// Unique user ID, e.g. "lBxhvTkDUXMsX3eHoA1Zi9mdHqU2"
    plan: z.enum(['free', 'paid']).optional(),
    email: z.string().email().optional(),          // e.g. "free", "premium", etc.// Array of session document IDs (unique strings)
    user_details: z.array(z.string()).optional(),
    credit_remain: z.number().int().min(0).optional(), // Remaining tokens for the user, e.g. 5000
    free_upload: z.number().int().min(0).optional()
})


export async function POST(request: NextRequest) {
    //we verify the request by the cookies 
    //NOTE: if a rquest to this endpoint is made from another api makesure to pass the cookies along 
    const api_token: string = request.cookies.get('api_token')?.value as string
    const payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = payload as JWTPayload
    const body = await request.json()
    //evaluate the body matches the find schema
    const parsed =   find_schema.safeParse(body)
    if(!parsed.success) return NextResponse.json({message:'the request schema does not match our schema ',cause:String(parsed.error)},{status:400})
    const{plan, email, credit_remain, free_upload } = parsed.data
    //construct optional filter object
    const prisma_filter = {} as Prisma.usersWhereUniqueInput
    if(uid) prisma_filter.uid = uid as string
    if(plan) prisma_filter.plan = plan
    if(email) prisma_filter.email = email
    if(credit_remain) prisma_filter.credit_remain = credit_remain
    if(free_upload) prisma_filter.free_upload_remain = free_upload


    //find in the db
    try{
        const result = await prismaClient.users.findUnique({
            where:prisma_filter,})

        return NextResponse.json({response:result },{status:200})
    }
    catch(err){
        console.log(err)
        return NextResponse.json({error: 'problem when connecting to the db ',cause:String(err)},{status:500})
    }

}

/*
test GET localhost:3000/api/user/find
*/ 