import { NextRequest, NextResponse } from 'next/server';
import verifyJWT from '@/lib/jwt/verifyJWT';
import { JWTPayload } from 'jose';
import update_user from '@/lib/supabase_helper/user/update_user';

export async function PATCH(request: NextRequest) {
    //middleware already check the existance of the api_token no need for discrete checks
    const url = new URL(request.url);
    const user_details_operation = url.searchParams.get(
        'user_details_operation'
    );

    const api_token: string = request.cookies.get('api_token')?.value as string;
    const payload = (await verifyJWT(api_token)) as JWTPayload;
    const { uid } = payload as JWTPayload;
    const json_body = await request.json();

    try {
        const db_update = await update_user(
            uid as string,
            json_body,
            user_details_operation
        );
        if (db_update)
            return NextResponse.json(
                { message: 'field updated successfully.' },
                { status: 200 }
            );
        throw new Error('update failed.');
    } catch (error) {
        console.log(error);
        return NextResponse.json(
            {
                message: 'failed to update user row ',
                uid_affected: uid,
                cause: String(error),
            },
            { status: 500 }
        );
    }
}
