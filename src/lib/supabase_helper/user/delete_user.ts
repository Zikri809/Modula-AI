import createClient from '@/utils/supabase/server'

export async function delete_user(uid:string){
   if(!uid ) throw new Error(`please provide the uid in the function`)
    const supabase = await createClient()

    try{
       const {error} = await supabase.from('users').delete().eq('uid',uid)
        if(error) throw error
        return true
    }
   catch(err){
       throw err;
   }
}