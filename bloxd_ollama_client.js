// bloxd_ollama_client.js
// --------------------------------------
// 🧠 AI Controller for Bloxd.io
//
// ✅ Requirements:
// - Your Ollama controller server must be exposed remotely (e.g. using ngrok)
// - The server must be running with a matching AUTH_TOKEN
// - You must replace the public URL and token below accordingly
//
// --------------------------------------

const OLLAMA_URL = 'https://your-ngrok-url.ngrok.io/chat';
const OLLAMA_TOKEN = 'your-secret-token';

// 👂 Listen to chat input and send to Ollama if it starts with /ai
api.on('playerChat', async (playerId, message) => {
  if (!message.startsWith('/ai ')) return;

  const playerInput = message.slice(4).trim();
  if (playerInput.length === 0) {
    api.chat(playerId, 'Usage: /ai <message>');
    return;
  }

  // Build world context
  const playerPos = api.getPosition(playerId);
  const playerHealth = api.getHealth(playerId);
  const inventory = api.getInventory(playerId);
  const skin = api.getSkin(playerId);

  const nearbyPlayers = api.getPlayerIds()
    .filter(id => id !== playerId)
    .map(id => ({
      id,
      pos: api.getPosition(id),
      health: api.getHealth(id),
      name: api.getName(id)
    }));

  const nearbyBlocks = [
    api.getBlock(playerPos.x + 1, playerPos.y, playerPos.z),
    api.getBlock(playerPos.x - 1, playerPos.y, playerPos.z),
    api.getBlock(playerPos.x, playerPos.y, playerPos.z + 1),
    api.getBlock(playerPos.x, playerPos.y, playerPos.z - 1),
    api.getBlock(playerPos.x, playerPos.y - 1, playerPos.z),
    api.getBlock(playerPos.x, playerPos.y + 1, playerPos.z)
  ];

  const state = {
    player: {
      id: playerId,
      pos: playerPos,
      health: playerHealth,
      inventory,
      skin
    },
    nearbyPlayers,
    nearbyBlocks
  };

  const payload = {
    token: OLLAMA_TOKEN,
    instruction: `
You are an AI controlling a player in a 3D voxel world.
You receive a game state and a user input command.
Respond with an action and args. Use commands like go, say, attack, teleport, build, use.
All responses must be JSON: { "action": string, "args": object }.
    `.trim(),
    message: playerInput,
    state
  };

  api.chat(playerId, '🤖 Thinking...');

  try {
    const res = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const { action, args } = await res.json();
    handleOllamaAction(playerId, action, args);
  } catch (err) {
    api.chat(playerId, '❌ Error: ' + err.message);
  }
});

// 🔧 Executes actions returned by Ollama
function handleOllamaAction(playerId, action, args) {
  switch (action) {
    case 'go':
      if (args.direction && args.speed) {
        api.move(playerId, args.direction, args.speed);
        api.chat(playerId, `🧭 Moving ${args.direction} at speed ${args.speed}`);
      }
      break;
    case 'say':
      api.chat(playerId, args.message || '...');
      break;
    case 'teleport':
      if ('x' in args && 'y' in args && 'z' in args) {
        api.setPosition(playerId, args.x, args.y, args.z);
        api.chat(playerId, `🌀 Teleported to (${args.x}, ${args.y}, ${args.z})`);
      }
      break;
    case 'attack':
      if (args.targetId) {
        api.attack(playerId, args.targetId);
        api.chat(playerId, `⚔️ Attacking ${args.targetId}`);
      }
      break;
    case 'build':
      if (args.x != null && args.y != null && args.z != null && args.block) {
        api.build(playerId, args.x, args.y, args.z, args.block);
        api.chat(playerId, `🧱 Built ${args.block} at (${args.x}, ${args.y}, ${args.z})`);
      }
      break;
    case 'idle':
    default:
      api.chat(playerId, '😐 (No action taken)');
      break;
  }
}

