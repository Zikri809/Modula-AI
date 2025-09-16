import { auth } from '@/Firebase/config';
import {fetchSignInMethodsForEmail, signInWithEmailAndPassword} from 'firebase/auth';
import { toast } from 'sonner';

export default async function (email: string, password:string): Promise<boolean> {
    try {
        // Try signing in with a dummy password to check if user exists
        await signInWithEmailAndPassword(auth, email, password);
        return true; // This shouldn't happen
    } catch (error: any) {
        console.log('Auth check error code:', error.code);

        if (error.code === 'auth/wrong-password' ||
            error.code === 'auth/too-many-requests' ||
            error.code === 'auth/invalid-credential') {
            return true; // User exists!
        } else if (error.code === 'auth/user-not-found') {
            return false; // User doesn't exist
        } else {
            console.log('Unknown auth error:', error);
            return false; // Default to false for safety
        }
    }
}
