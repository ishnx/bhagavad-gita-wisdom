import { SYSTEM_PROMPT } from "./prompt.js";

const API_URL = "https://api.openai.com/v1/responses";
const API_KEY = process.env.OPENAI_API_KEY;

const MODEL = "gpt-5";

const RECENT_MESSAGE_COUNT = 8;
const SUMMARY_MAX_WORDS = 500;

async function askAI(input) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODEL,
      input
    })
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const json = await response.json();

  return (
    json.output_text ??
    json.output?.map(x => x.content?.map(c => c.text).join("")).join("") ??
    "I'm unable to respond right now."
  );
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    message,
    summary = "",
    messages = []
  } = req.body;

  const recentMessages = messages.slice(-RECENT_MESSAGE_COUNT);

  const conversation = [
    SYSTEM_PROMPT,

    summary
      ? `Story So Far:\n${summary}`
      : "This is the beginning of the conversation.",

    "Recent Conversation:",

    ...recentMessages.map(
      m => `${m.role.toUpperCase()}: ${m.content}`
    ),

    `USER: ${message}`
  ].join("\n\n");

  const reply = await askAI(conversation);

  const updatedSummary = await askAI(`
Current Story So Far:

${summary}

New Conversation:

${recentMessages
  .map(m => `${m.role}: ${m.content}`)
  .join("\n")}

user: ${message}

assistant: ${reply}

Rewrite the Story So Far.

Keep only information useful for continuing future conversations.

Maximum ${SUMMARY_MAX_WORDS} words.
`);

  return res.status(200).json({
    reply,
    summary: updatedSummary
  });
}