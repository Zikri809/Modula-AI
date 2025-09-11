type User_message_bubble = {
    message_id: number,
    username: string,
    user_prompt: string,
    time:string,
    file_meta_data: {file_name:string}[],
    SetEdit: (editObject:EditMessage) =>void
}
type Response_message_bubble = {
    llm_model: string,
    llm_response: string,
    time:string,
    state?: 'loading' | 'error' | 'success',
}
type Message = {
    role: string,
    message: string,
    created_at: string,
    message_id?: number,
    file_meta_data?:{file_name:string}[],
    status?: 'loading' | 'error' | 'success'
}
type SendMessage = {
    file: File[],
    prompt:string,
    web_search: boolean,
    reasoning: boolean,
    llm: string,
    api_url:string,
}

 type Chats = {
     chat_id: string,
     created_at: string,
     chat_title: string,
 }
 type EditMessage = {
    isEditing: boolean,
     message_id_editing?: number
    prompt?:string,
 }
export type {
    SendMessage,
    User_message_bubble,
    Response_message_bubble,
    Message,
    Chats,
    EditMessage,
}