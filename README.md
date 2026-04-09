# XBFTW-BOT

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example` and add your bot token:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
OWNER_ID=your_user_id
```

3. Deploy slash commands (required before first use):
```bash
node src/utils/deploy-commands.js
```

4. Start the bot:
```bash
npm .
```

## Project Structure

```
src/
├── index.js                    # Main bot file
├── handlers/
│   ├── commandHandler.js       # Loads commands from src/commands/
│   └── eventHandler.js         # Loads events from src/events/
├── commands/                   # Slash command files
│   └── ping.js                # Example ping command
├── events/                     # Event listener files
│   ├── ready.js               # Bot ready event
│   └── interactionCreate.js   # Slash command handler
└── utils/
    └── deploy-commands.js    # Script to register slash commands
```

## Creating a Command

Create a new file in `src/commands/`:

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Says hello!'),

  async execute(interaction) {
    await interaction.reply('Hello!');
  },
};
```

Then run: `node src/utils/deploy-commands.js`

## Creating an Event

Create a new file in `src/events/`:

```javascript
module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;
    console.log(`Message from ${message.author}: ${message.content}`);
  },
};
```

## Available Intents

The bot comes with basic intents. Add more in `src/index.js` if needed:
- `GatewayIntentBits.Guilds` - Guild events
- `GatewayIntentBits.GuildMessages` - Message events
- `GatewayIntentBits.MessageContent` - Message content
- `GatewayIntentBits.DirectMessages` - DM events

## Owner Commands

These commands are **only available to the bot owner** (set via `OWNER_ID` in `.env`):

- `/owner-info` - Shows bot information (uptime, guilds, commands loaded, etc.)
- `/owner-reload` - Reloads all commands from disk and redeploys them
- `/owner-sync` - Syncs all local commands to Discord
- `/owner-clear` - Removes commands registered on Discord that no longer exist locally
- `/owner-status` - Sets the bot's presence/status (activity type, text, and online status)
- `/owner-stop` - Gracefully shuts down the bot

## NPM Scripts

- `npm start` - Start the bot
- `npm run dev` - Start the bot with auto-reload on file changes
- `npm run deploy` - Deploy all commands to Discord
- `npm run clear` - Remove orphaned commands from Discord

## Owner Check Utility

Use the `isOwner` utility in your own commands:

```javascript
const isOwner = require('../utils/isOwner');

if (!isOwner(interaction.user.id)) {
  return interaction.reply({ content: '❌ Owner only', ephemeral: true });
}
```

