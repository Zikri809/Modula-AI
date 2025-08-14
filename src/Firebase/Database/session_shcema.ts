import {Part} from "@google/genai";

interface FileMetaDataFile {
    storageRef: string;
    original_name: string;
    size: number;
    file_type: string;
    extracted_text_ref: string;
    confidence_level: number;
}

interface GeminiMetaData {
    upload_exipration_date: string //ISO string
    uploaded_file: Part[]
}

interface UploadedFile {
    storageRef: string;
    original_name: string;
    file_type: string;
}

interface Conversation {
    index: number;
    user_prompt: string;
    uploaded_files: UploadedFile[];
    assistant_response: string;
    llm_model: string;
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    cost: number;
}

interface FileMetaData {
    files: FileMetaDataFile[];
}

interface SessionSchema {
    sessionID: string;
    uid: string;
    createdAt: string; // ISO Date string
    modifiedAt: string; // ISO Date string
    file_meta_data: FileMetaData;
    GeminiMetaData: GeminiMetaData //this helps us to use the existing file uploaded to gemini as part of context on subsequent request with 48h of upload
    conversations: Conversation[];
}


export type {FileMetaData, FileMetaDataFile, UploadedFile, Conversation, SessionSchema, GeminiMetaData}
