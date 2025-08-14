import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import OpenAI from "openai";
import {kimi_k2_prompt, kimi_k2_response_format} from "@/system_prompts/prompst";

type Extracted_obj = {
    mark_down_extracted_content: string,
    confidence_level: number,
    file_name: string
}

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: `${process.env.KIMI_K2_API_KEY}`,
});


export async function POST(request: NextRequest) {
    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({error: 'No token present in the request'}, {status: 400})
    const JWT_token_payload = await verifyJWT(api_token)
    if (!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'}, {status: 400})

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];
    const query = formData.get('query') as string | null;
    let extracted_content_obj_arr: Extracted_obj[] | null = null
    let confidence_level: number | null = null
    try {
        console.log('files is  ',files)
        if (files.length != 0) {
            const parseing = await fetch(`${process.env.DEV_ORIGIN ?? ''}/api/llm/gemini-2.0-flash?processer=true`, {
                method: 'POST',
                headers: {
                    'Cookie': `api_token=${api_token}`, // forward them
                },
                body: formData,
            })
            const parsejson = await parseing.json()
            console.log('content of parsejson is ', parsejson)
            //if(!parsejson.response.mark_down_extracted_content) return NextResponse.json({message:'failed to extract the content ', cause: 'no content',status:500})
            extracted_content_obj_arr = parsejson.response
            if (extracted_content_obj_arr) {
                let sum = 0
                for (const element of extracted_content_obj_arr) {
                    sum += element.confidence_level
                }
                confidence_level = sum / extracted_content_obj_arr.length
            }

        } //if no file submitted wont run

    } catch (error) {
        return NextResponse.json({error: 'fail to parse request', cause: String(error)}, {status: 400})
    }
    if (!query && !extracted_content_obj_arr) return NextResponse.json({error: 'Please include file or text in the request'}, {status: 400})

    try {
        console.log('extracted content is ', extracted_content_obj_arr)
        const completion = await openai.chat.completions.create({
            model: "moonshotai/kimi-k2:free",
            messages: [
                {
                    "role": "system",
                    "content": `${kimi_k2_prompt}`
                },
                {
                    "role": "user",
                    "content": `${extracted_content_obj_arr != null ? JSON.stringify(extracted_content_obj_arr) : ""} \n${query}`
                }
            ],
            response_format: kimi_k2_response_format

        });

        if (completion.choices[0].message.content) {
            //completion.choices[0].message.content = safeNewlineReplace(completion.choices[0].message.content)
            //completion.choices[0].message.content = String(completion.choices[0].message.content)
        }
        const parsed_response = await JSON.parse(completion.choices[0].message.content as string)
        console.log('output is ', parsed_response.response) //to test copy this and paste into website do not copy from postman because it contains \n needed to save space for json
        return NextResponse.json({
            response: parsed_response.response,
            user_details: parsed_response.user_details,
            text_chunks: parsed_response.text_chunks,
            confidence_level: confidence_level
        }, {status: 200}) //the front end must parse the json string
        //the front end should notify the user if the confidence level is below 75 percent ask thme to change model
    } catch (error) {
        return NextResponse.json({error: ' Problem with contacting the llm api ', cause: String(error)}, {status: 400})
    }

}

//test localhost:3000/api/llm/kimi-k2