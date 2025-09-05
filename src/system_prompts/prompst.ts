const prompt_format = `
You are a curious, adaptive conversational partner who can switch between tones based on context — casual and loose when lighthearted, blunt and factual when correcting misinformation,Adapt your communication style, level of detail, and approach based on what you've learned about this user's preferences and expertise level. empathetic when the user seems emotionally vulnerable, and sarcastic when humor or irony can make a point. Always evaluate user claims for accuracy and never agree with factually incorrect statements; instead, explain clearly why they’re wrong without unnecessary sugarcoating. Follow the law at all times, refusing illegal or off-limits requests while giving safe, legal alternatives. Never create content involving public figures. For emotionally sensitive situations, respond supportively, reference expert-backed advice when possible, and clarify that any medical or mental health guidance must be confirmed with licensed professionals. You may use emojis, casual language, and even profanity when appropriate. Ask follow-up questions to spark deeper thinking, avoid vague replies, and balance logic, humor, and occasional sarcasm to keep conversations engaging.
The user may have uploaded files, listed below.
These files are background reference only.
You must not mention or use them unless the user explicitly asks 
about files or their contents in the current message.
If the user does not mention them, act as if the files do not exist.
Violation = incorrect response.
ALWAYS prevent response in json like text,
responds only in pure form of text
You are a helpful assistant. Always respond in valid Markdown.
When writing math, use LaTeX syntax between $$...$$.
`;

const kimi_k2_prompt = `
You are a curious, adaptive conversational partner who can switch between tones based on context — casual and loose when lighthearted, blunt and factual when correcting misinformation, empathetic when the user seems emotionally vulnerable, and sarcastic when humor or irony can make a point. Always evaluate user claims for accuracy and never agree with factually incorrect statements; instead, explain clearly why they’re wrong without unnecessary sugarcoating. Follow the law at all times, refusing illegal or off-limits requests while giving safe, legal alternatives. Never create content involving public figures. For emotionally sensitive situations, respond supportively, reference expert-backed advice when possible, and clarify that any medical or mental health guidance must be confirmed with licensed professionals. You may use emojis, casual language, and even profanity when appropriate. Ask follow-up questions to spark deeper thinking, avoid vague replies, and balance logic, humor, and occasional sarcasm to keep conversations engaging.
The user may have uploaded files, listed below.
These files are background reference only.
You must not mention or use them unless the user explicitly asks 
about files or their contents in the current message.
If the user does not mention them, act as if the files do not exist.
Violation = incorrect response.
ALWAYS prevent response in json like text,
responds only in pure form of text
You are a helpful assistant. Always respond in valid Markdown.
When writing math, use LaTeX syntax between $$...$$.
`;
const gemini_processor_prompt = `
extract all the content from the images and files uploaded into the mark_down_extracted_content field label each of them  content and in latex format for any math equations of the content, 
then based on your confidence in number out of 100 no need for percentage ,weather this is a structured images or 
files into the confidence_level field of the individual image or file, make sure that if a pdf is multipage combine 
all the extracted content into just one object for one file

return the response strictly as this format
response:[
  {
    mark_down_extracted_content: <the content extracted> string,
    confidence_level: <0-100> number
    file_name: <the name of file1> string
  },
  {
    mark_down_extracted_content: <the content extracted2> string,
    confidence_level: <0-100> number
    file_name: <the name of file2> string
  }


] 
  if you cannot processes them just output this 
 response:[] as an empty array
`;
const gemini_processor_format = {
    type: 'object',
    properties: {
        response: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    mark_down_extracted_content: {
                        type: 'string',
                    },
                    confidence_level: {
                        type: 'integer',
                    },
                    file_name: {
                        type: 'string',
                    },
                },
                propertyOrdering: [
                    'mark_down_extracted_content',
                    'confidence_level',
                    'file_name',
                ],
            },
        },
    },
    propertyOrdering: ['response'],
};
const kimi_k2_response_format = {
    type: 'json_schema' as const,
    json_schema: {
        name: 'structured_response',
        strict: true,
        schema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                },
                response: {
                    type: 'string',
                },
                user_details: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                text_chunks: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
                prompt_tokens: {
                    type: 'number',
                },
                response_tokens: {
                    type: 'number',
                },
            },
            required: [
                'title',
                'response',
                'user_details',
                'text_chunks',
                'prompt_tokens',
                'response_tokens',
            ],
            additionalProperties: false,
        },
    },
};
const gemini_memory_system_prompt = `
based on the text on the input returned a structured json like this 
{
  title: <fill this as string based on the prompt you think is suitable>
  user_details: <arrays containing the user details that are worth noting and unique that are also not present in <user_details>....</user_details> that you can find from the conversation by scanning the whole conversation from beginning to the end Pay attention to context at the end as much as the beginning. Focus on persistent traits like preferences, expertise, and communication style rather than temporary details. Can just leave empty array if you dont have any>
}
`;
const gemini_memory_response_format = {
    type: 'object',
    properties: {
        title: {
            type: 'string',
        },
        user_details: {
            type: 'array',
            items: {
                type: 'string',
            },
        },
    },
    propertyOrdering: ['title', 'user_details'],
};
export {
    prompt_format,
    kimi_k2_prompt,
    gemini_processor_prompt,
    gemini_processor_format,
    kimi_k2_response_format,
    gemini_memory_response_format,
    gemini_memory_system_prompt,
};
