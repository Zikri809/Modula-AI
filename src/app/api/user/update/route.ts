import { NextRequest, NextResponse } from "next/server";
import { db } from "@/Firebase/firebase-admin/firebase_admin";
import verifyJWT from "@/lib/jwt/verifyJWT";
import { JWTPayload } from "jose";
import {z} from 'zod'
const User_sessions = z.object({
    title: z.string(),
    sessionId: z.string()
})
const Update_schema = z.object({
  uid: z.string().optional(),            // Unique user ID, e.g. "lBxhvTkDUXMsX3eHoA1Zi9mdHqU2"
  plan: z.enum(['free' , 'paid' , 'dev']).optional(), 
  email: z.string().email().optional(),          // e.g. "free", "premium", etc.
  sessionIDs: z.array(User_sessions).optional(),  // Array of session document IDs (unique strings)
  token_remain: z.number().int().min(0).optional(), // Remaining tokens for the user, e.g. 5000
  free_upload: z.number().int().min(0).optional()
})


export async function PATCH( request:NextRequest){
    //middleware already check the existance of the api_token no need for discrete checks
   const api_token:string = request.cookies.get('api_token')?.value as string
   const payload = await verifyJWT(api_token) as JWTPayload
   const {uid } = payload
   const json_result = await request.json()
   //check to match the schema defined no allowing random properties
   const parsed_result = Update_schema.strict().safeParse(json_result)
   if(!parsed_result.success) return NextResponse.json({messsage: 'Body schema mismatched from the spec',error:parsed_result.error.flatten()}, {status: 400})
   const body = parsed_result.data
   //connect to collection
   const docRef = db.collection('user').doc(uid as string)

   try{
     await docRef.update(body)

    return NextResponse.json({messsage: 'successfully update the user document '},{status:200})
   }catch(error){
        console.error('an error occured updating user data ',error)
        return NextResponse.json({message:'An error occured updating the user document ',error: String(error)},{status:500})
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