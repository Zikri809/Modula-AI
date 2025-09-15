
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import {model_combo_box_list} from "@/app/Components/SelfComponent/chat_ui/llm_array";

type TransactionCard = {
    chat_title: string;
    total_cost: number;
    input_token: number;
    output_token: number;
    created_at: string;
    llm: string
}

export default function({chat_title,total_cost,input_token,output_token,created_at,llm}: TransactionCard) {
    return(
        <div className={'bg-transparent border-2 border-neutral-500 p-4 rounded-md flex flex-col gap-2 w-full'}>
            <div className={'flex flex-row justify-between items-center text-white'}>
                <p className={'line-clamp-1 text-sm'}>{chat_title}</p>
                <Badge className={'ml-6 text-xs flex flex-row gap-2 items-center'} variant={'default'}>
                    {llm ?model_combo_box_list[model_combo_box_list.findIndex(value => value.label == llm )].icon : <></>}
                    {llm}
                </Badge>
            </div>
            <p className={'text-white text-xl font-semibold'}>{total_cost} Credits</p>
            <div className={'text-xs flex flex-row justify-between items-center text-neutral-400'}>
                <p>Input tokens: {input_token}</p>
                <p>Output tokens: {output_token}</p>
            </div>
            <p className={'leading-0 text-xs text-neutral-400'}>{formatDistanceToNow(new Date(created_at), { addSuffix: true }).replace(/^./, c => c.toUpperCase())}</p>

        </div>
    )
}