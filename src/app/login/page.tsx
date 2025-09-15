'use client';

import { LoginForm } from '@/components/login-form';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

import Dither from "@/app/Components/ReactBits/Dither/Dither";

/*
const Dither = dynamic(() => import('./Components/ReactBits/Dither/Dither'), {
    ssr: false,
    loading: () => <p>Loading...</p>, // Optional loading component
});
*/


export default function login() {
    return (
        <div className="flex flex-col h-full overflow-hidden bg-black items-center">
            <Toaster richColors position="top-right" className="z-100" />
            <div
                className="h-full w-full"
                style={{  position: 'absolute' }}
            >
                <Dither
                    pixelSize={2}
                    waveColor={[0.5, 0.5, 0.5]}
                    disableAnimation={false}
                    enableMouseInteraction={false}
                    mouseRadius={0.3}
                    colorNum={4}
                    waveAmplitude={0.3}
                    waveFrequency={3}
                    waveSpeed={0.01}
                />
            </div>
            <p className="z-2 p-4 text-left text-2xl w-full font-bold text-white">Modula AI</p>
            <div className=" z-2 px-6 h-full w-screen flex flex-col gap-2  justify-center ">
                <LoginForm className="" />
            </div>
        </div>
    );
}
