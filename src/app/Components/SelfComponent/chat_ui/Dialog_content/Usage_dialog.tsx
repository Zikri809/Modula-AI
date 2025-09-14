import {DialogTitle} from "@/components/ui/dialog";
import {useEffect, useState} from "react";
import Transaction_card from "@/app/Components/SelfComponent/chat_ui/Dialog_content/Transaction_card";
import { Loader2Icon} from "lucide-react";
import { Badge } from "@/components/ui/badge"

type Transaction = {
    total_input_tokens: number,
    "response_tokens": number,
    "total_cost": number,
    "llm_model": string,
    created_at: string,
    "Chats": {
        "chat_title": string,
    }
}


export default function(){
    const [creditRemain, setCreditRemain] = useState<number>( 0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(()=>{
        async function fetchRemaining(){
            const result = await fetch("api/user/get_credit",{
                method: "GET",
            });
            const data = await result.json();
            setCreditRemain(data.credit_remain);
        }
        fetchRemaining();
    },[])

    useEffect(() => {
        async function fetchTransaction(){
            const result = await fetch('api/user/transaction?offset=0',{
                method: "GET",
            })
            const data = await result.json();
            setTransactions(data);
            setLoading(false);
        }
        fetchTransaction();
    }, []);

    return(
        <>

            <DialogTitle className={'mt-2 flex flex-row items-center justify-between'}>
                <p className={'text-2xl'}>Usage</p>
                <div>
                    <Badge className={'mr-0 text-sm'} variant={'default'}>Balance: {creditRemain}</Badge>
                </div>
            </DialogTitle>
            <p> Recent {transactions.length} Transactions</p>
            <div className={'thin-scrollbar-y flex flex-col items-center overflow-auto gap-2 w-full max-h-70'}>
                { transactions.length > 0 ?
                    transactions.map(({created_at,total_input_tokens,total_cost,response_tokens,llm_model,Chats}: Transaction,index) => (
                        <Transaction_card
                            key={index}
                            input_token={total_input_tokens}
                            output_token={response_tokens}
                            llm={llm_model}
                            total_cost={total_cost}
                            chat_title={Chats.chat_title}
                            created_at={created_at}
                        />
                    )):(loading ?<Loader2Icon className={'animate-spin text-white'} />:<p>No Transaction Recorded Yet</p>)
                }
            </div>
        </>
    )
}