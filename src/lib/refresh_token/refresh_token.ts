import { auth } from '@/Firebase/config';
import {useRouter} from "next/navigation";
import {AppRouterInstance} from "next/dist/shared/lib/app-router-context.shared-runtime";

export default async function refresh_token() {
    //console.log('user status ', auth.currentUser);
        try {
            const token = await auth.currentUser?.getIdToken(true);
            const token_gen = await fetch('/api/auth/token_gateway', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!token_gen.ok) throw new Error('token gen failed');
            //console.log('token gen ', token_gen);
            return true
        } catch (error) {
            console.log('error in refreshing user token');
            return false;
        }
}

