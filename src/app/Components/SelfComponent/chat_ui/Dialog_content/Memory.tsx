'use client'
import {useEffect, useRef, useState} from "react";
import {DialogDescription, DialogTitle} from "@/components/ui/dialog";
import {Loader2Icon, Trash2} from "lucide-react";
import {Button} from "@/components/ui/button";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export default function ShowMemory({setDialogState}: {
    setDialogState: (value: 'memory' | 'usage' | 'LogOut' | undefined | 'error') => void
}) {
    const [user_details, SetUserDetails] = useState<string[]>()
    const [processing_delete, setProcessingDelete] = useState<boolean>(false)
    const worker_ref = useRef<Worker | null>(null);

    useEffect(() => {
        if(worker_ref.current) return
        if(typeof Worker == undefined)  return;
        worker_ref.current =  new Worker('/workers/debounced_delete_user_details.js');
    }, []);

    useEffect(() => {
        async function fetch_data() {
            const result = await fetch('api/user/find', {method: 'POST'})
            if (!result.ok) {
                return setDialogState('error');
            }
            const resultJson = await result.json()
            SetUserDetails(resultJson.response.user_details)
        }

        fetch_data()
    }, [])

    function onDelete(detail: string) {
        setProcessingDelete(true)
        const index_to_remove = user_details?.findIndex(value => value == detail)
        console.log('delete triggered on \n', index_to_remove)
        if (index_to_remove == undefined) return
        const modified = user_details?.toSpliced(index_to_remove, 1)
        //send to db a new one
        //await sleep(5000) simulate db processing
        SetUserDetails(modified)
        worker_ref.current?.postMessage(detail)
        setProcessingDelete(false)


    }

    return (
        <>
            <DialogTitle title={'System Memory'}>System Memory</DialogTitle>
            <DialogDescription className={'text-neutral-300'}>
                Contains all the memory obtained during each conversation, help us to construct a personality of
                you for better adjustment of responses by respective model.
            </DialogDescription>
            <div
                className={'thin-scrollbar-y text-white flex flex-col gap-2 items-center w-full h-fit max-h-50 overflow-y-scroll'}>
                {
                    user_details ? (
                        user_details.length > 0 ? user_details?.map((detail) => (
                            <div key={detail}
                                 className={'border-b-2 border-b-neutral-600 flex flex-row items-center justify-between w-full'}>
                                <p className={'h-fit w-full mr-3'}>{detail}</p>
                                <Button className={'bg-transparent'} disabled={processing_delete} onClick={() => {
                                    onDelete(detail)
                                }}>
                                    <Trash2 size={20}/>
                                </Button>
                            </div>
                        )) : <p className={'text-white '}>No Memory Recorded</p>
                    ) : <Loader2Icon className={'text-white animate-spin'}/>
                }
            </div>
        </>
    )
}