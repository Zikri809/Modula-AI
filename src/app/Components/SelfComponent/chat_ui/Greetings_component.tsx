
import {Button} from "@/components/ui/button";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {toast} from "sonner";
import {useRouter} from "next/navigation";
import {useMutation, useQueryClient} from "@tanstack/react-query";
import {auth} from "@/Firebase/config";
import {Chats} from "@/app/Types/chat_types/chat_types";

type Create_chat = {
    message: string,
    chat_id: string,
}
export default function() {
    const router = useRouter();
    const queryClient = useQueryClient();

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
            router.replace(`/chat?chat_id=${json_result.chat_id}`);
            return json_result
        },
        onSuccess: async (json_result: Create_chat) => {
            //console.log('mutator fired')
            queryClient.setQueryData(['sidebar',auth.currentUser?.uid], (original_arr:Chats[])=>(
                [{chat_id:json_result.chat_id, chat_title: null},...original_arr]
            ))
        }

    })

    async function createNewChat(){
        mutator.mutate()
    }

    return (
        <>
            <nav className={'w-full flex flex-row gap-2 h-10 items-center sticky top-0 bg-black'}>
                <SidebarTrigger size={'lg'} className={''}/>

            </nav>
            <div className={'w-full flex-1  overflow-hidden  flex flex-col items-center gap-4 px-6 justify-center text-white'}>
                <p className={'font-bold text-xl text-center'}>Start Chatting with Me, Your Personalized chatbot</p>
                <Button onClick={createNewChat} className={'bg-neutral-800 hover:bg-neutral-700 text-white'}>Start New Chat</Button>
            </div>
        </>
    )
}