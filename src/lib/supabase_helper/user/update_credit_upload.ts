import createClient from "@/utils/supabase/server";
import {error} from "effect/Brand";


type Params = {
    credit_type?: 'add' | 'subtract'
    credit_value?: number,
    uid:string,
    upload_type?: 'add' | 'subtract',
    upload_value?: number,


}
//this returns the current updated value of credit and upload limit
export default async function ({ credit_type, credit_value,uid,upload_value,upload_type }: Params  ) {
    if(!credit_type || !credit_value) throw new Error('missing credit_type or credit_value');
    if(!uid) throw new Error('missing uid');
    if(upload_value == undefined || !upload_type) throw new Error('missing upload_value and upload_type');

    //get current value
    const supabase = await  createClient()
    const {data:current_data, error:current_error} = await supabase.from('users')
        .select('credit_remain,free_upload_remain')
        .eq('uid',uid).single()
    if(current_error) throw current_error
    const {credit_remain:current_credit_remain ,free_upload_remain:current_upload_remain} = current_data

    if(credit_type==='add' && credit_value) {
        current_data.credit_remain = current_credit_remain + credit_value
    }
    else if(credit_type==='subtract' && credit_value) {
        current_data.credit_remain = current_credit_remain - credit_value
    }

    if(upload_type === 'add' && upload_value ){
        current_data.free_upload_remain = current_upload_remain + upload_value
    }
    else if(upload_type==='subtract' && upload_value ){
        current_data.free_upload_remain = current_upload_remain - upload_value
    }

    //insert back to db

    const {data:updated_data , error:updated_error} = await supabase.from('users').update(current_data)
        .eq('uid',uid).single()
    if(updated_error) throw updated_error
    return updated_data
}