
import {SidebarMenuButton} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/Firebase/config";

import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {BrainIcon, CircleDollarSign, CircleUserRound, Loader2Icon, LogOut, RotateCcw, Trash2} from "lucide-react";
import {ReactElement, useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import ShowMemory from "@/app/Components/SelfComponent/chat_ui/Dialog_content/Memory";
import ErrorDialog from "@/app/Components/SelfComponent/chat_ui/Dialog_content/ErrorDialog";




export default function Profile_popover(){
    const [dialogState, setDialogState] = useState<'memory' | 'usage' | 'LogOut' | undefined | 'error'>(undefined)
    const [dialogLoading, setDialogLoading] = useState<boolean>(true);
    const [user, loading, error] = useAuthState(auth);
    console.log('photo url is',user?.photoURL);






    return (
        <Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className={'bg-black h-full w-full hover:bg-neutral-800 hover:text-white flex flex-row gap-2'}>
                        <Avatar>
                            <AvatarImage src={ user?.photoURL ?? '' }></AvatarImage>
                            <AvatarFallback className={'text-black text-lg'}>{user?.displayName?.charAt(0) ?? 'U'}</AvatarFallback>
                        </Avatar>
                        <p className={' text-lg'}>{user?.displayName ?? 'User'}</p>

                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className={'bg-neutral-800 border-0 text-white flex flex-col '}>
                    <DropdownMenuLabel className={'flex flex-row gap-2 items-center text-neutral-400'}>
                        <CircleUserRound /> {user?.email ?? 'No email' }
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className={'bg-neutral-500'}></DropdownMenuSeparator>
                    <DialogTrigger onClick={()=>setDialogState('memory')} type={"button"} asChild>
                        <DropdownMenuItem className={'text-white data-[highlighted]:bg-neutral-600 data-[highlighted]:text-white'}>
                            <BrainIcon className={'text-white'}/> System Memory
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger >
                        <DropdownMenuItem className={'text-white data-[highlighted]:bg-neutral-600 data-[highlighted]:text-white'}>
                            <CircleDollarSign className={'text-white'}/> Limits and usage
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger>
                        <DropdownMenuItem className={'text-red-500 data-[highlighted]:bg-neutral-600 data-[highlighted]:text-red-400'}>
                            <LogOut className={'text-red-500'}/> Log out
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
                <DialogContent className={'bg-neutral-800 border-0 text-white '}>
                    {
                        dialogState === 'memory'  && <ShowMemory setDialogState={setDialogState}/>
                    }
                    {
                        dialogState === 'error'  && <ErrorDialog/>
                    }
                </DialogContent>
            </DropdownMenu>
        </Dialog>
    )
}