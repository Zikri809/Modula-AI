import {bucket} from "@/Firebase/firebase-admin/firebase_admin";

//this method returns a file path for the purpose of updating it in the postgres
export default async function upload_to_storage(file:File, uid:string) {
    if(!file) throw new Error("No file uploaded")
    try{
        const array_buffer = await file.arrayBuffer()
        const uint8array = new Uint8Array(array_buffer)
        const file_path = `users/${uid}/${file.name}`
        const file_ref = bucket.file(`users/${uid}/${file.name}`);
        await file_ref.save(uint8array);
        return file_path;
    }catch(error){
        console.error(error)
        throw error
    }
}