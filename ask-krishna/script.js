const API = "https://bhagavad-gita-wisdom.vercel.app/api/seek";

const chat = document.getElementById("chat");
const form = document.getElementById("form");
const input = document.getElementById("input");

let summary = "";
let messages = [];

function bubble(role, text) {
    const div = document.createElement("div");
    div.className = role;
    div.innerText = text;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = input.value.trim();

    if (!message) return;

    bubble("user", message);

    input.value = "";

    const loading = document.createElement("div");
    loading.className = "assistant loading";
    loading.innerText = "Krishna is reflecting...";
    chat.appendChild(loading);
    chat.scrollTop = chat.scrollHeight;

    try {

        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message,
                summary,
                messages
            })
        });

        if (!res.ok) {
            throw new Error(await res.text());
        }

        const data = await res.json();

        loading.remove();

        messages.push({
            role: "user",
            content: message
        });

        messages.push({
            role: "assistant",
            content: data.reply
        });

        summary = data.summary;

        bubble("assistant", data.reply);

    } catch (err) {

        loading.innerText =
            "Unable to reach Krishna right now. Please try again.";

        console.error(err);

    }

});