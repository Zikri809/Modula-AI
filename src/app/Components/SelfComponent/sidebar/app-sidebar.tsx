'use client'
import {
    Sidebar,
    SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenuButton,
    SidebarMenuItem, SidebarMenuSkeleton,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {BrainCog, Loader, MessageCircleDashed, MessageCirclePlus, Settings, Trash} from "lucide-react";
import {Chats} from "@/app/Types/chat_types/chat_types";
import {toast} from "sonner";
import {useRouter, useSearchParams} from "next/navigation";
import {keepPreviousData} from "@tanstack/query-core";
import Profile_popover from "@/app/Components/SelfComponent/chat_ui/Profile_popover";

const sideBarMenuSkeleton = [
    <SidebarMenuSkeleton key={1}/>,
    <SidebarMenuSkeleton key={2}/>,
    <SidebarMenuSkeleton key={3}/>,
    <SidebarMenuSkeleton key={4}/>,
    <SidebarMenuSkeleton key={5}/>,
    <SidebarMenuSkeleton key={6}/>,
    <SidebarMenuSkeleton key={7}/>,
]
import { auth } from '@/Firebase/config';
import {useEffect, useRef, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";
type Create_chat = {
    message: string,
    chat_id: string,
}
export function AppSidebar(
    {children, chat_id,}:{children:React.ReactNode, chat_id:string}
) {
    const [current_open , setCurrentOpen] = useState<string | null>(null)
    const router = useRouter();
    const queryClient = useQueryClient();
    const to_delete_chat = useRef<null | string>(null)

    //highlight current opened based on the params
    useEffect(() => {
        setCurrentOpen(chat_id)
    }, [chat_id]);


    const {data:chat_data, isError, isLoading,refetch} = useQuery({
        queryKey: ['sidebar',auth.currentUser?.uid],
        queryFn : async () =>{
            const data = await fetch(`api/chat/read`,{
                method: "POST",
            });
            const json_result = await data.json();
            return json_result.response;
        },
        retry: 3,
        placeholderData: keepPreviousData

    });




    const mutator = useMutation({
        mutationFn: async () =>{
            const result = await fetch(`api/chat/create`,{
                method: "POST",
            })
            const json_result = await result.json();
            //refetch()
            if(!result.ok){
                toast.error("Failed to create chat");
                throw new Error("Failed to create chat");
                //code ends here if into this branch
            }
            setCurrentOpen(json_result.chat_id)
            router.replace(`/chat?chat_id=${json_result.chat_id}`);
            return json_result
        },
        onSuccess: async (json_result: Create_chat) => {
            console.log('mutator fired')
            queryClient.setQueryData(['sidebar',auth.currentUser?.uid], (original_arr:Chats[])=>(
                 [{chat_id:json_result.chat_id, chat_title: null},...original_arr]
            ))
            console.log('update data is ', chat_data)
        }

    })

    async function createNewChat(){
        mutator.mutate()
    }

    function accessChat(chat_id: string){
        setCurrentOpen(chat_id)
        try{
            //motive for refresh here is to get latest title from the chat
            //refetch()
            router.replace(`/chat?chat_id=${chat_id}`);
        }
        catch(err){
            toast.error('Failed to access chat. Try again !');
        }
    }

    async function deleteChat(){
        if(!to_delete_chat.current){
            toast.error("Failed to delete chat. Try again !");
            return;
        }
        const result = await fetch(`api/chat/delete?chat_id=${to_delete_chat.current}`,{
            method: "DELETE",
        })
        if(!result.ok){
            toast.error("Failed to delete chat. Try again !");
            return
        }

        queryClient.setQueryData(['sidebar',auth.currentUser?.uid], (original_arr:Chats[])=> {
            return original_arr.filter((object:Chats)=>object.chat_id != to_delete_chat.current)
        })

        //reset the variable
        setCurrentOpen(null)
        to_delete_chat.current=null;
        router.replace(`/chat`)
        toast.success("Chat Deleted successfully.");
    }

    return (
        <SidebarProvider className={'bg-black'}>

            <Sidebar side={'left'} collapsible={"offcanvas"} className={'!border-r-2 border-neutral-700'}>
                <SidebarHeader className={'border-none bg-black text-xl text-white font-bold p-4 flex flex-row items-center'}>
                    <BrainCog /> Modula AI
                </SidebarHeader>
                <SidebarContent className={'bg-black thin-scrollbar-y'} >
                    <SidebarMenuItem className={'flex flex-row text-white p-2'}>
                        <SidebarMenuButton onClick={createNewChat} className={' text-md hover:bg-neutral-800 hover:text-white'}>
                            <MessageCirclePlus />
                            <p>New Chat</p>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarGroup>
                        <SidebarGroupLabel className={'text-white'}>Previous Chats</SidebarGroupLabel>
                        <SidebarGroupContent key={Date.now()}>
                            <AlertDialog>
                                {
                                    !isLoading ? (
                                        ! isLoading && chat_data?.map((chat:Chats,index:number) => (
                                            <SidebarMenuItem key={chat.chat_id} className={` rounded-md  cursor-pointer w-full h-10 flex flex-row items-center justify-between text-white p-2`}>
                                                <div  className={`${current_open==chat.chat_id ? 'bg-neutral-700': 'bg-black'} cursor-pointer text-md hover:bg-neutral-600 hover:text-white flex flex-row items-center w-full justify-between rounded-md p-2`}>
                                                    <div onClick={()=>accessChat(chat.chat_id)} className={'flex-1 flex flex-row gap-2 items-center '}>
                                                        <MessageCircleDashed className={'shrink-0'}  size={16}/>
                                                        <p className={'line-clamp-1'}>{chat.chat_title ?? 'New Chat'}</p>
                                                    </div>
                                                    <AlertDialogTrigger onClick={()=>{to_delete_chat.current = chat.chat_id}}>
                                                        <Trash size={15} className={'cursor-pointer ml-4 text-red-700 hover:text-white'}/>
                                                    </AlertDialogTrigger>
                                                </div>
                                            </SidebarMenuItem>
                                        ))
                                    ):(isError ? 'Error Occurred Refresh the Page' :(<p>No Previous Chat</p>))
                                }
                                <AlertDialogContent className={'bg-black text-white border-none'}>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete the chat from your account
                                            and remove your data from our servers.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className={'border-none bg-neutral-600 text-white'}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={deleteChat} className={'bg-red-500'}>Continue</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>

                            </AlertDialog>


                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter className={'border-none  p-4 bg-black text-white flex flex-row gap-2 items-center'}>
                    <Profile_popover/>
                </SidebarFooter>
            </Sidebar>

            {children}
        </SidebarProvider>
    )
}