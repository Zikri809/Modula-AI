'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2Icon, LogIn, Mail } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { auth } from '@/Firebase/config';
import { useSendPasswordResetEmail } from 'react-firebase-hooks/auth';
import checkEmailRegistered from '@/Firebase/Utilities/checkEmailRegistered';
import Link from 'next/link';

type props = {
    router: ReturnType<typeof useRouter>;
};

export default function Reset_card(props: props) {
    //firebase will send the user registered email a link to reset the password
    const [email, SetEmail] = useState<string>('');
    const params: any = useSearchParams();
    const [sendPasswordResetEmail, sending, error] =
        useSendPasswordResetEmail(auth);
    const [timer_lock, Set_timer_lock] = useState<boolean>(false);
    const [timer, Set_timer] = useState<number>(5);

    useEffect(() => {
        const email = params.get('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (email && emailRegex.test(email)) {
            SetEmail(email);
        }
    }, [params]);
    useEffect(() => {
        if (error) {
            toast.error(
                `There seems to be an error sending your email ` + error
            );
        }
    }, [error]);

    async function sendEmail() {
        if (email == '') {
            toast.error('Please enter your email ');
            return;
        }
        if (!(await checkEmailRegistered(email))) {
            //email not registered
            toast.error(
                'It seems that your email is not registered with us, try registering with this email'
            );
            return;
        }
        const router = props.router;
        await sendPasswordResetEmail(email);
        toast.success('Success! Email had been sent to ' + email);
        Set_timer_lock(true);

        const interval = setInterval(() => {
            Set_timer((timer) => {
                return timer - 1;
            });
        }, 1000);
        setTimeout(() => {
            clearInterval(interval);
            Set_timer_lock(false);
            Set_timer(5);
        }, 5000);
    }

    return (
        <Card className="bg-black border-neutral-600 sm:w-100 text-white">
            <CardContent>
                <CardTitle>Reset Password</CardTitle>
                <CardDescription className="gap-4 py-4 w-full flex flex-col ">
                    To reset your password, enter your email below and click the
                    button. We'll send a reset link to your registered email.
                    <Input
                        type="email"
                        value={email}
                        required
                        onChange={(e) => SetEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        className="text-white"
                    ></Input>
                    <Button
                        disabled={sending || timer_lock}
                        className="bg-neutral-700 hover:bg-neutral-600 mt-4 flex flex-row gap-2 items-center"
                        onClick={sendEmail}
                    >
                        {(sending || timer_lock) && (
                            <Loader2Icon className="animate-spin" />
                        )}{' '}
                        <Mail />
                        Send Me a Password Reset Link
                    </Button>
                    <Link href="/login" className=" w-full">
                        <Button className="hover:bg-neutral-400 w-full bg-neutral-600 flex flex-row gap-2 items-center">
                            <LogIn />
                            Return to Login Page
                        </Button>
                    </Link>
                    {timer_lock && (
                        <p className="text-center text-neutral-500">
                            Try again in {timer} seconds
                        </p>
                    )}
                </CardDescription>
            </CardContent>
        </Card>
    );
}
