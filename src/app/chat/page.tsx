'use client'
import User_chat_bubble from "@/app/Components/SelfComponent/chat_ui/user_chat_bubble";
import Response_chat_buble from "@/app/Components/SelfComponent/chat_ui/response_chat_buble";
import {useEffect, useState} from "react";
import {Chats, EditMessage, Message, SendMessage} from "@/app/Types/chat_types/chat_types";
import {useMutation, useQuery} from '@tanstack/react-query'
import Chat_input from "@/app/Components/SelfComponent/chat_ui/chat_input";
import {useQueryClient} from "@tanstack/react-query";
import {toast, Toaster} from "sonner";
import {Loader} from "lucide-react";
import Chat_navbar from "@/app/Components/SelfComponent/chat_ui/Chat_navbar";
import {useRouter, useSearchParams} from "next/navigation";
import {AppSidebar} from "@/app/Components/SelfComponent/sidebar/app-sidebar";
import {Button} from "@/components/ui/button";
import Greetings_component from "@/app/Components/SelfComponent/chat_ui/Greetings_component";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/Firebase/config";


export default function Chat(){
    const [sendMessage, SetSendMessage] = useState<SendMessage>();
    const [isSending, setIsSending] = useState<boolean>(false);
    const [user, loading, error] = useAuthState(auth);
    const [edit, setEdit] = useState<EditMessage>({isEditing: false});
    const [navbar_title, setNavbarTitle] = useState("New Chat");
    const queryClient = useQueryClient();
    const [newChatFunction_for_greeting, setNewChatFunction_for_greeting] = useState<any>(null);



    //read chat_id from url then adjust accordingly
    const params = useSearchParams()
    const chat_id = params.get("chat_id")

    useEffect(() => {
        if(!chat_id) return;
        const fetch_data = async()=>{
            const fetch_data = await fetch(`api/chat/read?chat_id=${chat_id}`,{
                method: 'POST'
            });
            const data = await fetch_data.json();
            console.log(data);
            setNavbarTitle(data.response[0].chat_title ?? "New Chat");
        }
        fetch_data()
    }, [params]);


    const mutator = useMutation({
        mutationFn: async (message:SendMessage) => {
            const formdata = new FormData();
            formdata.append('query',JSON.parse(message.prompt))
            if(message.file.length >0){
                for(let file of message.file){
                    formdata.append('file',file);
                }
            }
            const result = await fetch(`${message.api_url}&chat_id=${chat_id}`,{
                method: "POST",
                body: formdata,
            })
            if(!result.ok){
                if(result.status === 402){
                    toast.error('You have exceeded the credit limit.');
                    throw new Error( 'You have exceeded the credit limit. Please contact the admin! ' );
                }
                else{
                    throw new Error( 'Error Occurred Please try again later.');

                }
            }
            return result.json()
        },
        onSuccess: async (api_response) => {
            queryClient.setQueryData(['message',chat_id],(old_data: Message[])=>{
                    setIsSending(false)
                    setNavbarTitle(api_response.meta_data.title)
                    queryClient.setQueryData(['sidebar',auth.currentUser?.uid], (original_arr:Chats[])=> {
                       return original_arr.map((element: Chats)=>(
                           element.chat_id == chat_id ? (
                               {...element, chat_title: api_response.meta_data.title}
                           ): (element)
                       ))
                    })
                    return old_data.map((message_obj)=>(
                        message_obj.status == 'loading' ? (
                            {...message_obj, message: JSON.stringify(api_response.response), status: 'success' }
                        ) : (message_obj.message_id ==null ? {...message_obj, message_id: api_response.message_id}  :message_obj)
                    ))
        }
            )
        },
        onError: async (error) => {
            queryClient.setQueryData(['message',chat_id],(old_data: Message[])=>{
                    setIsSending(false)
                    return old_data.map((message_obj)=>(
                        message_obj.status == 'loading' ? (
                            {...message_obj,message: JSON.stringify(error.message), status: 'error' }
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
                "message_id": null,
                "file_meta_data": sendMessage?.file.map((file_obj)=>({file_name: file_obj.name}))
            },
            {
                role: sendMessage?.llm,
                message: '',
                created_at: new Date().toISOString(),
                status: "loading",
            }
        ]
        if(edit.isEditing){
            edit_delete(edit.message_id_editing as number,chat_id as string)
            const in_edit_index = message?.findIndex(value => value.message_id == edit.message_id_editing)
            queryClient.setQueryData(['message',chat_id],(old_data )=>(
                (old_data as Message[]).slice(0,in_edit_index as number)
                )
            )
            setEdit({isEditing: false, message_id_editing:undefined, prompt:undefined})
        }

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

            <div className={`relative w-full min-h-screen pt-0 m-0 flex flex-col items-center justify-center `}>
                <Toaster className={'z-100'}  position="top-right"/>

                {!isLoading && !isError && chat_id ?(
                    <>
                        <Chat_navbar   navbar_title={navbar_title} className={'sticky top-0 z-10 py-4 w-full bg-neutral-900'}/>
                        <div  className='p-4 w-full flex-1   max-w-250 flex flex-col gap-4 bg-black'>
                            {
                                (message as Message[]).length > 0?(message?.map(({ message_id, role, message, created_at, file_meta_data, status}: Message, index) => {
                                    if (role === "user") {
                                        return <User_chat_bubble key={index} username={ user?.displayName ?? 'User'} user_prompt={message}
                                                                 time={created_at}
                                                                 message_id={message_id as number}
                                                                 file_meta_data={file_meta_data ?? []}
                                                                 SetEdit={setEdit}
                                        />
                                    } else {
                                        return <Response_chat_buble key={index} llm_model={role} llm_response={message}
                                                                    time={created_at} state={status}/>
                                    }
                                })): <p className={'my-auto font-bold text-lg text-neutral-100 px-4 text-center'}>
                                    👋 Hey {user?.displayName? user.displayName : ''}! Ready to chat about anything on your mind?
                                </p>
                            }
                        </div>
                        <Chat_input className={'sticky px-4 w-full bg-neutral-900 rounded-t-2xl py-4 bottom-0 z-10'}
                                    isSending={isSending} sendToParent={SetSendMessage}
                                    editObject={edit}
                                    SetEditing={setEdit}
                        />
                    </>):(!isLoading && !chat_id? <Greetings_component />:<Loader size={32} className={'animate-spin text-white'}/>)}
            </div>
        </AppSidebar>
    )
}
async function edit_delete(message_id:number, chat_id:string){
    const result = await fetch(`api/message/delete?message_id=${message_id}&chat_id=${chat_id}`,{
        method: "DELETE",
    })
}