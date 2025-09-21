import {PostgrestSingleResponse} from "@supabase/supabase-js";

jest.mock('next/headers', () => ({
    cookies: jest.fn(() => ({
        getAll: () => [],
        set: jest.fn(),
    }))
}))


import update_user from "@/lib/supabase_helper/user/update_user";
import createClient from "@/utils/supabase/server";
import create_message from "@/lib/supabase_helper/message/create_message";
import create_chat from "@/lib/supabase_helper/chat/create_chat";
const testing_uid =process.env.TESTING_UID as string;



const messages = [
    {"idx":0,"message_id":245,"created_at":"2025-09-19 08:10:09.957037+00",
        "modified_at":"2025-09-19 08:10:09.957037+00","chat_id":null,
        "user_prompt":"\"Hallo, assalamualaikum \"","llm_response":"\"Hallo means hello in German, and Assalamualaikum is an Arabic greeting that means \\\"Peace be upon you\\\"[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFU0i8Zob79MJnPYmN5WOVAO4SHY2q2wys7RLQGXVJOdLDZt75fjqN70diLt6qO57wsDGAiMGSpRqRxgXZC5HdUaMJNRWWdZwlLKaB3vPDU6W0dp5ZXrLS3wbnaeJ3riYRvG6iJrEW9T2X7kCUYqeg=), [2](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFjAjxvHvc4ulG0IuLEAK02LIu66AV-BmKE_YvhtKj5SmKm0ektpQu1J_O6qq-H2t_7_Vk6M0yjXBad844s6OL5AwO0bqxrg-OL4Quf6mgcfS7pwpKtSXzOXJ3qOSMYA4EKrtXCYZjnbBBf0Ve0OlnIyMX8EIvwEqKVn7SB4OSnd22WUiURSBU8kFyNQ-ug4IaAvjslVVZVriDvtExWzCtTrAh18W4whu5bHhSgFcb5sw4YTpCjp2D1TOM=), [3](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFAxZdjqU09ts9n3SKK1SGgZGWsdTrbXQ5zqdg_U0187owWwHBVFMQDiy1QNMlL9D4XhPrtsXofboSKcIoMRevpzku4iMZIJ7u2aM6ut9MzY0JGG6TAB9w1_cw3YEVxvX1eBkMscWThUho4). It's a common greeting among Muslims[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFU0i8Zob79MJnPYmN5WOVAO4SHY2q2wys7RLQGXVJOdLDZt75fjqN70diLt6qO57wsDGAiMGSpRqRxgXZC5HdUaMJNRWWdZwlLKaB3vPDU6W0dp5ZXrLS3wbnaeJ3riYRvG6iJrEW9T2X7kCUYqeg=), [3](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFAxZdjqU09ts9n3SKK1SGgZGWsdTrbXQ5zqdg_U0187owWwHBVFMQDiy1QNMlL9D4XhPrtsXofboSKcIoMRevpzku4iMZIJ7u2aM6ut9MzY0JGG6TAB9w1_cw3YEVxvX1eBkMscWThUho4), [2](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFjAjxvHvc4ulG0IuLEAK02LIu66AV-BmKE_YvhtKj5SmKm0ektpQu1J_O6qq-H2t_7_Vk6M0yjXBad844s6OL5AwO0bqxrg-OL4Quf6mgcfS7pwpKtSXzOXJ3qOSMYA4EKrtXCYZjnbBBf0Ve0OlnIyMX8EIvwEqKVn7SB4OSnd22WUiURSBU8kFyNQ-ug4IaAvjslVVZVriDvtExWzCtTrAh18W4whu5bHhSgFcb5sw4YTpCjp2D1TOM=). A typical response to this greeting is \\\"Wa alaikum assalam,\\\" which means \\\"And upon you be peace\\\"[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFU0i8Zob79MJnPYmN5WOVAO4SHY2q2wys7RLQGXVJOdLDZt75fjqN70diLt6qO57wsDGAiMGSpRqRxgXZC5HdUaMJNRWWdZwlLKaB3vPDU6W0dp5ZXrLS3wbnaeJ3riYRvG6iJrEW9T2X7kCUYqeg=), [4](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQGGqL-OBNTQaOFeMNKVrOxorK38xRLSNFHdcJkq5PctmOpoW4OcpZOruQaIqEovRz0PngnTAuUicRIc4fsebOepnHXj-Tn9pL6GBW6jvkUt-CrlJNhkPI5b7yV3lnOFFWIyV45G4jYqSb1waF94umt1s-RrBHif1gFP177KbWMj95CMG4rPPw==), [2](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFjAjxvHvc4ulG0IuLEAK02LIu66AV-BmKE_YvhtKj5SmKm0ektpQu1J_O6qq-H2t_7_Vk6M0yjXBad844s6OL5AwO0bqxrg-OL4Quf6mgcfS7pwpKtSXzOXJ3qOSMYA4EKrtXCYZjnbBBf0Ve0OlnIyMX8EIvwEqKVn7SB4OSnd22WUiURSBU8kFyNQ-ug4IaAvjslVVZVriDvtExWzCtTrAh18W4whu5bHhSgFcb5sw4YTpCjp2D1TOM=).\\n\"",
        "total_input_tokens":744,"response_tokens":75,"total_tokens":819,"total_cost":0.0001044,"llm_model":"Gemini-2.0 Flash",
        "context_prompt_tokens":1484
    },
    {"idx":1,"message_id":246,"created_at":"2025-09-19 08:10:55.880935+00","modified_at":"2025-09-19 08:10:55.880935+00",
        "chat_id":null,
        "user_prompt":"\"How can you offer me than other AI, how can you do\"",
        "llm_response":"\"Well, that's a pretty broad question! AI models are like snowflakes, no two are exactly alike. Here's what I can offer you:\\n\\n*   **Adaptability:** I can switch between different communication styles depending on the context. Need blunt facts? I got you. Want something more lighthearted? I can do that too.\\n*   **Honesty (even if it stings):** I'm not here to blow smoke. If something you say is factually incorrect, I'm going to call you on it, and I'll explain why[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEiigmUmNq3AgT9ygEBs1AQs08Sqcl26Wnogc1eA2Bn4kafT-vnoancwK1_w8toHiZ5T2o162zRas2I5sKZx1QQCNI9JZz-N0jHCX23n5F31-3jIVqEjLMh-7OdUBT3P0S8IDMa0XCCli6reW5AqQ6IrwrTb7wXT7vjdtz3DtDXSY4DjRrL46d95Z6tl9s1z0EBHaAMJuSb8x-B8A==). No sugarcoating, just the truth.\\n*   **I check my facts**: I'm designed to access and process information from the real world through Google Search and keep my response consistent with search results.\\n*   **I don't have \\\"life experience.\\\"** Some people say that's what differentiates me from humans[1](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQEiigmUmNq3AgT9ygEBs1AQs08Sqcl26Wnogc1eA2Bn4kafT-vnoancwK1_w8toHiZ5T2o162zRas2I5sKZx1QQCNI9JZz-N0jHCX23n5F31-3jIVqEjLMh-7OdUBT3P0S8IDMa0XCCli6reW5AqQ6IrwrTb7wXT7vjdtz3DtDXSY4DjRrL46d95Z6tl9s1z0EBHaAMJuSb8x-B8A==).\\n\\nUltimately, the \\\"best\\\" AI depends on what you need it for[2](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHT49dldxbBjkMpOgK7XuowiyeI2G1RitHFQx6rLqEl6hCkyUcpOVjpBgW2O1Z0y161sEsJQTEObFhD-_lqdsnQZGSGKRg2ZtgbL-c9QX5hinRdBcAqcyNKq4mzBGJ4ZUNK8FDl_A==), [3](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQF3Sc087EoZzLyRVbYz2vHPFzrvMr-ibZPNJUtlh586nD89GmI8GP9C9w3TB725ubkuAe4xIE1oRfbu-j9rvTh0AX25-AMHAO7ZvkeyAO53qMDtR2UtbcM_U4GlIoApa-Ohf7THeHe2JXQNJyOeuQioU8oM-yV10B53kKZkRuUx8AtVFf24CzjhkElPaj0=), [4](https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQFWsLaP96_LiBpwmkNJFjg0uzVYfFptWsMCLCDLKfXj8yD0_lvSRcKMqnh2z-OrAoT4pWPk3awnqw6FX2CTNrLvaYx_h0jr2lUnFhYGX3gXUmeIAcZoa5fTZRpEE_6AJ1GLnJ_SQg==). I try to be a well-rounded AI assistant.\\n\"",
        "total_input_tokens":3850,"response_tokens":238,"total_tokens":4088,"total_cost":0.0004802,
        "llm_model":"Gemini-2.0 Flash","context_prompt_tokens":1012
    }
    ]


import prompt_builder from "@/lib/prompt_builder/prompt_builder";
import context_builder from "@/lib/openai/context_builder";
import {ChatCompletionMessageParam} from "openai/resources/chat/completions/completions";


async function set_user_details(uid: string, array_to_set: string[]) {
    const supabase = await createClient()
    const {data,error } = await supabase.from("users")
        .update(
            {
                user_details: array_to_set ?? [],
            }
        ).eq('uid',testing_uid).select('*')
}

async function db_cleanup():Promise<void> {
    const supabase = await createClient()
    const {data,error } = await supabase.from("users")
        .update(
            {
                user_details: [],
            }
        ).eq('uid',testing_uid).select('*')
    //console.log('clean up error ',error)

}

beforeAll(async () => {
    await db_cleanup()
})

afterAll(async () => {
    const supabse = await createClient()
    await supabse.from('Chats').delete().eq('uid',testing_uid)
    await db_cleanup()
})


//create_chat,update user details then create_messages

test('prompt builder with no user details', async () => {
    const result = await create_chat(testing_uid)
    if(!result ) throw new Error("No chats found.");

    let expected_convo = []
    for (const message of messages) {
        await create_message(
            testing_uid,
            result.data?.chat_id,
            message.user_prompt,
            message.llm_response,
            message.context_prompt_tokens,
            message.total_input_tokens,
            message.response_tokens,
            message.total_cost,
            message.llm_model,
        )
        expected_convo.push(`<convo> user: ${message.user_prompt} || llm_response: ${message.llm_response} </convo>`)
    }
    const prompt_window = await prompt_builder(result.data?.chat_id,testing_uid)

    expect(prompt_window).toEqual({
        past_conv_arr: expected_convo,
        user_data: '' + JSON.stringify([])
    })
})

test('prompt builder with  user details', async () => {
    await set_user_details(testing_uid, ["random_facts",'whats life really is'] )

    //console.log('error setting user details.',error)
    //console.log('user details details.',data)

    const result = await create_chat(testing_uid)

    if(!result ) throw new Error("No chats found.");

    let expected_convo = []
    for (const message of messages) {
        await create_message(
            testing_uid,
            result.data?.chat_id,
            message.user_prompt,
            message.llm_response,
            message.context_prompt_tokens,
            message.total_input_tokens,
            message.response_tokens,
            message.total_cost,
            message.llm_model,
        )
        expected_convo.push(`<convo> user: ${message.user_prompt} || llm_response: ${message.llm_response} </convo>`)
    }
    const prompt_window = await prompt_builder(result.data?.chat_id,testing_uid)

    console.log(prompt_window)
    expect(prompt_window).toEqual({
        past_conv_arr: expected_convo,
        user_data: '' + JSON.stringify(['random_facts','whats life really is'])
    })
})


test('context builder(openai endpoints) - with no message but have user details ', async () => {
    const result = await create_chat(testing_uid)
    await set_user_details(testing_uid, ["test openai 1",'test openai 2'])
    const context = await context_builder(result?.data?.chat_id, testing_uid)
    expect(context).toEqual(
        {
            past_conv_arr_openai: [{
                role: 'system',
                content: `<user_details>${["test openai 1",'test openai 2']}</user_details> `,
            }],
            previous_convo_gemini: [],
            user_details: ["test openai 1",'test openai 2'],
        })
})

test('context builder(openai endpoints) - with  message and have user details ', async () => {
    const result = await create_chat(testing_uid)
    await set_user_details(testing_uid, ["test openai 1",'test openai 2'])
    if(!result ) throw new Error("No chats found.");

    let expected_openai = [{
        role: 'system',
        content: `<user_details>${["test openai 1",'test openai 2']}</user_details> `,
    }]
    let expected_previous_convo_gemini = []


    for (const message of messages) {
        await create_message(
            testing_uid,
            result.data?.chat_id,
            message.user_prompt,
            message.llm_response,
            message.context_prompt_tokens,
            message.total_input_tokens,
            message.response_tokens,
            message.total_cost,
            message.llm_model,
        )
        expected_openai.push({
                role: 'user',
                content: `${message.user_prompt}`,
            } ,
            {
                role: 'assistant',
                content: `${message.llm_response}`,
            }
        )
        expected_previous_convo_gemini.push(
            `<convo> user: ${message.user_prompt} || llm_response: ${message.llm_response} </convo>`
        );
    }



    const context = await context_builder(result?.data?.chat_id, testing_uid)
    expect(context).toEqual(
        {
            past_conv_arr_openai: expected_openai,
            previous_convo_gemini: expected_previous_convo_gemini,
            user_details: ["test openai 1",'test openai 2'],
        })
})