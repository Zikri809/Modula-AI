import {NextRequest, NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import verifyJWT from "@/lib/jwt/verifyJWT";
import {JWTPayload} from "jose";
import {z} from 'zod'
import {prismaClient} from "@/lib/prisma/prisma";

const User_sessions = z.object({
    title: z.string(),
    sessionId: z.string()
})
const Update_schema = z.object({
    plan: z.enum(['free', 'paid']).optional(),
    email: z.string().email().optional(),          // e.g. "free", "premium", etc.
    user_details: z.array(z.string()).optional(),
    credit_remain: z.number().int().min(0).optional(), // Remaining tokens for the user, e.g. 5000
    free_upload: z.number().int().min(0).optional()
})
//note array updates needs to be revisited since this approach overwirte with new array instead of add

export async function PATCH(request: NextRequest) {
    //middleware already check the existance of the api_token no need for discrete checks
    const url = new URL(request.url);
    const user_details_operation = url.searchParams.get("user_details_operation");

    const api_token: string = request.cookies.get('api_token')?.value as string
    const payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = payload as JWTPayload
    const json_result = await request.json()
    //check to match the schema defined no allowing random properties
    const parsed_result = Update_schema.strict().safeParse(json_result)
    if (!parsed_result.success) return NextResponse.json({
        messsage: 'Body schema mismatched from the spec',
        error: parsed_result.error.flatten()
    }, {status: 400})
    const {plan, email,credit_remain, free_upload, user_details} = parsed_result.data
    //connect to collection
    const prisma_update = {} as Prisma.usersUpdateInput
    if(plan) prisma_update.plan = plan
    if(email) prisma_update.email = email
    if(credit_remain) prisma_update.credit_remain = credit_remain
    if(free_upload) prisma_update.free_upload_remain = free_upload
    if(user_details && user_details_operation == 'add') prisma_update.user_details = {push: [...user_details]}
    if(user_details && user_details_operation == 'remove') {
        //fetch the original array in db then remove the element then overwrite back
        const result = await prismaClient.users.findUnique({
            where: {
                uid: uid as string,
            }
        })
        if(!result ) return NextResponse.json({message:'failed to update user details, removing operation', cause: "fail to read original array "},{status:500})
        const original_arr = result.user_details ?? []
        for(const element of user_details) {
            if(original_arr.includes(element)){
                const  index_to_remove = original_arr.indexOf(element)
                original_arr.splice(index_to_remove, 1)
            }
        }
        prisma_update.user_details = original_arr
    }
    try{
        await prismaClient.users.update({
            where: {uid: uid as string},
            data: prisma_update,
        })
        return NextResponse.json({message: 'field updated successfully.'}, {status: 200})
    }
    catch(error){
        console.log(error)
        return NextResponse.json({message: "failed to update user row ", uid_affected: uid , cause:String(error)},{status:500})
    }
}

/*
test PATCH localhost:3000/api/user/update
test cases copy and paste in postman 
test 1 : expected 200
{
  "uid": "lBxhvTkDUXMsX3eHoA1Zi9mdHqU2",
  "plan": "paid",
  "email": "user@example.com",
  "sessionIDs": [
    { "title": "Chrome Session", "sessionId": "abc123" },
    { "title": "Mobile Session", "sessionId": "xyz789" }
  ],
  "token_remain": 5000,
  "free_upload": 3
}

test 2 : expected 200
{
  "plan": "free",
  "token_remain": 0
}

test 3 : expected error
{
  "plan": "premium"
}

test 4 : expected  error
{
  "email": "not-an-email"
}

test 5 : expected error
{
  "uid": "lBxhvTkDUXMsX3eHoA1Zi9mdHqU2",
  "hacker": true
}

test 6 : expected error
{
  "token_remain": -100
}


*/