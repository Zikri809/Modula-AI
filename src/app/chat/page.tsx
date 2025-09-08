'use client'
import User_chat_bubble from "@/app/Components/SelfComponent/chat_ui/user_chat_bubble";
import Response_chat_buble from "@/app/Components/SelfComponent/chat_ui/response_chat_buble";
import {useEffect, useState} from "react";
import {Message, SendMessage} from "@/app/Types/chat_types/chat_types";
import {useMutation, useQuery} from '@tanstack/react-query'
import Chat_input from "@/app/Components/SelfComponent/chat_ui/chat_input";
import {useQueryClient} from "@tanstack/react-query";
import {Toaster} from "sonner";
import {Loader} from "lucide-react";
import Chat_navbar from "@/app/Components/SelfComponent/chat_ui/Chat_navbar";
import {useRouter, useSearchParams} from "next/navigation";
import {AppSidebar} from "@/app/Components/SelfComponent/sidebar/app-sidebar";
import {Button} from "@/components/ui/button";
import Greetings_component from "@/app/Components/SelfComponent/chat_ui/Greetings_component";


export default function Chat(){
    const [sendMessage, SetSendMessage] = useState<SendMessage>();
    const [isSending, setIsSending] = useState<boolean>(false);
    const [rerender_navbar_key, SetRerenderNavbar_key] = useState<string>(crypto.randomUUID());
    const queryClient = useQueryClient();
    
    //read chat_id from url then adjust accordingly
    const params = useSearchParams()
    const chat_id = params.get("chat_id")

    const mutator = useMutation({
        mutationFn: async (message:SendMessage) => {
            const formdata = new FormData();
            formdata.append('query',JSON.parse(message.prompt))
            if(message.file.length >0){
                for(let file of message.file){
                    formdata.append('file',file);
                }
            }
            const result = await fetch(`${message.api_url}?chat_id=${chat_id}`,{
                method: "POST",
                body: formdata,
            })
            return result.json()
        },
        onSuccess: async (api_response) => {
            queryClient.setQueryData(['message',chat_id],(old_data: Message[])=>{
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
            queryClient.setQueryData(['message',chat_id],(old_data: Message[])=>{
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

        queryClient.setQueryData(['message',chat_id],(old_data)=>(
            [...old_data as Message[],...message_obj]
            )
        )
        SetSendMessage(undefined)
        console.log('message is sending',sendMessage)
    },[sendMessage])



    const {data:message, isError ,isLoading} = useQuery<Message[]>({
        queryKey: ['message',chat_id],
        queryFn: async():Promise<Message[]> =>{
            try{
                const fetch_messages = await fetch(`api/message/read?chat_id=${chat_id}`, {
                    method: 'POST',
                })
                if (!fetch_messages) return []
                return await fetch_messages.json();
            } catch (e){
                console.log(e)
                throw e
            }
        },
        enabled: chat_id? true : false,
    })
    useEffect(() => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        })
    }, [message]);
    return (
        <AppSidebar chat_id={chat_id as string}>

            <div className={`relative w-full min-h-screen  flex flex-col items-center justify-center`}>
                <Toaster className={'z-100'}  position="top-right"/>

                {!isLoading && !isError && chat_id ?(
                    <>
                        <Chat_navbar  chat_id={chat_id} className={'sticky top-0 z-10 py-4 w-full bg-neutral-900'}/>
                        <div  className='p-4 w-full min-h-[76dvh] h-fit overflow-hidden max-w-250 flex flex-col gap-4 bg-black'>
                            {
                                (message as Message[]).length > 0?(message?.map(({role, message, created_at, file_meta_data, status}: Message, index) => {
                                    if (role === "user") {
                                        return <User_chat_bubble key={index} username={role} user_prompt={message}
                                                                 time={created_at}
                                                                 file_meta_data={file_meta_data}/>
                                    } else {
                                        return <Response_chat_buble key={index} llm_model={role} llm_response={message}
                                                                    time={created_at} state={status}/>
                                    }
                                })): <p className={'my-auto font-bold text-lg text-neutral-300 px-4 text-center'}>Modula AI - multi LLM chatbot with memory of you as we engage !</p>}
                        </div>
                        <Chat_input className={'sticky px-4 w-full bg-neutral-900 rounded-t-2xl py-4 bottom-0 z-10'} isSending={isSending} sendToParent={SetSendMessage}/>
                    </>):(!isLoading && !chat_id? <Greetings_component/>:<Loader size={32} className={'animate-spin text-white'}/>)}
            </div>
        </AppSidebar>
    )
}