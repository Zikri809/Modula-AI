import {QueryClient, useQuery, useQueryClient} from "@tanstack/react-query";
import {PanelLeft} from "lucide-react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Chats} from "@/app/Types/chat_types/chat_types";




export default function ({chat_id, className}:React.HTMLAttributes<HTMLDivElement> &{chat_id:string}) {
    const {data, isError , isLoading} = useQuery<{response: Chats[]}>({
        queryKey: ['chat_title',chat_id],
        queryFn: async() =>{
            const result = await fetch(`api/chat/read?chat_id=${chat_id}`,{
                method: "POST",
            })
            return result.json()
        },

    })

    return (
        <nav className={`flex flex-row gap-2 items-center p-4 text-white  ${className}`}>
            <SidebarTrigger size={"lg"} className={''}/> <Separator className={'bg-neutral-400'} orientation={'vertical'}/>
            {!isLoading?<p className={'font-bold line-clamp-1'}>{data?.response[0].chat_title ?? 'New Chat'}</p>: <></>}
        </nav>
    )
}