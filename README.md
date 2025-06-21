# 🧠 Bloxd.io + Ollama AI Integration

This project allows an **Ollama LLM** to act as a **command-style controller** for a player inside Bloxd.io. It uses a local Node.js server to mediate communication between the Bloxd modding API and your LLM.

---

## ⚙️ Components

### 1. `ollama_controller_server.js`
This file contains the **Ollama bridge server** and must be run on a local or remote machine with access to your Ollama backend.

#### 🔧 Server Setup Instructions
The full instructions for setup, authentication, remote exposure, and testing are **embedded as comments inside the `ollama_controller_server.js` file**.

In summary:
- You install dependencies (`express`, `dotenv`, `ollama`, etc.)
- You run a local Ollama server (`ollama serve`)
- You expose your server using `ngrok`
- You secure access via a shared token in `.env`

---

### 2. `bloxd_ollama_client.js`
This is the script you paste into your **Bloxd.io client modding interface**. It listens for `/ai` chat commands and passes player context and instructions to the Ollama bridge. The AI responds with structured `{ action, args }` objects, which are executed in-game.

Commands supported include:
- `go` (move direction/speed)
- `say` (chat in world)
- `teleport` (to xyz)
- `build` (place block at xyz)
- `attack` (target player)
- `idle` (no-op)

---

## 🧠 How It Works

The AI receives a full state description:
```json
{
  "instruction": "...",
  "message": "say hello",
  "state": {
    "player": { ... },
    "nearbyPlayers": [ ... ],
    "nearbyBlocks": [ ... ]
  }
}
```
The response must be in this format:
```
{ "action": "say", "args": { "message": "Hello!" } }
```
The client translates and executes this immediately.


---

🚀 Expansion Path: Multi-Player Strategy AI

This system can be extended to coordinate multiple players or run AI agents across an entire match.

🧩 Suggested Features:

Per-player memory context

Store session history keyed by player ID for persistent personality or strategy.


Commander Model

Let one LLM instance give tactical commands to several players at once:
```
{ "commands": [
  { "target": "playerA", "action": "go", "args": { "direction": "north" } },
  { "target": "playerB", "action": "build", "args": { "x": 3, "y": 4, "z": 5, "block": "wall" } }
]}
```

Squad-based AI Control

Treat a group of players as a squad with shared goal and distribute tasks.


Dynamic Strategy Switching

Use in-game signals or chat to change AI behavior mid-game (e.g. attack mode, defense mode, resource-gathering mode).


AI-vs-AI Competitions

Let two AI teams battle on different servers with isolated decision loops.




---

✅ Final Notes

This system is sandboxed and deterministic: you control the prompt, state, and interpretation.

Any LLM that supports structured JSON output can be used.

The system was designed for modular expansion with minimal dependencies.



---

> Designed with adaptability in mind. Expand it. Train it. Challenge it. Let your world think for itself.