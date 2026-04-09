const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-clear')
    .setDescription('[Owner Only] Remove commands that no longer exist locally'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

      // Get all registered commands
      const commands = await rest.get(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      );

      if (commands.length === 0) {
        return interaction.editReply({
          content: '✅ No commands registered. Nothing to delete.',
        });
      }

      // Get local commands
      const commandsPath = path.join(__dirname, '../../commands');
      const localCommands = new Set();

      const loadLocalCommands = (dir) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            loadLocalCommands(filePath);
          } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if (command.data?.name) {
              localCommands.add(command.data.name);
            }
          }
        }
      };

      loadLocalCommands(commandsPath);

      // Find commands to delete
      const commandsToDelete = commands.filter(cmd => !localCommands.has(cmd.name));

      if (commandsToDelete.length === 0) {
        return interaction.editReply({
          content: '✅ All registered commands exist locally. Nothing to delete.',
        });
      }

      // Delete them
      for (const cmd of commandsToDelete) {
        await rest.delete(
          Routes.applicationGuildCommand(process.env.CLIENT_ID, process.env.GUILD_ID, cmd.id),
        );
      }

      const deleted = commandsToDelete.map(cmd => `\`${cmd.name}\``).join(', ');
      await interaction.editReply({
        content: `✅ Deleted ${commandsToDelete.length} command(s): ${deleted}`,
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: `❌ Error clearing commands: ${error.message}`,
      });
    }
  },
};
