export const CONFIG = {
    MODEL: process.env.MODEL || "gpt-5",
    API_URL: process.env.API_URL || "https://api.openai.com/v1/chat/completions",
    API_KEY: process.env.OPENAI_API_KEY,
    RECENT_MESSAGES: 8,
    SUMMARY_WORD_LIMIT: 400
};