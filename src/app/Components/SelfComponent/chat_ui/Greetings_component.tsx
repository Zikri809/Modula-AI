
import {Button} from "@/components/ui/button";
import {SidebarTrigger} from "@/components/ui/sidebar";
import {Separator} from "@/components/ui/separator";
import {toast} from "sonner";
import {useRouter} from "next/navigation";


export default function(){
    const router = useRouter();
    async function createNewChat(){
        try{
            const result = await fetch(`api/chat/create`,{
                method: "POST",
            })
            const json_result = await result.json();
            router.replace(`/chat?chat_id=${json_result.chat_id}`);
        }
        catch(err){
            toast.error('Failed to create a chat. Try again !');
        }
    }

    return (
        <>
            <nav className={'w-full flex flex-row gap-2 h-10 items-center sticky top-0 bg-black'}>
                <SidebarTrigger size={'lg'} className={''}/>

            </nav>
            <div className={'w-full h-[calc(100%-40px)] flex flex-col items-center gap-4 px-6 justify-center text-white'}>
                <p className={'font-bold text-xl text-center'}>Start Chatting with Me, Your Personalized chatbot</p>
                <Button onClick={createNewChat} className={'bg-neutral-800 hover:bg-neutral-700 text-white'}>Start New Chat</Button>
            </div>
        </>
    )
}