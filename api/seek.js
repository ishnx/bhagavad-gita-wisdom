import { CONFIG } from "./config.js";
import { SYSTEM_PROMPT, SUMMARIZER_PROMPT } from "./prompt.js";
import { ask } from "./ai.js";

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    try {

        const { message, summary = "", messages = [] } = req.body;
        const recent = messages.slice(-CONFIG.RECENT_MESSAGES);

        const reply = await ask([
            { role: "system", content: SYSTEM_PROMPT },
            ...(summary ? [{ role: "system", content: summary }] : []),
            ...recent,
            { role: "user", content: message }
        ]);

        const updatedSummary = await ask([
            {
                role: "system",
                content: SUMMARIZER_PROMPT.replace("{{WORDS}}", CONFIG.SUMMARY_WORD_LIMIT)
            },
            {
                role: "user",
                content: JSON.stringify({
                    previousSummary: summary,
                    newMessages: [
                        ...recent,
                        { role: "user", content: message },
                        { role: "assistant", content: reply }
                    ]
                })
            }
        ]);

        return res.status(200).json({
            reply,
            summary: updatedSummary
        });

    } catch (err) {

        console.error(err);

        return res.status(500).json({
            error: err.message
        });

    }
}