import {File as File_2, GoogleGenAI} from "@google/genai";
const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({apiKey: GEMINI_API_KEY});

export default async function (file: File,): Promise<File_2 | null> {
    const array_buffer = await file.arrayBuffer()
    const blob = new Blob([array_buffer], {type: file.type})
    try {
        const file_upload = await gemini.files.upload({
            file: blob,
            config: {
                mimeType: file.type
            }
        })
        return file_upload
    } catch (error) {
        console.log({message: 'error occured during uploading to gemini ', cause: error})
        return null
    }
}