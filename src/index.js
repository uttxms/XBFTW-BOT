const { Client, GatewayIntentBits, Collection } = require('discord.js');
const loadCommands = require('./handlers/commandHandler');
const loadEvents = require('./handlers/eventHandler');
require('dotenv').config();

const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Initialize collections for commands and events
discordClient.commands = new Collection();
discordClient.events = new Collection();

// Load commands and events
try {
  loadCommands(discordClient);
  loadEvents(discordClient);
  
  // Login to Discord
  discordClient.login(process.env.DISCORD_TOKEN);
} catch (error) {
  console.error('Failed to initialize bot:', error);
  process.exit(1);
}
