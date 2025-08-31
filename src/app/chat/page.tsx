'use client'
import User_chat_bubble from "@/app/Components/SelfComponent/chat_ui/user_chat_bubble";
import Response_chat_buble from "@/app/Components/SelfComponent/chat_ui/response_chat_buble";
import {useState} from "react";
import {Message} from "@/app/Types/chat_types/chat_types";
import { useQuery } from '@tanstack/react-query'
export default function Chat(){
    const {data:message, isError ,isLoading} = useQuery<Message[]>({
        queryKey: ['message'],
        queryFn: async() =>{
            try{
                const fetch_messages = await fetch('api/message/read?chat_id=d1272d65-4f09-4f01-9fbe-1c90bbf274ad', {
                    method: 'POST',
                })
                return await fetch_messages.json();
            } catch (e){
                console.log(e)
                throw e
            }
        },
    })
    return (
        <div className='p-4 w-full h-fit overflow-hidden flex flex-col gap-4 bg-black'>
            {!isLoading && !isError ?(
                message?.map(({role, message, created_at}: Message,index) => {
                if (role === "user") {
                    return <User_chat_bubble key={index} username={role} user_prompt={message} time={created_at}/>
                } else {
                   return <Response_chat_buble key={index} llm_model={role} llm_response={message} time={created_at}/>
                }
            })
            ):<div className='text-white text-center text-3xl'>......</div>}

        </div>
    )
}