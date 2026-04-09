const { SlashCommandBuilder, ActivityType, MessageFlags } = require('discord.js');
const isOwner = require('../../utils/isOwner');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('owner-status')
    .setDescription('[Owner Only] Set bot status')
    .addStringOption(option =>
      option
        .setName('activity')
        .setDescription('The activity type')
        .setRequired(true)
        .addChoices(
          { name: 'Playing', value: 'PLAYING' },
          { name: 'Streaming', value: 'STREAMING' },
          { name: 'Listening', value: 'LISTENING' },
          { name: 'Watching', value: 'WATCHING' },
        ),
    )
    .addStringOption(option =>
      option
        .setName('text')
        .setDescription('The status text')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('status')
        .setDescription('The online status')
        .addChoices(
          { name: 'Online', value: 'online' },
          { name: 'Idle', value: 'idle' },
          { name: 'Do Not Disturb', value: 'dnd' },
          { name: 'Invisible', value: 'invisible' },
        ),
    ),

  async execute(interaction) {
    if (!isOwner(interaction.user.id)) {
      return interaction.reply({
        content: '❌ This command is only available to the bot owner.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const activity = interaction.options.getString('activity');
    const text = interaction.options.getString('text');
    const status = interaction.options.getString('status') || 'online';

    const activityType = ActivityType[activity];

    try {
      interaction.client.user.setPresence({
        activities: [{ name: text, type: activityType }],
        status: status,
      });

      await interaction.reply({
        content: `✅ Status updated: **${activity}** ${text} (${status})`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Error updating status: ${error.message}`,
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
