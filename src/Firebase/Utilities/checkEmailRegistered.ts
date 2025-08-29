import { auth } from '@/Firebase/config';
import { fetchSignInMethodsForEmail } from 'firebase/auth';
import { toast } from 'sonner';

export default async function (email: string): Promise<boolean> {
    try {
        const user_signIn_method = await fetchSignInMethodsForEmail(
            auth,
            email
        );

        //if length is <=0 then no methods
        if (user_signIn_method.length < 0 || !user_signIn_method) {
            console.log('entering the not registered block');
            return false;
        } else if (user_signIn_method.includes('password')) {
            return true;
        } else if (user_signIn_method.includes('google.com')) {
            toast.success('Already Sign up using google');
            return false;
        } else {
            return true;
        }
    } catch (error: any) {
        console.log('error occured fetching the details');
        return false;
    }
}
