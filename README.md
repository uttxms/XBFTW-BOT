# XBFTW-BOT

A Discord.js v14 bot with modular command and event handling.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file with your bot credentials:
```
DISCORD_TOKEN=your_bot_token
CLIENT_ID=your_client_id
GUILD_ID=your_guild_id
OWNER_ID=your_user_id
```

3. Deploy slash commands:
```bash
npm run deploy
```

4. Start the bot:
```bash
npm start
```

## Project Structure

```
src/
├── index.js                           # Main bot entry point
│
├── handlers/
│   ├── commandHandler.js              # Recursively loads commands from src/commands/
│   └── eventHandler.js                # Loads event files from src/events/
│
├── commands/                          # Slash commands organized by category
│   ├── admin/
│   │   ├── owner-info.js             # [Owner] Bot information & stats
│   │   ├── owner-reload.js           # [Owner] Reload all commands
│   │   ├── owner-sync.js             # [Owner] Sync commands to Discord
│   │   ├── owner-clear.js            # [Owner] Clear orphaned commands
│   │   ├── owner-status.js           # [Owner] Set bot status
│   │   ├── owner-stop.js             # [Owner] Shutdown bot
│   │   ├── say.js                    # [Admin] Make bot say something
│   │   ├── ban.js                    # [Admin] Ban a user
│   │   ├── kick.js                   # [Admin] Kick a user
│   │   └── clear.js                  # [Admin] Clear user's messages in timeframe
│   ├── fun/
│   │   └── ping.js                   # Ping/pong command
│   └── info/
│       ├── help.js                   # List all available commands
│       ├── serverinfo.js             # Server information
│       └── userinfo.js               # User information
│
├── events/
│   ├── ready.js                       # Bot ready event (login confirmation)
│   └── interactionCreate.js           # Slash command interaction handler
│
└── utils/
    ├── deploy-commands.js             # Deploy/update commands to Discord
    ├── clear-commands.js              # Remove orphaned commands from Discord
    └── isOwner.js                     # Check if user is bot owner
```

## Commands

### 📋 General Commands
- `/help` - Display all available commands organized by category
- `/ping` - Pong! Check bot latency
- `/serverinfo` - View server information & statistics
- `/userinfo @user` - View user profile information with avatar

### ⚙️ Server Admin Commands
*(Requires Administrator permission)*
- `/say <message>` - Make the bot send a message
- `/ban <user> [reason]` - Ban a user from the server
- `/kick <user> [reason]` - Kick a user from the server
- `/clear <user> <time>` - Delete user's messages within timeframe (e.g., `10m`, `1h`)

### 👑 Bot Owner Commands
*(Only accessible to the user set in `OWNER_ID`)*
- `/owner-info` - View bot statistics (uptime, guilds, commands loaded)
- `/owner-reload` - Hot reload all commands
- `/owner-sync` - Sync local commands with Discord
- `/owner-clear` - Remove commands registered on Discord that don't exist locally
- `/owner-status <type> <text> [status]` - Set bot status (e.g., `PLAYING`, `WATCHING`, `LISTENING`)
- `/owner-stop` - Gracefully shutdown the bot

## NPM Scripts

```bash
npm start                 # Start the bot
npm run dev              # Start with auto-reload (--watch)
npm run deploy           # Deploy/update commands to Discord
npm run clear            # Remove orphaned commands from Discord
```

## Creating a Command

Create a command file in the appropriate category folder under `src/commands/`:

```javascript
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Example command')
    .addStringOption(option =>
      option
        .setName('argument')
        .setDescription('An argument')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Optional: restrict permissions

  async execute(interaction) {
    const arg = interaction.options.getString('argument');
    await interaction.reply(`You said: ${arg}`);
  },
};
```

Then run `npm run deploy` to register it.

## Creating an Event

Create an event file in `src/events/`:

```javascript
module.exports = {
  name: 'messageCreate',  // Discord.js event name
  async execute(message, client) {
    if (message.author.bot) return;
    console.log(`Message from ${message.author}: ${message.content}`);
  },
};
```

## Permissions & Access Control

### Owner-Only Commands
Use the `isOwner` utility to restrict commands to the bot owner:

```javascript
const isOwner = require('../utils/isOwner');

if (!isOwner(interaction.user.id)) {
  return interaction.reply({
    content: '❌ This command is only available to the bot owner.',
    ephemeral: true
  });
}
```

### Server Admin Commands
Use Discord's built-in permission system:

```javascript
.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
.setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
```

## Command Management

- **Deploy commands**: `npm run deploy` - Uploads all local commands to Discord
- **Clear orphaned commands**: `npm run clear` - Removes commands registered on Discord that no longer exist in the code
- **Reload commands**: `/owner-reload` - Hot reload all commands without restarting

## Available Discord.js Intents

The bot is configured with basic intents. Add more in `src/index.js` if needed:
- `GatewayIntentBits.Guilds` - Guild/server events
- `GatewayIntentBits.GuildMessages` - Message events
- `GatewayIntentBits.MessageContent` - Message content (required for reading message text)
- `GatewayIntentBits.DirectMessages` - DM events

