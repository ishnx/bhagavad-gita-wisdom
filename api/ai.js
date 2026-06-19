import { CONFIG } from "./config.js";

export async function ask(messages, onToken = null) {
    const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${CONFIG.API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: CONFIG.MODEL,
            messages,
            stream: !!onToken,
            temperature: CONFIG.TEMPERATURE
        })
    });

    if (!response.ok) throw new Error(await response.text());

    if (!onToken) {
        const json = await response.json();
        return json.choices[0].message.content;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let full = "";
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value);

        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {

            if (!line.startsWith("data: ")) continue;

            const data = line.slice(6);

            if (data === "[DONE]") continue;

            try {
                const json = JSON.parse(data);

                const token =
                    json.choices?.[0]?.delta?.content ?? "";

                if (!token) continue;

                full += token;

                onToken(token);

            } catch {}
        }
    }

    return full;
}