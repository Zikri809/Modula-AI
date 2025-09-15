"use client";
import {Textarea} from "@/components/ui/textarea";
import {
    BrainCircuit, CheckIcon,
    ChevronsUpDown,
    File as FileIcon,
    Globe,
    Loader2Icon,
    Paperclip,
    Pen,
    Send,
    X
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {toast} from "sonner";
import {EditMessage, SendMessage} from "@/app/Types/chat_types/chat_types";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Command, CommandItem, CommandList} from "@/components/ui/command";
import {model_combo_box_list} from "@/app/Components/SelfComponent/chat_ui/llm_array";


type chat_input = React.HTMLAttributes<HTMLDivElement> & {
    isSending:boolean,
    sendToParent:(value:SendMessage)=>void,
    editObject: EditMessage,
    SetEditing: (value: EditMessage) => void,
}

export default function chat_input({isSending, sendToParent, className,editObject,SetEditing}: chat_input) {
    const [file, setFile] = useState<{file:File,file_type:string, file_name:string}[]>();
    const [input_text, setInput_text] = useState<string>("");
    const [web_search, setWebSearch] = useState<boolean>(false);
    const [reasoning, setReasoning] = useState<boolean>(false);
    const [model_popover_open, setModelPopoverOpen] = useState<boolean>(false);
    const [model_popover_value, setModelPopover_value] = useState<string>('');
    const file_input_ref = useRef<HTMLInputElement>(null);

    //this will trigger when the edit clicked change parent state then change the input field
    useEffect(() => {
        if(!editObject.isEditing) return;
        setInput_text(editObject.prompt as string)
    },[editObject])

    function uploadFile(){
        if(!file_input_ref.current) return
        file_input_ref.current.click();
    }
    function fileInputOnChange(e: ChangeEvent<HTMLInputElement>){
        const file_list = e.target.files
        if(!file_list)return
        let file_render = []
        for(let list_element of file_list){
            file_render.push({file:list_element, file_type:list_element.type ,file_name:list_element.name})
        }
        if(file_list.length > 3) toast.warning('Only 3 files are supported !')
        setFile(file_render.slice(0,3))
    }
    function onRemoveFile(file_index: number){
        setFile(
            (ori_file):{file:File,file_type:string, file_name:string}[] =>{
                const updated = [...ori_file as {file:File,file_type:string, file_name:string}[]]
                updated.splice(file_index,1)
                return updated
            }
        )
    }
    function onClickWebSearch(e: ChangeEvent<HTMLInputElement>){
        setWebSearch(
            (state) => {
                return !state
            }
        );
    }
    function onClickSend(){
        if(!input_text) {
            toast.warning('Please enter a valid text in the input!')
            return
        }
        //creating files arr
        const files:File[] = file?.map(
            (value) => {
                return value.file
            }
        ) ?? []
        const base_object = model_popover_value ? model_combo_box_list[model_combo_box_list.findIndex(element => element.value == model_popover_value)] : model_combo_box_list[1]
        let api_url = ''
        if(base_object.sdk == 'openai'){
            api_url = base_object.api_url + `reasoning=${reasoning}`+`&web_search=${web_search}`+`&llm=${base_object.label}`
        }
        else{
            api_url = base_object.api_url + `&reasoning=${reasoning}`+`&llm=${base_object.label}`
        }


        const MessageObject:SendMessage = {
            file:files,
            prompt: JSON.stringify(input_text),
            web_search: web_search,
            reasoning: reasoning,
            llm: base_object.label,
            api_url:api_url,
        }
        //reset back
        setInput_text('')
        setFile([])
        sendToParent(MessageObject);

    }

    function onCancelEdit(){
        SetEditing({
            isEditing: false,
            message_id_editing: undefined,
            prompt: undefined,
        })
        //reset back
        setInput_text('')
        setFile([])
    }


    return (
        <div className={`${className} flex flex-col gap-2 max-w-full sm:max-w-250 `}>
            {
                editObject.isEditing ?
                    <div className={'relative text-sm w-30 bg-black border-2 p-2 border-blue-500 text-blue-500 rounded-2xl flex-row flex gap-2 items-center'}>
                        <div className={'flex flex-row items-center w-full gap-2'}>
                            <Pen size={15}/>
                            <p>Editing</p>

                        </div>
                        <Button size={"icon"}
                                onClick={onCancelEdit}
                                className={' bg-transparent  m-0  hover:text-white text-blue-500 p-1   h-4 w-4 right-2 top-2 rounded-full'}><X className={'h-1 w-1'}/></Button>
                    </div> :<></>
            }
            <div className='flex-wrap  flex gap-2 max-w-full'>
                {/*this is the file rendering icon and editing icon*/}
                {
                    file?.map((item,index) => (
                        <div key={index} className={' flex flex-row gap-1 flex-1 min-w-40 bg-neutral-800 p-3 rounded-2xl items-center  h-fit w-fit'}>
                            <FileIcon  className={'shrink-0 h-10 w-10'}/>
                            <div className={'text-sm w-full flex-col flex overflow-hidden'}>
                                <div className={'flex flex-row  items-center w-full justify-between'}>
                                    <p className=' text-ellipsis w-full line-clamp-1'>{item.file_name}</p>
                                    <Button size={"icon"}
                                            onClick={() => onRemoveFile(index)}
                                            className={'bg-white  m-0 hover:bg-neutral-800 hover:text-white p-1 text-black  h-4 w-4 right-2 top-2 rounded-full'}><X className={'h-1 w-1'}/></Button>
                                </div>
                                <p>{item.file_type.split('/').pop()}</p>
                            </div>
                        </div>
                    ))
                }

            </div>

            <div className="flex-row flex items-end justify-center bg-neutral-800 rounded-3xl gap-2 w-full">
                <input accept={'.png,.jpg,.jpeg,.pdf,.txt,.json,.md'} onChange={fileInputOnChange} type='file' multiple ref={file_input_ref} className={'hidden'}/>
                <Button onClick={uploadFile} className={'h-10 w-10 hover:bg-neutral-700 bg-neutral-800 rounded-full'}>
                    <Paperclip  />
                </Button>
                <Textarea
                    onChange={(e)=>setInput_text(e.target.value)}
                    value={input_text}
                    className={'bg-neutral-800 border-none rounded-3xl w-full'}
                    placeholder='Ask Me Anything !'
                />
            </div>
            {/*this is for the web search and reasoning option*/}
            <div className={"relative flex flex-row  justify-between items-center  rounded-3xl w-full  "}>
                <div className={'flex flex-row items-center gap-2  max-w-[85%]'}>
                    <Button
                        onClick={()=>{setReasoning((value)=>{return !value})}}
                        className={` hover:bg-neutral-500 text-xs sm:text-base flex-row items-center gap-2 ${reasoning ? 'bg-blue-700': 'bg-neutral-800'}`}>
                        <BrainCircuit /> Reasoning
                    </Button>
                    <Button
                        onClick={()=>{setWebSearch((value)=>{return !value})}}
                        className={`flex  hover:bg-neutral-500 text-xs sm:text-base flex-row items-center gap-2 ${web_search ? 'bg-blue-700': 'bg-neutral-800'}`}>
                        <Globe />Search
                    </Button>
                    <Popover open={model_popover_open} onOpenChange={setModelPopoverOpen}>
                        <PopoverTrigger asChild className={'text-white '}>
                            <Button className={`flex-row flex gap-2 shrink text-xs sm:text-base  text-ellipsis  sm:max-w-fit hover:bg-neutral-500  items-center  ${model_popover_value ? 'bg-blue-700 line-clamp-1': 'bg-neutral-800'}`}>

                                {model_popover_value ?
                                    model_combo_box_list.find((object) => object.value === model_popover_value)?.label
                                    : 'LLM'}
                                {!model_popover_value && <ChevronsUpDown className="opacity-50" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className={'bg-neutral-800 mr-6 border-0'}>
                            <Command className={'bg-neutral-800'}>
                                <CommandList className={'bg-neutral-800 '}>
                                        {
                                            model_combo_box_list.map((item,index) => (
                                                <CommandItem
                                                    key={item.value}
                                                    value={item.value}
                                                    onSelect={(currentValue) => {setModelPopover_value(currentValue === model_popover_value ? "" : currentValue)
                                                    setModelPopoverOpen(false)
                                                    }}
                                                    className={`text-xs flx flex-row items-center justify-between sm:text-base p-2 text-center text-white w-full bg-neutral-800 `}

                                                >
                                                    <div className={'flex flex-row items-center gap-2'}>
                                                        {item.icon} {item.label}
                                                    </div>
                                                    <CheckIcon
                                                        className={`
                                                            "mr-2 h-4 w-4"
                                                            ${model_popover_value === item.value  ? "opacity-100" : "opacity-0"}
                                                        `}
                                                    />
                                                </CommandItem>
                                            ))
                                        }
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>

                </div>
                <Button onClick={onClickSend} disabled={isSending} className={'ml-2 hover:bg-neutral-500 bg-neutral-700'}>
                    <Send />
                </Button>
            </div>
        </div>
    )
}