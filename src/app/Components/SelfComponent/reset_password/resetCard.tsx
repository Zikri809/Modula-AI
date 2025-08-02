"use client"

import { Card,CardDescription,CardContent,CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {  toast } from 'sonner'
import { useRouter } from "next/navigation"
import { Mail } from 'lucide-react';


type props = {
    router : ReturnType<typeof useRouter>
}


export default function reset_card(props:props){
    //firebase will send the user registered email a link to reset the password
   
    function sendEmail(){
        const router = props.router
        toast.success('Email had been sent to ')
        setTimeout(()=>{
            router.push('/login')
        },3000)
    }

    return(
        <Card className="bg-black border-neutral-600 sm:w-100 text-white">
            <CardContent>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription className="py-4 flex flex-col ">
                    To reset your password send click the button below, an email will be send to registered
                    email
                    proceed with the instuction.
                    <Button className="bg-neutral-700 hover:bg-neutral-600 mt-4" onClick={sendEmail}><Mail />Send Me a Password Reset Link</Button>
                </CardDescription>
            </CardContent>

        </Card>
    )
}