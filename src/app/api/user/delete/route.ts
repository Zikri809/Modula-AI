import {NextRequest, NextResponse} from "next/server";
import {prismaClient} from "@/lib/prisma/prisma";
import verifyJWT from "@/lib/jwt/verifyJWT";
import {JWTPayload} from "jose";

export async function DELETE(request: NextRequest) {
    //assuming that the api_token is already there since the middleware already check it
    const api_token: string = request.cookies.get('api_token')?.value as string
    const payload = await verifyJWT(api_token) as JWTPayload
    const {uid} = payload
    try {
        await prismaClient.users.delete({
            where: {
                uid: uid as string,
            }
        })
        return NextResponse.json({message: "successfully deleted user row "}, {status: 200})
    } catch (error) {
        console.error('Error occured during deleting the user docs', error)
        return NextResponse.json({
            message: "error occured during deleting the user row ",
            cause: String(error)
        }, {status: 500})
    }
}
/*
* test DELETE localhost:3000/api/user/delete
* */