const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

// Recursively load all local commands
const localCommandNames = new Set();
const commandsPath = path.join(__dirname, '../commands');

const loadCommandNames = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      loadCommandNames(filePath);
    } else if (file.endsWith('.js')) {
      const command = require(filePath);
      if ('data' in command && command.data?.name) {
        localCommandNames.add(command.data.name);
      }
    }
  }
};

(async () => {
  try {
    loadCommandNames(commandsPath);
    console.log(`Found ${localCommandNames.size} local command(s): ${Array.from(localCommandNames).join(', ')}`);

    console.log('Fetching all registered commands from Discord...');

    // Get all registered commands from Discord
    const registeredCommands = await rest.get(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
    );

    if (registeredCommands.length === 0) {
      console.log('✓ No commands registered on Discord.');
      return;
    }

    // Find commands to delete (registered but not in local code)
    const commandsToDelete = registeredCommands.filter(cmd => !localCommandNames.has(cmd.name));

    if (commandsToDelete.length === 0) {
      console.log('✓ All registered commands exist in your code. Nothing to delete.');
      return;
    }

    console.log(`\nFound ${commandsToDelete.length} orphaned command(s) to delete:`);
    commandsToDelete.forEach(cmd => console.log(`  - ${cmd.name}`));

    // Delete old commands
    for (const cmd of commandsToDelete) {
      await rest.delete(
        Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, cmd.id),
      );
      console.log(`✓ Deleted: ${cmd.name}`);
    }

    console.log(`\n✓ Successfully cleaned up ${commandsToDelete.length} orphaned command(s).`);
  } catch (error) {
    console.error(error);
  }
})();
