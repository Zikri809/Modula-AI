
import {SidebarMenuButton} from "@/components/ui/sidebar";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useAuthState} from "react-firebase-hooks/auth";
import {auth} from "@/Firebase/config";

import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {BrainIcon, CircleDollarSign, CircleUserRound, Github, LogOut} from "lucide-react";
import { useState} from "react";
import ShowMemory from "@/app/Components/SelfComponent/chat_ui/Dialog_content/Memory";
import ErrorDialog from "@/app/Components/SelfComponent/chat_ui/Dialog_content/ErrorDialog";
import LogOutDialog from "@/app/Components/SelfComponent/chat_ui/Dialog_content/LogOutDialog.";
import About_dev from "@/app/Components/SelfComponent/chat_ui/Dialog_content/About_dev";




export default function Profile_popover(){
    const [dialogState, setDialogState] = useState<'memory' | 'usage' | 'LogOut' | 'about_dev' | undefined | 'error'>(undefined)
    const [dialogLoading, setDialogLoading] = useState<boolean>(true);
    const [user, loading, error] = useAuthState(auth);






    return (
        <Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <SidebarMenuButton className={'bg-black h-full w-full hover:bg-neutral-800 hover:text-white flex flex-row gap-2'}>
                        <Avatar>
                            <AvatarImage src={ user?.photoURL ?? undefined }></AvatarImage>
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
                    <DialogTrigger onClick={()=>setDialogState('about_dev')}>
                        <DropdownMenuItem className={'text-white data-[highlighted]:bg-neutral-600 data-[highlighted]:text-white'}>
                            <Github className={'text-white'}/> About Developer
                        </DropdownMenuItem>
                    </DialogTrigger>
                    <DialogTrigger onClick={()=>setDialogState('LogOut')}>
                        <DropdownMenuItem className={'text-red-500 data-[highlighted]:bg-neutral-600 data-[highlighted]:text-red-400'}>
                            <LogOut className={'text-red-500'}/> Log out
                        </DropdownMenuItem>
                    </DialogTrigger>
                </DropdownMenuContent>
                <DialogContent className={'bg-neutral-800 border-0 text-white w-full flex flex-col'}>
                    {
                        dialogState === 'memory'  && <ShowMemory setDialogState={setDialogState}/>
                    }
                    {
                        dialogState === 'error'  && <ErrorDialog/>
                    }
                    {
                        dialogState === 'LogOut' && <LogOutDialog/>
                    }
                    {
                        dialogState == 'about_dev' && <About_dev/>
                    }
                </DialogContent>
            </DropdownMenu>
        </Dialog>
    )
}