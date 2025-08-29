import createClient from '@/utils/supabase/server';

export default async function read_user(uid: string) {
    if (!uid) throw new Error('uid are not provided');
    const supabse = await createClient();

    try {
        const { data, error } = await supabse
            .from('users')
            .select('*')
            .eq('uid', uid)
            .single();
        if (error) throw error;
        return data;
    } catch (err) {
        throw err;
    }
}
