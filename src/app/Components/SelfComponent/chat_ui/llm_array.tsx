import DeepSeek from "@/app/Components/SelfComponent/svg_icons/Deepseek_icon";
import Gemini from "@/app/Components/SelfComponent/svg_icons/Gemini_icon";

export const model_combo_box_list =[
    {
        value: "deepseek/deepseek-chat-v3.1:free",
        api_url:  'api/llm/openai?',
        label: 'Deepseek-V3.1',
        icon: <DeepSeek/>,
        sdk: 'openai',
    },
    {
        value: "gemini-2.0-flash",
        api_url: 'api/llm/gemini?gemini_model=gemini-2.0-flash',
        label: 'Gemini-2.0 Flash',
        icon: <Gemini/>,
        sdk: 'gemini',
    },
    {
        value: "gemini-2.5-flash",
        api_url: 'api/llm/gemini?gemini_model=gemini-2.5-flash',
        label: 'Gemini-2.5 Flash',
        icon: <Gemini/>,
        sdk: 'gemini',

    },
    {
        value: "gemini-2.5-pro",
        api_url: 'api/llm/gemini?gemini_model=gemini-2.5-pro',
        label: 'Gemini-2.5 Pro',
        icon: <Gemini/>,
        sdk: 'gemini',
    }

]