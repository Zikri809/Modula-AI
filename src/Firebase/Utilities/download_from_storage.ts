import { bucket } from '@/Firebase/firebase-admin/firebase_admin';

//this method returns a blob object that can be used to upload to gemini api
export default async function download_from_storage(file_path: string) {
    if (!file_path) throw new Error('No file path provided');
    try {
        const file_ref = bucket.file(file_path);
        const [exists] = await file_ref.exists();
        if (!exists) throw new Error('file path provided had no file');
        const [metadata] = await file_ref.getMetadata();
        const [downloaded_buffer] = await file_ref.download();
        const uint8array = new Uint8Array(downloaded_buffer);
        const blob = new Blob([uint8array], { type: metadata.contentType });
        return blob;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
