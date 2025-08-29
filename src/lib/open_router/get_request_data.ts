function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

export default async function (id: string) {
    try {
        console.log('id is ', id);
        await sleep(300);
        const costInfo = await fetch(
            `https://openrouter.ai/api/v1/generation?id=${id}`,
            {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${process.env.KIMI_K2_API_KEY}`,
                },
            }
        );
        const json = await costInfo.json();
        if (!costInfo.ok) throw json;
        return json.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}
