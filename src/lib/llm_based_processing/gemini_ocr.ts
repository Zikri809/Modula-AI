import gemini_upload from "@/lib/gemini_upload/gemini_upload";
import {GoogleGenAI, Part} from "@google/genai";
import upload_to_storage from "@/Firebase/Utilities/upload_to_storage";
import {gemini_processor_prompt, gemini_processor_format} from "@/system_prompts/prompst";


const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export default async function (files: File[], uid:string) {
    if(files.length == 0) return{
        response: [],
        file_meta_data: [],
        uploaded_files: [],
    }
    try{
        //generate random uuid append to file name
        files = files.map(file =>{
            return new File([file], `${crypto.randomUUID()+'||||'+ file.name}`,{type: file.type});
        })
        let uploaded_files: Part[] = []
        let file_meta_data:{file_name:string , file_size:number,storage_ref:string,extracted_text: string | null, confidence_level: number | null, gemini_uri_part:{fileData:{mimeType:string,fileUri:string}}}[] =[]
        //uploading all the files
        for (const file of files) {
            const file_data = await gemini_upload(file)
            if (!file_data) continue
            const storage_ref = await upload_to_storage(file,uid)
            uploaded_files.push({
                fileData: {
                    mimeType: file_data?.mimeType,
                    fileUri: file_data?.uri
                }})
            file_meta_data.push({
                file_name:file.name ,
                file_size:file.size,
                storage_ref: storage_ref,
                extracted_text: null,
                confidence_level: null,
                gemini_uri_part:{
                    fileData: {
                        mimeType: file_data?.mimeType as string,
                        fileUri: file_data?.uri as string
                    }
                }
            })
        }
        //ocr by gemini

        const contentBlock: Part[] = [ ...uploaded_files]
        const gemini_response = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: [{role: "user", parts: contentBlock}],
            config: {
                responseMimeType: 'application/json',
                responseJsonSchema: gemini_processor_format,
                systemInstruction: gemini_processor_prompt,

            },

        });
        if(!gemini_response || !gemini_response.candidates) throw new Error('gemini_response or the candidates missing');
        const gemini_response_json = JSON.parse(gemini_response.text ?? '')
        //insert the extracted text and content to the file_meta_data array
        for( let index = 0; index < gemini_response_json.response.length; index++ ) {
            file_meta_data[index].extracted_text = gemini_response_json.response[index].mark_down_extracted_content
            file_meta_data[index].confidence_level = gemini_response_json.response[index].confidence_level
        }
        console.log('gemini ocr response \n',gemini_response_json)
        console.log(file_meta_data)
        return {
            response: gemini_response_json.response,
            file_meta_data: file_meta_data,
            uploaded_files: uploaded_files,
        }
    }
    catch(err){
        console.log(err);
        throw err;
    }

}