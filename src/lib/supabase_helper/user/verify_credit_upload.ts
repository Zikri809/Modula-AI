import Read_credit_upload from "@/lib/supabase_helper/user/read_credit_upload";
import {NextResponse} from "next/server";


export default async function (uid:string,file_arr_length:number){
    try{
        const {credit_remain} = await  Read_credit_upload(uid)
        if (credit_remain <=0){
            return false
        }
        return true

    }
    catch(error){
        console.dir(error,{depth:10});
        return false
    }


}