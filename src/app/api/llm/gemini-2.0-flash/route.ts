import verifyJWT from "@/lib/jwt/verifyJWT";
import { NextRequest, NextResponse } from "next/server";
import { prompt_format,gemini_processor_prompt } from "@/system_prompts/prompst";

//gemini layer
import {GoogleGenAI,Part,File as File_2} from '@google/genai';
import { json } from "stream/consumers";

const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({apiKey: GEMINI_API_KEY});

const response_schema = {
  "type": "object",
  "properties": {
    "mark_down_extracted_content": {
      "type": "string"
    },
    "confidence_level": {
      "type": "number"
    }
  },
  "propertyOrdering": [
    "mark_down_extracted_content",
    "confidence_level"
  ],
  "required": [
    "mark_down_extracted_content",
    "confidence_level"
  ]
}

async function file_upload(file:File,):Promise<File_2 | null>{
    const array_buffer = await file.arrayBuffer()
    const blob = new Blob([array_buffer],{type: file.type}) 
    try{
        const file_upload = await gemini.files.upload({
            file: blob,
            config:{
                mimeType: file.type
            }
        })
        return file_upload
    }
    catch(error){
        console.log({message:'error occured during uploading to gemini ', cause: error})
        return null
    }
}




export async function POST(request:NextRequest){
    //get the params if processor then file processing task
    const url = new URL(request.url)
    const processer = url.searchParams.get('processer') ==='true'
    //auth layer
    const api_token = request.cookies.get('api_token')?.value
    if(!api_token) return NextResponse.json({error: 'No token present in the request'}, {status:400})
    const JWT_token_payload = await verifyJWT(api_token) 
    if(!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired'},{status:400})

    const formData = await request.formData();
    const files = formData.getAll('file') as File[] ;
    const query = formData.get('query') as string | null;

    //file uploads block
    let uploaded_files:Part[] = []
    if(files.length>0){
      for(const file of files){
          const file_data = await file_upload(file)
          if(!file_data) continue
          uploaded_files.push({fileData:{
              mimeType: file_data?.mimeType,
              fileUri: file_data?.uri
          }},)
      }

    }

    //construct the file part for the prompt to refernce it
    let promptext
    if(processer){
        promptext = gemini_processor_prompt
    }else{
        promptext = query ?? ''
    }
    
    const contentBlock:Part[] = [{text: promptext}, ...uploaded_files]

    //response block
    try{
        

        const response = await gemini.models.generateContent({
          model: 'gemini-2.0-flash-001',
          contents:  [{role: "user", parts: contentBlock}]  ,
          config:{
            responseMimeType: "application/json",
            ...(!processer && {systemInstruction: prompt_format}),
            ...(!processer && {responseJsonSchema: response_schema}),
            
        },
        
        });
        const json_response = JSON.parse(response.text ?? '')
        let cleaned = json_response.mark_down_extracted_content 
        //cleaned = cleaned.replace(/\\\\/g, `\\`);
        console.log('output is ',cleaned) //copy this into the renderer not the postman one since /n in postman to save space fro json
        return NextResponse.json({response: json_response},{status:200})
    }catch(error){
      return  NextResponse.json({message: 'fail to get a response from gemini api', cause: String(error)},{status:500})
    }
}

/*
testing

localhost:3000/api/llm/gemini-2.0-flash?processer=true
//please use github markdown to test online website is bs
*/ 