type User_message_bubble = {
    username: string,
    user_prompt: string,
    time:string
}
type Response_message_bubble = {
    llm_model: string,
    llm_response: string,
    time:string
}
type Message = {
    role: string,
    message: string,
    created_at: string,
}

export type {
    User_message_bubble,
    Response_message_bubble,
    Message,
}