import {QueryClient, useQuery, useQueryClient} from "@tanstack/react-query";
import {PanelLeft} from "lucide-react";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {Chats} from "@/app/Types/chat_types/chat_types";




export default function ({navbar_title,  className}:React.HTMLAttributes<HTMLDivElement> &{navbar_title:string}) {


    return (
        <nav className={`flex flex-row gap-2 items-center p-4 text-white  ${className}`}>
            <SidebarTrigger size={"lg"} className={''}/> <Separator className={'bg-neutral-400'} orientation={'vertical'}/>
            <p className={'font-bold line-clamp-1'}>{navbar_title}</p>
        </nav>
    )
}