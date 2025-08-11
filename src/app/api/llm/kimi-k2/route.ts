import verifyJWT from "@/lib/jwt/verifyJWT";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { kimi_k2_prompt } from "@/system_prompts/prompst";



const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: `${process.env.KIMI_K2_API_KEY}`,
});


export async function POST(request:NextRequest){
    const api_token = request.cookies.get('api_token')?.value
    if(!api_token) return NextResponse.json({error: 'No token present in the request'}, {status:400})
    const JWT_token_payload = await verifyJWT(api_token) 
    if(!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'},{status:400})
     
    const formData = await request.formData();
    const files = formData.getAll('file') as File[] ;
    const query = formData.get('query') as string | null; 
    let extracted_content:string | null = null
    try{
      if(files.length>0) {
        const parseing = await fetch(`${process.env.DEV_ORIGIN ?? ''}/api/llm/gemini-2.0-flash?processer=true`,{
          method: 'POST',
          headers: {
            'Cookie': `api_token=${api_token}`, // forward them
          },
          body: formData,
        })
        const parsejson = await parseing.json()
        console.log('content of parsejson is ',parsejson)
        //if(!parsejson.response.mark_down_extracted_content) return NextResponse.json({message:'failed to extract the content ', cause: 'no content',status:500})
        extracted_content = parsejson.response
      } //if no file submitted wont run
        
    }
    catch(error){
        return NextResponse.json({error: 'fail to parse request', cause: String(error)},{status: 400})
    }
    if(!query && !extracted_content) return NextResponse.json({error:'Please include file or text in the request'},{status:400})
    try{
        console.log('extracted content is ',extracted_content)
        const completion = await openai.chat.completions.create({
        model: "moonshotai/kimi-k2:free",
        messages: [
          {
            "role": "system",
            "content": `${kimi_k2_prompt}`
          },
          {
            "role": "user",
            "content": `${extracted_content!=null ? extracted_content : ""} \n${query}`
          }
        ],
        temperature: 0

        });
        
        if(completion.choices[0].message.content){
          //completion.choices[0].message.content = safeNewlineReplace(completion.choices[0].message.content)
          //completion.choices[0].message.content = String(completion.choices[0].message.content)
        }
        console.log('output is ',completion.choices[0].message.content) //to test copy this and paste into website do not copy from postman because it contains \n needed to save space for json
        return NextResponse.json({response: completion.choices[0].message.content},{status:200}) //the front end must parse the json string
    }
    catch(error){
        return NextResponse.json({error: ' Problem with contacting the llm api ', cause: String(error)},{status:400})
    }
        
}

//test localhost:3000/api/llm/kimi-k2