const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-info')
    .setDescription('[Owner Only] Get bot information'),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const client = interaction.client;
    const uptime = Math.floor(client.uptime / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    await interaction.reply({
      embeds: [
        {
          color: 0x00ff00,
          title: '🤖 Bot Information',
          fields: [
            {
              name: 'Bot Name',
              value: client.user.username,
              inline: true,
            },
            {
              name: 'Bot ID',
              value: client.user.id,
              inline: true,
            },
            {
              name: 'Uptime',
              value: `${hours}h ${minutes}m ${seconds}s`,
              inline: true,
            },
            {
              name: 'Guilds',
              value: client.guilds.cache.size.toString(),
              inline: true,
            },
            {
              name: 'Commands Loaded',
              value: client.commands.size.toString(),
              inline: true,
            },
            {
              name: 'Events Loaded',
              value: client.events.size.toString(),
              inline: true,
            },
          ],
          timestamp: new Date(),
        },
      ],
      flags: MessageFlags.Ephemeral,
    });
  },
};
