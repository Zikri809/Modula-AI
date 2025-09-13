import createClient from "@/utils/supabase/server";


export default async function (uid:string){
    if(!uid) throw new Error('missing uid in get credit and upload')

    const supabase = await createClient()

    const {data, error} = await supabase.from('users')
        .select('credit_remain,free_upload_remain')
        .eq('uid',uid).single()
    if(error) throw error
    return data
}