'use client';
import refresh_token from '@/lib/refresh_token/refresh_token';
import { useAuthState } from 'react-firebase-hooks/auth';
import {ReactNode, useEffect, useState} from 'react';
import { auth } from '@/Firebase/config';
import {Loader2Icon} from "lucide-react";
import {usePathname, useRouter} from "next/navigation";

export default function refresh_token_component({
    children,
}: {
    children: ReactNode;
}) {
    const [token_generated, setTokenGenerated] = useState(false);
    const router = useRouter();
    const current_pathname = usePathname()
    const [user, loading, error] = useAuthState(auth);
    useEffect(() => {
        if(loading) return
        if(!user &&  !(current_pathname=='/' || current_pathname == '/login' || current_pathname == '/reset_password')) {
            //redirect to log in
            router.push('/login');
            return
        }
        refresh_token().then(result => {
            setTokenGenerated(result)
            if( user ){

                //if current path is / then redirect to chat page
                router.push('/chat')
                return
            }

        });
        const refresh_interval = setInterval(() => {
            refresh_token().then(result => {
                if(!result) {
                    router.push('/login');
                }
            });
            }, 3300000);
        return () => {
            clearInterval(refresh_interval);
        };
    }, [user,loading]);
    return(
    <>{
        token_generated || current_pathname=='/'  || current_pathname == '/login' || current_pathname == '/reset_password'? children:(
            <div className={'h-screen w-screen flex flex-col items-center justify-center'}><Loader2Icon className={'animate-spin '}/></div>)
    }</>);
}
