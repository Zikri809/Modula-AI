'use client'
import refresh_token from "@/lib/refresh_token/refresh_token"
import {useAuthState} from "react-firebase-hooks/auth"
import {ReactNode, useEffect} from "react"
import {auth} from "@/Firebase/config";

export default function refresh_token_component({children}: { children: ReactNode }) {
    const [user, loading, error] = useAuthState(auth);
    useEffect(() => {
        refresh_token()
        const refresh_interval = setInterval(() => {
            refresh_token()
        }, 3300000)
        return () => {
            clearInterval(refresh_interval)

        }
    }, [user])
    return <>{children}</>
}