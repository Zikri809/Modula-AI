import {NextResponse} from "next/server";
import {cookies} from "next/headers";


export  async function PATCH(){
    try{
        let response = NextResponse.json({message: 'success cleared token'},{status:200})
        response.cookies.delete('api_token')
        return response;
    }
    catch(err){
        console.log(err);
        return NextResponse.json({error: String(err)},{status:500})
    }
}