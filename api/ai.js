import { CONFIG } from "./config.js";

export async function ask(messages) {

    const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CONFIG.API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            temperature: CONFIG.TEMPERATURE,
            messages
        })
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const json = await response.json();

    return json.choices[0].message.content;
}