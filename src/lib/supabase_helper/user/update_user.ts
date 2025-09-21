import createClient from '@/utils/supabase/server';
import { z } from 'zod';
import read_user from '@/lib/supabase_helper/user/read_user';

const update_schema = z.object({
    plan: z.enum(['free', 'paid']).optional(),
    email: z.string().email().optional(), // e.g. "free", "premium", etc.
    user_details: z.array(z.string()).optional(),
    credit_remain: z.number().min(0).optional(), // Remaining tokens for the user, e.g. 5000
    free_upload: z.number().int().min(0).optional(),
});

export default async function update_user(
    uid: string,
    request_body: any,
    user_details_operation?:  string | null | 'add' | 'remove'
) {
    const supabase = await createClient();
    //construct update_field for postgres
    const parsed = update_schema.strict().safeParse(request_body);
    const { data, error } = parsed;
    if (error) throw error;
    //this is to be added one
    let user_details = data.user_details ?? [];
    try {
        if (user_details && user_details.length > 0 && user_details_operation) {
            let { data: read_data, error: read_error } = await supabase
                .from('users')
                .select('user_details')
                .eq('uid', uid)
                .single();
            if (read_error || !read_data) throw read_error;
            console.log(
                'previous memory before updating is \n',
                read_data.user_details
            );
            read_data.user_details = read_data?.user_details ?? [];
            if (user_details_operation === 'add') {
                for (const element of user_details) {
                    read_data?.user_details.push(element);
                }
            }
            else {
                for (const element of user_details) {
                    if (read_data?.user_details.includes(element)) {
                        const index_to_remove = read_data.user_details.indexOf(element);
                        read_data.user_details.splice(index_to_remove, 1);
                    }
                }
            }
            //overwrite the element to add or remove arr with new arr combined from original and modified
            data.user_details = Array.from(
                new Set(read_data?.user_details as string[])
            );
        } else {
            //if no update on memory delete the key thus prevent overwrite in db
            delete data.user_details;
        }
        //add to db
        //no update in payload exit early
        if (Object.keys(data).length == 0) return true;
        const { data: update_data, error: update_error } = await supabase
            .from('users')
            .update(data)
            .eq('uid', uid)
            .single();
        if (update_error) throw update_error;
        return true;
    } catch (error) {
        throw error;
    }
}
