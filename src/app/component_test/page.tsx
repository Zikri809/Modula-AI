'use client'

import Llm_waiting_animation from "@/app/Components/SelfComponent/chat_ui/Llm_waiting_animation";
import {Toaster} from "sonner";export default function (){
    return (

        <div className={'p-2 pt-10 top-50 max-w-full min-h-screen'}>
            <Toaster richColors position="top-right"/>
            <Llm_waiting_animation/>
        </div>
    )
}