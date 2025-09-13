import {DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {RotateCcw} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function ErrorDialog(){
    return (
        <>
            <DialogHeader className={'text-white'} >
                <DialogTitle title={'Error Occurred'}>
                    Error Occurred !
                </DialogTitle>
                <DialogDescription>
                    Please, try again in a few seconds.
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button className={'flex flex-row gap-2 items-center text-black bg-white hover:bg-neutral-100'}>
                    Refresh Page  <RotateCcw />
                </Button>
            </DialogFooter>

        </>
    )
}