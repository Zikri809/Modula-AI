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
        if(!user) {
            //redirect to log in
            router.push('/');
            return
        }
        refresh_token().then(result => setTokenGenerated(result));
        if(current_pathname == '/' ){
            //if current path is / then redirect to chat page
            router.push('/chat')
            return
        }
        const refresh_interval = setInterval(() => {
            refresh_token().then(result => {
                if(!result) {
                    router.push('/');
                }
            });
            }, 3300000);
        return () => {
            clearInterval(refresh_interval);
        };
    }, [user,loading]);
    return <>{token_generated? children: <div className={'h-screen w-screen flex flex-col items-center justify-center'}><Loader2Icon className={'animate-spin '}/></div>}</>;
}
