'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2Icon, LogIn } from 'lucide-react';
import { auth } from '@/Firebase/config';
import checkEmailRegistered from '@/Firebase/Utilities/checkEmailRegistered';
import { useEffect, useState } from 'react';
import {
    useCreateUserWithEmailAndPassword,
    useSignInWithEmailAndPassword,
    useSignInWithGoogle,
} from 'react-firebase-hooks/auth';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {EmailAuthProvider, linkWithCredential, signInWithEmailAndPassword} from 'firebase/auth';
import refresh_token from '@/lib/refresh_token/refresh_token';
import Google from "@/app/Components/SelfComponent/svg_icons/Google";

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<'div'>) {
    const [email, SetEmail] = useState<string>('');
    const [password, SetPassword] = useState<string>('');
    const [
        signInWithEmailAndPassword,
        signIn_user,
        signIn_loading,
        signIn_error,
    ] = useSignInWithEmailAndPassword(auth);
    const [
        createUserWithEmailAndPassword,
        signup_user,
        signup_loading,
        signup_error,
    ] = useCreateUserWithEmailAndPassword(auth);
    const [signInWithGoogle, google_user, google_loading, google_error] =
        useSignInWithGoogle(auth);
    const router = useRouter();

    async function create_user() {
        try {
            await refresh_token();
            const result = await fetch(`api/user/create`, {
                method: 'POST',
            });
            const result_json = await result.json();
            console.log(result_json);
            return result_json;
        } catch (error) {
            console.log(error);
            return null;
        }
    }
    /*
    async function merge_account(email: string, password: string) {
        const google_sign_in = await signInWithGoogle();
        const credential = EmailAuthProvider.credential(email, password);
        if (google_sign_in) {
            try {
                await linkWithCredential(google_sign_in.user, credential);
                toast.success('successfully merges account');
                return;
            } catch (error) {
                toast.error('Fail to merge account reason ' + error);
                return;
            }
        }
        toast.error('Failed to sign in with google ');
    }
     */

    useEffect(() => {
        const handler = async () => {
            //toast.loading('Loading...');
            if (google_error) {
                if (
                    google_error.code ==
                    'auth/account-exists-with-different-credential'
                ) {
                    toast.error('Please Sign In using your email and Password');
                    return;
                }
                toast.error(
                    'Oh oh! Something went wrong try again in few seconds ' +
                        google_error
                );
            }
            if (google_user) {

                await create_user();
                toast.success('Sign In successful redirecting ... ');

            }
        }
        handler()
    }, [google_error, google_user]);

    useEffect(() => {
        const handler = async () => {

            if (signup_user) {
                await create_user();
                toast.success('Sign up Successful redirecting ...');

            }
            if (signup_error) {
                if (signup_error.code == 'auth/email-already-in-use') {
                    toast.error('Account Exist ! Try checking your password or Sign In using Google.');
                }
                else if (signup_error.code === 'auth/account-exists-with-different-credential') {
                    // User exists but signed up with Google/other provider
                    toast.error('This email is registered with Google. Please use "Sign in with Google" instead.');

                }
                else{
                    toast.error(
                        'Oh oh! Something went wrong signing up, try again in few seconds ' +
                            signup_error
                    );

                }
            }
        }
        handler();
    }, [signup_user, signup_error]);

    useEffect(() => {
        const handler = async () => {
            //toast.loading('Loading...');
            if (signIn_user) {
                await create_user();
                toast.success('Sign in Successful redirecting ...');

            }
            if (signIn_error) {
                console.log('sign in error',signIn_error);
                if (    signIn_error.code === 'auth/invalid-credential'){
                    createUserWithEmailAndPassword(email, password);
                }


                else{
                    toast.error(
                        'Oh oh! Unexpected error, try signing in, again in few seconds ' +
                        signIn_error
                    );
                }
            }
        }
        handler();
    }, [signIn_user, signIn_error]);

    async function login() {
            // Try signing in with a dummy password to check if user exists
        toast.loading('Loading...');
        await signInWithEmailAndPassword( email, password);

    }

    async function sign_in_google() {
        toast.loading('Loading...');
        await signInWithGoogle();
    }

    return (
        <div className={cn('w-full  ', className)} {...props}>
            <Card className="mx-auto shrink-0 bg-black text-white max-w-100 border-neutral-600">
                <CardHeader>
                    <CardTitle>Login / Sign Up to your account</CardTitle>
                    <CardDescription className="text-neutral-400">
                        Enter your email below to login/sign up to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        className="text-white"
                        onSubmit={(e) => {
                            e.preventDefault();
                            login();
                        }}
                    >
                        <div className="flex flex-col gap-6">
                            <div className="grid gap-3">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    className="border-neutral-500"
                                    value={email}
                                    onChange={(e) => SetEmail(e.target.value)}
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                />
                            </div>
                            <div className="grid gap-3">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                    <a
                                        href={
                                            '/reset_password' +
                                            (email != ''
                                                ? `?email=${email}`
                                                : '')
                                        }
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input
                                    className="border-neutral-500"
                                    id="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) =>
                                        SetPassword(e.target.value)
                                    }
                                />
                            </div>
                            <div className="flex flex-col gap-3">
                                <Button
                                    type="submit"
                                    className="w-full bg-neutral-700 hover:bg-neutral-400"
                                    disabled={signIn_loading || signup_loading}
                                >
                                    {signIn_loading || signup_loading ? (
                                        <Loader2Icon className="animate-spin" />
                                    ) : (
                                        <></>
                                    )}
                                    <LogIn /> Login
                                </Button>
                                <Button
                                    onClick={sign_in_google}
                                    variant="outline"
                                    className="w-full text-black hover:bg-neutral-400 flex flex-row gap-2"
                                >
                                   <Google/> Login with Google
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
