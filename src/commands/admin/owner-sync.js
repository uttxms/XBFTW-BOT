const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-sync')
    .setDescription('[Owner Only] Deploy all commands to Discord'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const commands = [];
      const commandsPath = path.join(__dirname, '../../commands');

      const loadCommands = (dir) => {
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);

          if (stat.isDirectory()) {
            loadCommands(filePath);
          } else if (file.endsWith('.js')) {
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
              commands.push(command.data.toJSON());
            }
          }
        }
      };

      loadCommands(commandsPath);

      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );

      await interaction.editReply({
        content: `✅ Synced ${commands.length} command(s) with Discord!`,
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: `❌ Error syncing commands: ${error.message}`,
      });
    }
  },
};
