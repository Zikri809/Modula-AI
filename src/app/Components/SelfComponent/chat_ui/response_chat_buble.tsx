import {Response_message_bubble} from "@/app/Types/chat_types/chat_types";
import ReactMarkdown from "react-markdown";
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import remarkMath from "remark-math";
import Llm_waiting_animation from "@/app/Components/SelfComponent/chat_ui/Llm_waiting_animation";
import {model_combo_box_list} from "@/app/Components/SelfComponent/chat_ui/llm_array";




export default function response_chat_buble({llm_model, llm_response, time, state}: Response_message_bubble) {

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
                            <pre className='overflow-x-auto thin-scrollbar'>
                              <code {...props}/>
                          </pre>
                        ),
                    }}
                >{ state == 'error' ? 'Error Occurred try again in a few seconds !' : JSON.parse(llm_response)}</ReactMarkdown>}
            </div>
            <p className='pr-1 text-sm text-neutral-400 text-left'>{new Date(time).toLocaleTimeString()}</p>
        </div>
    )
}