jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        getAll: () => [],
        set: jest.fn(),
    }))
}))


import update_user from "@/lib/supabase_helper/user/update_user";
import createClient from "@/utils/supabase/server";

const testing_uid =process.env.TESTING_UID as string;
async function read_user():Promise<{
    uid: string;
    email: string;
    credit_remaining: number,
    plan: 'free',
    free_upload_remain: number,
    user_details: string[],}> {
    const supabase = await createClient()
    const {data} = await supabase.from("users").select('*').eq('uid',testing_uid).single()
    return data
}

async function db_cleanup():Promise<void> {
    const supabase = await createClient()
    const {data,error } = await supabase.from("users")
        .update(
            {
                user_details: [],
            }
        ).eq('uid',testing_uid).select('*')
    //console.log('clean up error ',error)

}
//resets the column
 beforeEach(async () => {
 await db_cleanup()
})

 afterEach(async () => {
    await db_cleanup()
})

test('update user - user details column - addition with previous value presence', async () => {
    const supabase = await createClient()
    const {data,error} = await supabase.from("users").update({user_details:['the only one']}).eq('uid',testing_uid).select('*')
    //console.log('error is ',error)
    await update_user(
        testing_uid,
        {
            user_details: ['another one']
        },
        "add"
    )

    const read_actual = await read_user()
    console.log('actual of previous value presence', read_actual)
    expect(read_actual).toMatchObject({
        user_details: ['the only one','another one'],
    })
})


test("update_user - user details column - addition", async () => {

        await update_user(
           testing_uid,
           {
               user_details:['testing_common_add','another one']
           },
           'add'
        )


    const read_actual = await read_user()
    expect(read_actual).toMatchObject({
        user_details: ['testing_common_add','another one'],
    })

})

test("update_user - user details column - duplicate addition", async () => {


      await update_user(
         testing_uid,
         {
             user_details:['testing_common_add','testing_common_add','should_preserve']
         },
         'add'
     )

    const read_actual = await read_user()
    expect(read_actual).toMatchObject({
        user_details: ['testing_common_add','should_preserve'],
    })

})

test("update_user - user details column -  delete", async () => {
    const supabase = await createClient()
    await supabase.from("users").update({user_details:['testing_common_add']}).eq('uid',testing_uid)


        await update_user(
           testing_uid,
           {
               user_details:['testing_common_add']
           },
           'remove'
        )

    const read_actual = await read_user()
    expect(read_actual).toMatchObject({
        user_details: [],
    })

})


test("update_user - user details column -  delete dupes", async () => {
    const supabase = await createClient()
    await supabase.from("users").update({user_details:['testing_common_add','should_remain']}).eq('uid',testing_uid)


        await update_user(
           testing_uid,
           {
               user_details:['testing_common_add','testing_common_add']
           },
           'remove'
        )

    const read_actual = await read_user()
    expect(read_actual).toMatchObject({
        user_details: ['should_remain'],
    })
})

test("update_user - credit_remain column -  updating value", async () => {


    await update_user(
        testing_uid,
        {
            credit_remain:1.5,
        },
    )

    const read_actual = await read_user()
    expect(read_actual).toMatchObject({
        credit_remain:1.5,
    })
})