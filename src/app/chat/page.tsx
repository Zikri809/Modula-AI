'use client'
import User_chat_bubble from "@/app/Components/SelfComponent/chat_ui/user_chat_bubble";
import Response_chat_buble from "@/app/Components/SelfComponent/chat_ui/response_chat_buble";
import {useEffect, useState} from "react";
import {Message, SendMessage} from "@/app/Types/chat_types/chat_types";
import {useMutation, useQuery} from '@tanstack/react-query'
import Chat_input from "@/app/Components/SelfComponent/chat_ui/chat_input";
import {useQueryClient} from "@tanstack/react-query";
import {Toaster} from "sonner";



export default function Chat(){
    const [sendMessage, SetSendMessage] = useState<SendMessage>();
    const [isSending, setIsSending] = useState<boolean>(false);
    const queryClient = useQueryClient();
    const mutator = useMutation({
        mutationFn: async (message:SendMessage) => {
            const formdata = new FormData();
            formdata.append('query',JSON.parse(message.prompt))
            if(message.file.length >0){
                for(let file of message.file){
                    formdata.append('file',file);
                }
            }
            const result = await fetch(`${message.api_url}?chat_id=d1272d65-4f09-4f01-9fbe-1c90bbf274ad`,{
                method: "POST",
                body: formdata,
            })
            return result.json()
        },
        onSuccess: async (api_response) => {
            queryClient.setQueryData(['message'],(old_data: Message[])=>{
                    setIsSending(false)
                    return old_data.map((message_obj)=>(
                        message_obj.status == 'loading' ? (
                            {...message_obj, message: JSON.stringify(api_response.response), status: 'success' }
                        ) : message_obj
                    ))
        }
            )
        },
        onError: async () => {
            queryClient.setQueryData(['message'],(old_data: Message[])=>{
                    setIsSending(false)
                    return old_data.map((message_obj)=>(
                        message_obj.status == 'loading' ? (
                            {...message_obj, status: 'error' }
                        ) : message_obj
                    ))
        }
            )
        }

    })

    //this get triggered only when user send a message
    useEffect(()=>{
        if(!sendMessage) return;
        mutator.mutate(sendMessage as SendMessage)
        setIsSending(true)
        const message_obj = [
            {
                "role": "user",
                "message": sendMessage?.prompt,
                "created_at": new Date().toISOString(),
                "file_meta_data": sendMessage?.file.map((file_obj)=>({file_name: file_obj.name}))
            },
            {
                role: sendMessage?.llm,
                message: '',
                created_at: new Date().toISOString(),
                status: "loading",
            }
        ]

        queryClient.setQueryData(['message'],(old_data)=>(
            [...old_data as Message[],...message_obj]
            )
        )
        SetSendMessage(undefined)
        console.log('message is sending',sendMessage)
    },[sendMessage])



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
    useEffect(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        })
    }, [message]);
    return (
        <div className={'relative w-full  flex flex-col items-center '}>
            <Toaster className={'z-100'} richColors={true} position="top-right"/>
            <div className='p-4 w-full h-fit overflow-hidden max-w-150 flex flex-col gap-4 bg-black'>
                {!isLoading && !isError ?(
                    message?.map(({role, message, created_at,file_meta_data,status}: Message,index) => {
                    if (role === "user") {
                        return <User_chat_bubble key={index} username={role} user_prompt={message} time={created_at} file_meta_data={   file_meta_data}/>
                    } else {
                       return <Response_chat_buble key={index} llm_model={role} llm_response={message} time={created_at} state={status} />
                    }
                })
                ):<div className='text-white text-center text-3xl'>......</div>}

            </div>
            <Chat_input className={'sticky px-4 w-full bg-neutral-900 rounded-t-2xl py-4 bottom-0 z-10'} isSending={isSending} sendToParent={SetSendMessage}/>
        </div>
    )
}