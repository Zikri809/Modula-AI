import verifyJWT from "@/lib/jwt/verifyJWT";
import {NextRequest, NextResponse} from "next/server";
import {db} from "@/Firebase/firebase-admin/firebase_admin";

export async function GET(request: NextRequest) {
    //we verify the request by the cookies 
    //NOTE: if a rquest to this endpoint is made from another api makesure to pass the cookies along 
    //auth layer
    const api_token = request.cookies.get('api_token')?.value
    if (!api_token) return NextResponse.json({error: 'No token present in the request'}, {status: 401})
    const JWT_token_payload = await verifyJWT(api_token)
    if (!JWT_token_payload) return NextResponse.json({error: 'invalid token possibly expired '}, {status: 401})

    const {uid} = JWT_token_payload
    //type in the params allow us to choose specific fields
    const url = new URL(request.url)
    const req_type = url.searchParams.get('type')
    const req_field = ['uid', 'plan', 'email', 'sessionIDs', 'token_remain', 'free_upload', null]
    if (req_field.indexOf(req_type) == -1) return NextResponse.json({message: 'Invalid request type in the params '}, {status: 400})
    //retriving user data based on the token containg the uid
    try {
        const collection = db.collection('user')
        const user_data = await collection.doc(uid as string).get()
        if (!user_data.exists) return NextResponse.json({
            message: ' The doc with the uid does not exist in the db',
            uid: uid
        }, {status: 404})
        if (!req_type) {
            return NextResponse.json({user_data: user_data.data()}, {status: 200})
        }
        const field_data = user_data.get(req_type)
        return NextResponse.json({field_specific_data: field_data}, {status: 200})
    } catch (error) {
        console.log('error occured', error)
        return NextResponse.json({
            message: "Error trying to retrieve user data",
            error: String(error),
            uid: uid
        }, {status: 500})
    }

}

/*
test GET localhost:3000/api/user/find
*/ 