
import {User_message_bubble} from "@/app/Types/chat_types/chat_types";

export default function user_chat_bubble({username,user_prompt,time}:User_message_bubble) {
    return(
        <div className='text-sm sm:text-base flex flex-col gap-2 bg-black broder-b-1 border-neutral-500 h-fit w-full text-white'>
            <p className='pr-1 text-right bg-blcak text-white'>{username}</p>
            <div className='text-right px-4 text-sm sm:text-base bg-neutral-800 w-fit rounded-md p-2 self-end' >
                {JSON.parse(user_prompt)}
            </div>
            <p className='pr-1 sm:text-sm text-neutral-400 text-right'>{new Date(time).toLocaleTimeString()}</p>
        </div>
    )
}