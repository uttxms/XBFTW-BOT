const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-reload')
    .setDescription('[Owner Only] Reload all commands'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const client = interaction.client;
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
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);

            if ('data' in command && 'execute' in command) {
              commands.push(command.data.toJSON());
              client.commands.set(command.data.name, command);
            }
          }
        }
      };

      loadCommands(commandsPath);

      // Deploy to Discord
      const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
      await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );

      await interaction.editReply({
        content: `✅ Reloaded ${commands.length} command(s)!`,
      });
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: `❌ Error reloading commands: ${error.message}`,
      });
    }
  },
};
