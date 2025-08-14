"use client"
import SplitText from "./Components/ReactBits/SplitText/SplitText"

import {Button} from "@/components/ui/button";
import dynamic from "next/dynamic";
import {useRouter} from "next/navigation";

const Dither = dynamic(() => import('./Components/ReactBits/Dither/Dither'), {
    ssr: false,
    loading: () => <p>Loading...</p> // Optional loading component
});

export default function Home() {
    const router = useRouter()

    function toLoginPage() {
        router.push('/login')
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-black">
            <div className="" style={{width: '100%', height: '100%', position: 'absolute'}}>
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
            <div className=" z-2 p-4  h-full  flex flex-col gap-2 items-center justify-center ">
                <SplitText
                    text="Your multi-model private AI chatroom."
                    className="text-4xl font-bold text-center break-normal text-white"
                    delay={100}
                    duration={2}
                    ease="elastic.out(1,0.3)"
                    splitType="chars"
                    from={{opacity: 0, y: 40}}
                    to={{opacity: 1, y: 0}}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"

                />
                <SplitText
                    text="Multi-model, memory-aware, and built for the curious."
                    className={`text-sm  font-semibold text-center break-normal text-white `}
                    delay={500}
                    duration={0.3}
                    ease="power3.out"
                    splitType="words"
                    from={{opacity: 0, y: 40}}
                    to={{opacity: 1, y: 0}}
                    threshold={0.1}
                    rootMargin="-100px"
                    textAlign="center"

                />

                <Button onClick={toLoginPage}
                        className="mt-2 text-lg backdrop-blur-lg bg-white/20 hover:bg-white hover:text-black hover:scale-105 transition-transform ease-in-out">Login
                    / Sign Up</Button>

            </div>
        </div>
    );
}
