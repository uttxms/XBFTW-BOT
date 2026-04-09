const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Fetching all registered commands...');

    // Get all registered commands from Discord
    const commands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    );

    if (commands.length === 0) {
      console.log('✓ No commands registered.');
      return;
    }

    // Get all local command files
    const commandsPath = path.join(__dirname, '../commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    const localCommands = new Set(
      commandFiles.map(file => {
        const command = require(path.join(commandsPath, file));
        return command.data?.name;
      }).filter(Boolean),
    );

    // Find commands to delete (registered but not local)
    const commandsToDelete = commands.filter(cmd => !localCommands.has(cmd.name));

    if (commandsToDelete.length === 0) {
      console.log('✓ All registered commands exist locally. Nothing to delete.');
      return;
    }

    console.log(`Found ${commandsToDelete.length} command(s) to delete:`);
    commandsToDelete.forEach(cmd => console.log(`  - ${cmd.name}`));

    // Delete old commands
    for (const cmd of commandsToDelete) {
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, cmd.id),
      );
      console.log(`✓ Deleted command: ${cmd.name}`);
    }

    console.log(`✓ Successfully deleted ${commandsToDelete.length} command(s).`);
  } catch (error) {
    console.error(error);
  }
})();
