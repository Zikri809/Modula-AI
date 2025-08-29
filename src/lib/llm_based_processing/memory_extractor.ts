//this is for memory extraction
import {
    gemini_memory_response_format,
    gemini_memory_system_prompt,
} from '@/system_prompts/prompst';
import { GoogleGenAI } from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

//this return needs to be processed by receipient
export default async function (
    past_context: { past_conv_arr: string[]; user_data?: string },
    query: string | null,
    response?: any
) {
    if (!query) query = '';
    if (!past_context || !response) throw new Error('missing parameter');
    try {
        const memory_extraction = await gemini.models.generateContent({
            model: 'gemini-2.0-flash-001',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `<user_details>${past_context.user_data}</user_details> <last_2_convo>${past_context.past_conv_arr.slice(past_context.past_conv_arr.length - 2)}</last_2_convo> <Current_user_query> ${query ?? ''} </Current_user_query> <current_response>${response.text}</current_response>`,
                        },
                    ],
                },
            ],
            config: {
                responseMimeType: 'application/json',
                systemInstruction: gemini_memory_system_prompt,
                responseJsonSchema: gemini_memory_response_format,
            },
        });
        return memory_extraction;
    } catch (err) {
        throw err;
    }
}
