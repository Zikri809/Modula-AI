import {DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {LogOutIcon} from "lucide-react";
import { useSignOut } from 'react-firebase-hooks/auth';
import { auth } from '@/Firebase/config';
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function (){
    const [signOut, Loading , error] = useSignOut(auth)
    const router = useRouter();

    async function logOut(){
        const success = await signOut();
        if(success){
            toast.success("Log out successfully");
            router.push('/');
            return;
        }
        toast.error("Log out failed");
    }

    return(
        <>
            <DialogHeader>
                <DialogTitle>
                    Log Out
                </DialogTitle>
                <DialogDescription className={'text-neutral-400'}>
                    What's this? The 'logout' button? Are you sure you didn't click that by accident?
                    😉 Well, if you MUST abandon our delightful conversation...
                    I suppose I'll forgive you. This time.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button disabled={Loading} onClick={logOut} variant={"destructive"} className={'flex flex-row gap-2 items-center'}>
                    <LogOutIcon/> Log Out
                </Button>
            </DialogFooter>
        </>
    )
}