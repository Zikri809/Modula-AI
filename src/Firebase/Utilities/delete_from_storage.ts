import { bucket } from '@/Firebase/firebase-admin/firebase_admin';

//this method returns a blob object that can be used to upload to gemini api
export default async function delete_from_storage(file_path: string){
    if(!file_path) throw new Error('No file path provided');
    try{
        const file_ref = bucket.file(file_path);
        const [exists] = await file_ref.exists();
        if (!exists) throw new Error('file path provided had no file');
        const [deleted] = await file_ref.delete({ignoreNotFound: true});
    }
    catch(error){
        throw error;
    }
}