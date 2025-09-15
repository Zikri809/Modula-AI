'use client';
import SplitText from './Components/ReactBits/SplitText/SplitText';

import { Button } from '@/components/ui/button';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Dither = dynamic(() => import('./Components/ReactBits/Dither/Dither'), {
    ssr: false,
    loading: () => <p>Loading...</p>, // Optional loading component
});

export default function Home() {
    const router = useRouter();

    function toLoginPage() {
        router.push('/login');
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black">
            <div
                className=""
                style={{ width: '100%', height: '100%', position: 'absolute' }}
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
            <p className="z-2 p-4 text-2xl font-bold text-white">Modula AI</p>
            <div className=" z-2 p-4  h-full  flex flex-col gap-2 items-center justify-center ">
                <p  className="text-4xl font-bold text-center break-normal text-white">Your multi-model private AI chatroom.</p>
                <p  className={`text-sm  font-semibold text-center break-normal text-white `}>Multi-model, memory-aware, and built for the curious.</p>

                <Button
                    onClick={toLoginPage}
                    className="mt-2 text-lg backdrop-blur-lg bg-white/20 hover:bg-white hover:text-black hover:scale-105 transition-transform ease-in-out"
                >
                    Login / Sign Up
                </Button>
            </div>
        </div>
    );
}
