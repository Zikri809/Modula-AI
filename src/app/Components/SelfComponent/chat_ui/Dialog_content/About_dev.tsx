import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {Github} from "lucide-react";
import {Separator} from "@radix-ui/react-menu";
import {DialogTitle} from "@/components/ui/dialog";


export default function(){
    return (
        <>

            <DialogTitle>About Dev</DialogTitle>
            <div className="flex flex-col gap-2 ">

                <div className="flex flex-row items-center gap-4">
                    <Avatar className='w-24 h-24'>
                        <AvatarImage  src='https://github.com/Zikri809.png'/>
                        <AvatarFallback>Zikri</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col ">
                        <p className="text-lg font-bold">Zikri</p>
                        <p className="text-neutral-400">Bachelor in Computer Science</p>
                        <div className="flex flex-row gap-2 items-center">
                            <Github size={15}/>
                            <a className="text-blue-600 hover:underline break-all line-clamp-1" target="_blank" rel="noopener noreferrer" href="https://github.com/Zikri809">https://github.com/Zikri809</a>
                        </div>

                    </div>
                </div>
                <div className="text-sm  ">
                    A full-stack application featuring AI integration, RAG systems,
                    authentication, file uploads, and database management.
                    Developed to explore modern web technologies and security practices
                </div>
                <Separator/>
                <div>
                    <p className="font-semibold">TechStack</p>
                    <ul className="text-neutral-400 flex-col flex text-sm list-disc list-inside  text-nowrap">
                        <li className={'truncate'}>Next Js, Typescript, Tailwind and Lucide </li>
                        <li className={'truncate'}><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://ui.shadcn.com/">ShadCn - UI Library</a></li>
                        <li className={'truncate'}><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://firebase.google.com/">Firebase - Auth and Storage</a></li>
                        <li className={'truncate'}><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://supabase.com/">Supabase - Postgres Database</a></li>
                        <li className={'truncate'}><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://github.com/googleapis/js-genai">Gemini SDK - Gemini API</a></li>
                        <li className={'truncate'}><a className="hover:underline " target="_blank" rel="noopener noreferrer" href="https://github.com/openai/openai-node">OpenAI SDK - Access to OpenRouter Models</a></li>
                        <li className={'truncate'}><a className="hover:underline" target="_blank" rel="noopener noreferrer" href="https://openrouter.ai/">OpenRouter - LLM Provider</a></li>
                    </ul>
                </div>
            </div>
        </>

    )
}