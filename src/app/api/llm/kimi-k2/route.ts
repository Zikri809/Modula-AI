import verifyJWT from "@/lib/jwt/verifyJWT";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";




const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: `${process.env.KIMI_K2_API_KEY}`,
});


export async function POST(request:NextRequest){
    const api_token = request.cookies.get('api_token')?.value
    if(!api_token) return NextResponse.json({error: 'No token present in the request'}, {status:400})
    const JWT_token_payload = await verifyJWT(api_token) 
    if(!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'},{status:400})
     
    let query_out, extracted_file_string    
    try{
        const formData = await request.formData();
        const files = formData.getAll('file') as File[] ;
        const query = formData.get('query') as string | null;


        
    }
    catch(error){
        return NextResponse.json({error: 'fail to parse request', cause: String(error)},{status: 400})
    }
    if(!query_out && !extracted_file_string) return NextResponse.json({error:'Please include file or text in the request'},{status:400})
    try{

        const completion = await openai.chat.completions.create({
        model: "moonshotai/kimi-k2:free",
        messages: [
          {
            "role": "user",
            "content": `${query_out}\n${extracted_file_string!=null ? extracted_file_string : ""}`
          }
        ],

        });
        return NextResponse.json({response: completion.choices[0].message},{status:200})
    }
    catch(error){
        return NextResponse.json({error: ' Problem with contacting the llm api ', cause: String(error)},{status:400})
    }
        
}

//test localhost:3000/api/llm/kimi-k2