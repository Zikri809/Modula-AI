'use client'
import {
    Sidebar,
    SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
    SidebarHeader, SidebarMenuButton,
    SidebarMenuItem, SidebarMenuSkeleton,
    SidebarProvider,
} from "@/components/ui/sidebar"
import {useQuery} from "@tanstack/react-query";
import {BrainCog, Loader, MessageCircleDashed, MessageCirclePlus, Settings, Trash} from "lucide-react";
import {Chats} from "@/app/Types/chat_types/chat_types";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
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
import {useState} from "react";
export function AppSidebar(
    {children, chat_id}:{children:React.ReactNode, chat_id:string}
) {
    const [current_open , setCurrentOpen] = useState<string | null>(null)
    const router = useRouter();
    const {data:chat_data, isError, isLoading,refetch} = useQuery({
        queryKey: ['sidebar',auth.currentUser?.uid],
        queryFn : async () =>{
            const data = await fetch(`api/chat/read`,{
                method: "POST",
            });
            return await data.json();
        },
        retry: 3,
        placeholderData: keepPreviousData

    });

    async function createNewChat(){
        try{
            const result = await fetch(`api/chat/create`,{
                method: "POST",
            })
            const json_result = await result.json();
            refetch()
            router.replace(`/chat?chat_id=${json_result.chat_id}`);
        }
        catch(err){
            toast.error('Failed to create a chat. Try again !');
        }
    }

    function accessChat(chat_id: string){
        setCurrentOpen(chat_id)
        try{
            refetch()
            router.replace(`/chat?chat_id=${chat_id}`);
        }
        catch(err){
            toast.error('Failed to access chat. Try again !');
        }
    }

    return (
        <SidebarProvider className={'bg-black'}>

            <Sidebar side={'left'} collapsible={"offcanvas"} className={'!border-r-2 border-neutral-700'}>
                <SidebarHeader className={'border-none bg-black text-xl text-white font-bold p-4 flex flex-row items-center'}>
                    <BrainCog /> Modula AI
                </SidebarHeader>
                <SidebarContent className={'bg-black '} >
                    <SidebarMenuItem className={'flex flex-row text-white p-2'}>
                        <SidebarMenuButton onClick={createNewChat} className={' text-md hover:bg-neutral-800 hover:text-white'}>
                            <MessageCirclePlus />
                            <p>New Chat</p>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarGroup>
                        <SidebarGroupLabel className={'text-white'}>Previous Chats</SidebarGroupLabel>
                        <SidebarGroupContent key={Date.now()}>
                            {
                                !isLoading ? (
                                    ! isLoading && chat_data?.response.map((chat:Chats,index:number) => (
                                        <SidebarMenuItem key={chat.chat_id} className={` rounded-md  cursor-pointer w-full h-10 flex flex-row items-center justify-between text-white p-2`}>
                                            <SidebarMenuButton  className={`${current_open==chat.chat_id ? 'bg-neutral-700': 'bg-black'} cursor-pointer text-md hover:bg-neutral-600 hover:text-white`}>
                                                <div onClick={()=>accessChat(chat.chat_id)} className={'flex-1 flex flex-row gap-2 items-center '}>
                                                    <MessageCircleDashed className={'shrink-0'}  size={16}/>
                                                    <p className={'line-clamp-1'}>{chat.chat_title ?? 'New Chat'}</p>
                                                </div>
                                                <Trash className={'cursor-pointer ml-4 text-red-700 hover:text-white'}/>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))
                                ):(isError ? 'Error Occurred Refresh the Page' :(<p>No Previous Chat</p>))
                            }

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