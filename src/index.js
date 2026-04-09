const { Client, GatewayIntentBits, Collection } = require('discord.js');
const commandHandler = require('./handlers/commandHandler');
const eventHandler = require('./handlers/eventHandler');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
  ],
});

// Initialize command and event collections
client.commands = new Collection();
client.events = new Collection();

// Load commands and events
commandHandler(client);
eventHandler(client);

// Login to Discord
client.login(process.env.DISCORD_TOKEN);
