# 🧠 Bloxd Ollama Integration

This setup allows you to connect [Bloxd.io](https://bloxd.io) to a local [Ollama](https://ollama.com) AI model using a **WebSocket proxy**, a **browser injection script**, and a **client mod** that interfaces directly with in-game chat and state.

---

## 📦 Overview

`ollama_controller_server.js` Intercepts browser <--> Bloxd WebSocket and routes `/ai` commands to Ollama
`bloxd_tamper.js` Injects browser override to connect to the proxy instead of directly to Bloxd
`bloxd_ollama_client.js` Mod script inside Bloxd that listens to player input and sends it to Ollama

---

## 🧰 Requirements

- Node.js (>=18)
- [Ollama](https://ollama.com) installed and running locally (`ollama serve`)
- Tampermonkey browser extension
- Access to [Bloxd.io](https://bloxd.io)
- Optionally, ngrok (for remote Ollama access, not needed if local)

---

## 🚀 Setup Guide

### 1. Install Node Modules

```bash
npm install ws http ollama


---

2. Start Ollama

Install and serve your model:

ollama run llama3

Leave it running in a terminal.


---

3. Run the WebSocket Proxy

Start the proxy server that intercepts all browser WebSocket traffic:

node ollama_controller_server.js

By default, this listens on:

ws://localhost:4999


---

4. Install the Tampermonkey Script

1. Install Tampermonkey in your browser


2. Create a new script and paste in the contents of bloxd_tamper.js


3. The script intercepts calls to wss://game.bloxd.io/... and replaces them with ws://localhost:4999



> ✅ You should now see game traffic flowing through your local proxy.


---

5. Load the In-Game Mod Script

In Bloxd's mod editor, paste in bloxd_ollama_client.js.

> This script:

Listens for /ai <command> in player chat

Captures nearby players, blocks, health, and position

Sends a structured JSON request to Ollama via the proxy

Applies actions like go, say, teleport, etc.





---

🔐 Environment Variables

You can customize the secret token inside:

bloxd_ollama_client.js → OLLAMA_TOKEN

ollama_controller_server.js → VALID_TOKEN


> These must match to allow the AI system to process commands.




---

💬 Example Usage In-Game

In the Bloxd chat, type:

/ai say hello

Or try:

/ai go north
/ai attack nearest
/ai build block at x y z


---

✅ Status Indicators

🤖 Thinking... — request is being sent to Ollama

🧭 Moving..., ⚔️ Attacking..., etc. — result of AI action

❌ Error: — request failed or model response was invalid



---

🛠️ Debugging Tips

Open browser dev console → Network → check WebSocket is connected to ws://localhost:4999

Watch terminal logs in proxy server for AI parsing errors

Ensure Ollama model is correctly downloaded and running


---

🌐 Optional Remote Access

If you want to host Ollama remotely:

npm install -g ngrok
ngrok http 11434

Then update your OLLAMA_URL in the mod script accordingly.


---

✨ Future Additions

Rate limiting / abuse protection

Logging and metrics dashboard

Multiplayer-specific coordination logic

Persistent memory across commands



---

🧠 Powered by Ollama + LLaMA3 + WebSocket Trickery



