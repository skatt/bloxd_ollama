// bloxd_ollama_client.js
// --------------------------------------
// 🧠 AI Controller for Bloxd.io (WebSocket Proxy Edition)

const OLLAMA_TOKEN = 'your-secret-token';

// 👂 Listen to player chat and delegate AI input
api.on('playerChat', (playerId, message) => {
  if (!message.startsWith('/ai ')) return;

  const playerInput = message.slice(4).trim();
  if (playerInput.length === 0) {
    api.sendMessage(playerId, 'Usage: /ai <message>');
    return;
  }

  const playerPos = api.getPosition(playerId);
  const playerHealth = api.getHealth(playerId);

  const nearbyPlayers = api.getPlayerIds()
    .filter(id => id !== playerId)
    .map(id => ({
      id,
      pos: api.getPosition(id),
      health: api.getHealth(id)
    }));

  const nearbyBlocks = [
    api.getBlock(playerPos.x + 1, playerPos.y, playerPos.z),
    api.getBlock(playerPos.x - 1, playerPos.y, playerPos.z),
    api.getBlock(playerPos.x, playerPos.y, playerPos.z + 1),
    api.getBlock(playerPos.x, playerPos.y, playerPos.z - 1),
    api.getBlock(playerPos.x, playerPos.y + 1, playerPos.z),
    api.getBlock(playerPos.x, playerPos.y - 1, playerPos.z)
  ];

  const state = {
    player: {
      id: playerId,
      pos: playerPos,
      health: playerHealth
    },
    nearbyPlayers,
    nearbyBlocks
  };

  const payload = {
    type: 'ollama_command',
    token: OLLAMA_TOKEN,
    playerId,
    instruction: `You are an AI controlling a player in a 3D voxel world. You receive the game state and a command. Respond with an action and args. Use actions like "go", "say", "attack", "teleport", or "build". Output must be valid JSON: { "action": string, "args": object }`,
    message: playerInput,
    state
  };

  api.sendMessage(playerId, '🤖 Thinking...');
  api.sendRaw(JSON.stringify(payload));
});

// 📩 Handle response from Ollama via proxy WebSocket
api.on('rawMessage', (msg) => {
  let data;
  try {
    data = JSON.parse(msg);
  } catch {
    return;
  }

  if (data?.type !== 'ollama_response' || !data.playerId) return;

  const { playerId, action, args } = data;
  handleOllamaAction(playerId, action, args);
});

// 🔧 Executes Ollama-defined actions
function handleOllamaAction(playerId, action, args) {
  switch (action) {
    case 'go': {
      const speed = Math.min(args.speed || 1, 10);
      const dir = (args.direction || '').toLowerCase();
      const velocity = { x: 0, y: 0, z: 0 };
      if (dir === 'north') velocity.z = -speed;
      if (dir === 'south') velocity.z = speed;
      if (dir === 'east') velocity.x = speed;
      if (dir === 'west') velocity.x = -speed;
      if (dir === 'up') velocity.y = speed;
      if (dir === 'down') velocity.y = -speed;
      api.applyImpulse(playerId, velocity.x, velocity.y, velocity.z);
      api.sendMessage(playerId, `🧭 Moving ${dir} with speed ${speed}`);
      break;
    }

    case 'say':
      if (args.message) api.sendMessage(playerId, args.message);
      break;

    case 'teleport':
      if ('x' in args && 'y' in args && 'z' in args) {
        api.setPosition(playerId, args.x, args.y, args.z);
        api.sendMessage(playerId, `🌀 Teleported to (${args.x}, ${args.y}, ${args.z})`);
      }
      break;

    case 'attack':
      if (args.targetId) {
        api.applyHealthChange(args.targetId, -10, { playerId }, true);
        api.sendMessage(playerId, `⚔️ Attacking ${args.targetId}`);
      }
      break;

    case 'build':
      if ('x' in args && 'y' in args && 'z' in args && args.block) {
        api.setBlock(args.x, args.y, args.z, args.block);
        api.sendMessage(playerId, `🧱 Built ${args.block} at (${args.x}, ${args.y}, ${args.z})`);
      }
      break;

    case 'idle':
    default:
      api.sendMessage(playerId, '😐 (No action taken)');
      break;
  }
}