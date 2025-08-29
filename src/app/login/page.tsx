'use client';

import { LoginForm } from '@/components/login-form';
import dynamic from 'next/dynamic';
import { Toaster } from 'sonner';

const Dither = dynamic(
    () => import('@/app/Components/ReactBits/Dither/Dither'),
    {
        ssr: false,
        loading: () => <p>Loading...</p>, // Optional loading component
    }
);

export default function login() {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black">
            <Toaster richColors position="top-right" className="z-100" />
            <div
                className=""
                style={{ width: '100%', height: '100%', position: 'absolute' }}
            >
                <Dither
                    waveColor={[0.5, 0.5, 0.5]}
                    disableAnimation={false}
                    enableMouseInteraction={true}
                    mouseRadius={0.3}
                    colorNum={4}
                    waveAmplitude={0.3}
                    waveFrequency={3}
                    waveSpeed={0.05}
                />
            </div>
            <p className="z-2 p-4 text-2xl font-bold text-white">Modula AI</p>
            <div className=" z-2 px-6 h-full flex flex-col gap-2  justify-center ">
                <LoginForm className="" />
            </div>
        </div>
    );
}
