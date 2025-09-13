let to_delete_arr = []
let time_out = null

self.onmessage = (event) => {
    const to_delete = event.data;
    to_delete_arr.push(to_delete);
    if( time_out !== null) {
        clearTimeout(time_out)
    }
    time_out = setTimeout(async ()=>{
        const body = JSON.stringify({user_details:to_delete_arr});
        const push_delete = await fetch('/api/user/update?user_details_operation=remove',{
            method: 'PATCH',
            body: body,
        })
        if(!push_delete) {
            console.log('worker debounced delete failed')
            return
        }
        to_delete_arr = []
        time_out = null
        console.log('worker debounced delete success')
    },2000)

}
