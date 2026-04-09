const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-stop')
    .setDescription('[Owner Only] Stop the bot'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    await interaction.reply({
      content: '⏹️ Bot shutting down...',
      flags: MessageFlags.Ephemeral,
    });

    console.log(`Bot shutting down by ${interaction.user.tag}`);

    // Give the response time to send before closing
    setTimeout(() => {
      interaction.client.destroy();
      process.exit(0);
    }, 1000);
  },
};
