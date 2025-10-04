import {
    GenerateContentResponse,
    GoogleGenAI,
    UsageMetadata,
} from '@google/genai';
import update_user from '@/lib/supabase_helper/user/update_user';
import updateChat from '@/lib/supabase_helper/chat/update_chat';
import create_message from '@/lib/supabase_helper/message/create_message';
import create_file_metadata from '@/lib/supabase_helper/file meta data/create_file_metadata';
import update_credit_upload from "@/lib/supabase_helper/user/update_credit_upload";

const GEMINI_API_KEY = process.env.GEMINI_API;
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Openai_metadata = {
    total_cost: number;
    total_prompt_token: number;
    total_completions_token: number;
    total_token: number;
};
//returns message id
export default async function (
    memory_response: GenerateContentResponse,
    text_prompt: string,
    uid: string,
    chat_id: string,
    open_ai_meta_data: Openai_metadata,
    query: string | null,
    open_ai_response: string,
    file_meta_data: any,
    ocr_response: GenerateContentResponse | undefined,
    model: string,
) {
    const { title, user_details }: { title: string; user_details: string[] } =
        JSON.parse(memory_response.text as string);
    try {
        //required

        //updating the user details of user optional
        if (Array.isArray(user_details) && user_details.length > 0) {
            await update_user(
                uid as string,
                { user_details: user_details },
                'add'
            );
        }
        //updating title for the chat
        if (title) {
            await updateChat(chat_id, title);
        }

        //calculate the text_prompt_token
        const token_response = await gemini.models.countTokens({
            model: 'gemini-2.0-flash',
            contents: text_prompt,
        });
        const context_prompt_tokens = token_response.totalTokens
            ? token_response.totalTokens
            : 0;
        //create new message
        const total_cost =
            //input cost gemini
            ((ocr_response?.usageMetadata?.promptTokenCount ?? 0)/ 1000000)  +
            ((memory_response.usageMetadata?.promptTokenCount ?? 0) / 1000000) *
                0.1 +
            //output cost gemini
            (
                ((ocr_response?.usageMetadata?.candidatesTokenCount ?? 0)/ 1000000) +
                ((memory_response.usageMetadata?.candidatesTokenCount ?? 0) / 1000000) *
                    0.4) +
            open_ai_meta_data.total_cost;

        const db_create_message = await create_message(
            uid as string,
            chat_id,
            JSON.stringify(query ?? ''),
            JSON.stringify(open_ai_response ?? ''),
            context_prompt_tokens,
            open_ai_meta_data.total_prompt_token +
                (memory_response.usageMetadata?.promptTokenCount as number) +
                (ocr_response?.usageMetadata?.promptTokenCount ?? 0),
            open_ai_meta_data.total_completions_token +
                (memory_response.usageMetadata
                    ?.candidatesTokenCount as number) +
                (ocr_response?.usageMetadata?.candidatesTokenCount ?? 0),
            total_cost,
            model
        );
        //optional
        if (file_meta_data.length > 0) {
            await create_file_metadata(
                chat_id,
                db_create_message,
                file_meta_data
            );
        }

        await update_credit_upload({
            credit_type: "subtract",
            credit_value: total_cost,
            uid: uid as string,
            upload_type: "subtract",
            upload_value: file_meta_data.length ?? 0,
        })

        return db_create_message;
    } catch (error) {
        throw error;
    }
}
