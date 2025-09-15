import Read_credit_upload from "@/lib/supabase_helper/user/read_credit_upload";
import {NextResponse} from "next/server";


export default async function (uid:string,file_arr_length:number){
    try{
        const {credit_remain} = await  Read_credit_upload(uid)
        if (credit_remain <=0){
            return NextResponse.json({exceeded: true , message: 'No credit remain for your account.'},{status:402})
        }

    }
    catch(error){
        console.dir(error,{depth:10});
        return NextResponse.json(
            {
                message: 'fail to get a response from postgres',
                cause: error,
            },
            { status: 500 }
        );
    }


}