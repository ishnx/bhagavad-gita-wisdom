const API = "https://YOUR-VERCEL-PROJECT.vercel.app/api/seek";

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

form.addEventListener("submit", async e => {
    e.preventDefault();
    const message = input.value.trim();
    
    if (!message) return;
    
    bubble("user", message);
    input.value = "";
    
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

    const data = await res.json();

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

});