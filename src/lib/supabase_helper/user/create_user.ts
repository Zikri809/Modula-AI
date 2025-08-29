import createClient from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export default async function create_user(uid: string, email: string) {
    if (!uid) throw new Error('uid is not provided to the function ');
    if (!email) throw new Error('email is not provided to the function ');
    const supabse = await createClient();

    try {
        const db = await supabse.from('users').insert([
            {
                uid: uid,
                email: email,
                credit_remain: 0,
                plan: 'free',
                free_upload_remain: 3,
                user_details: [],
            },
        ]);
        if (db.error) throw db.error;
        return true;
    } catch (err) {
        throw err;
    }
}
