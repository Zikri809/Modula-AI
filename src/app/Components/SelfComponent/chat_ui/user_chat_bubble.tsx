
import {User_message_bubble} from "@/app/Types/chat_types/chat_types";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import ReactMarkdown from "react-markdown";
import {File as FileIcon, X} from "lucide-react";
import {Button} from "@/components/ui/button";

export default function user_chat_bubble({username,user_prompt,time, file_meta_data}:User_message_bubble) {
    return(
        <div className='text-sm sm:text-base flex flex-col gap-2 bg-black broder-b-1 border-neutral-500 h-fit w-full text-white'>
            <p className='pr-1 text-right bg-blcak text-white'>{username}</p>
            <div className='flex-wrap  flex gap-2 max-w-full'>
                {/*this is the file rendering icon*/}
                {
                    file_meta_data?.map((item,index) => (
                        <div key={index} className={' flex flex-row gap-1 flex-1 min-w-40 bg-neutral-800 p-3 rounded-2xl items-center  h-fit w-fit'}>
                            <FileIcon  className={'flex-shrink-0 h-10 w-10'}/>
                            <div className={'text-sm w-full'}>
                                <div className={'flex flex-row  items-center w-full justify-between'}>
                                    <p className=' text-ellipsis w-full line-clamp-1'>{item.file_name.includes('||||') ? item.file_name.split('||||')[1] : item.file_name}</p>
                                </div>
                                <p>{item.file_name.split('.')[1]}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
            <div className='text-right px-4 text-sm sm:text-base bg-neutral-800 w-fit rounded-md p-2 self-end' >
                <ReactMarkdown
                    remarkPlugins={[remarkGfm,remarkMath]}
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
                >{JSON.parse(user_prompt)}</ReactMarkdown>
            </div>
            <p className='pr-1 sm:text-sm text-neutral-400 text-right'>{new Date(time).toLocaleTimeString()}</p>
        </div>
    )
}