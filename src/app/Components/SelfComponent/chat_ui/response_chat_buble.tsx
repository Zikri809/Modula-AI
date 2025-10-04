import {Response_message_bubble} from "@/app/Types/chat_types/chat_types";
import ReactMarkdown from "react-markdown";
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import remarkMath from "remark-math";
import Llm_waiting_animation from "@/app/Components/SelfComponent/chat_ui/Llm_waiting_animation";
import {model_combo_box_list} from "@/app/Components/SelfComponent/chat_ui/llm_array";
import {CopyIcon} from "lucide-react";
import {toast} from "sonner";
import 'prismjs/themes/prism-dark.css';
import Prism from 'prismjs';
import {useEffect} from "react";
import {formatDistanceToNow} from "date-fns";

/*
* syntax highlightinh isnt feasible due to technical confilict using markdown renderer
* */



export default function response_chat_buble({llm_model, llm_response, time, state}: Response_message_bubble) {

    useEffect(() => {
        console.log('ran ran ran');
        Prism.highlightAll();
    }, [llm_response]);
    async function copyCodeToClipboard(text:string | undefined) {
        //alert(object)
        if(!text) {
            toast.error('No text to copy to clipboard');
            return
        }
        try{
            console.log('react node data ',text)

            await navigator.clipboard.writeText(text);
            toast.success("Copied to clipboard!");
        }
        catch(err){
            toast.error('Failed to copy code to clipboard! Try checking the permission for this.');
        }
    }
    return(
        <div className='text-sm sm:text-base flex flex-col gap-2  bg-black broder-b-1 border-neutral-500 h-fit w-full text-white'>
            <p className='pr-1 text-left bg-blcak text-white flex flex-row gap-2 items-center'>
                {llm_model ?model_combo_box_list[model_combo_box_list.findIndex(value => value.label == llm_model )].icon : <></>}
                {llm_model}
            </p>
            <div className={`text-left  px-4 space-y-4 space-x-5 bg-neutral-800 ${state=='loading'? 'w-fit':'w-full'} rounded-md p-2 self-start`} >
                {state == 'loading' ? <Llm_waiting_animation/> :
                    <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                        hr: ({node, ...props}) => (
                            <hr className='my-2 border-neutral-500 border-1' {...props}/>
                        ),
                        table: ({node, ...props}) => (
                            <div className="overflow-x-auto scr my-2">
                                <table className="min-w-full border border-gray-300" {...props} />
                            </div>
                        ),
                        th: ({node, ...props}) => (
                            <th className="px-4 py-2 border" {...props} />
                        ),
                        td: ({node, ...props}) => (
                            <td className="px-4 py-2 border" {...props} />
                        ),
                        pre: ({node, ...props}) => (
                            <div className={'!mr-0 rounded-md my-2'}>
                                <div className={'rounded-t-md rounded-b-none m-0 p-4 !pb-0 bg-black right-4 top-4 w-full flex flex-row justify-between items-center'}>
                                    <p className={'font-bold'}>Code</p>
                                    {//@ts-ignore
                                        <button onClick={() => copyCodeToClipboard(node?.children[0].children[0].value)}
                                             className={'cursor-pointer hover:text-neutral-300 flex flex-row gap-2 items-center text-white font-bold '}>
                                        <CopyIcon size={15}/> Copy</button>}
                                </div>
                                <pre  className='!m-0 !rounded-t-none !border-none !mr-0 overflow-x-auto thin-scrollbar !bg-black p-4 rounded-md'>
                                  {props.children}
                                </pre>

                            </div>

                        ),
                    }}
                >{ JSON.parse(llm_response)}</ReactMarkdown>}
            </div>
            <p className='pr-1 text-sm text-neutral-400 text-left'>{formatDistanceToNow(new Date(time), { addSuffix: true }).replace(/^./, c => c.toUpperCase())}</p>
        </div>
    )
}