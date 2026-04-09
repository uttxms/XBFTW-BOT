const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete messages from a user within a time period')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The user whose messages to delete')
        .setRequired(true),
    )
    .addStringOption(option =>
      option
        .setName('time')
        .setDescription('Time period (e.g., 10m, 1h, 30s)')
        .setRequired(true),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const timeStr = interaction.options.getString('time');

    await interaction.deferReply();

    try {
      // Parse time string (e.g., "10m", "1h", "30s")
      const timeRegex = /^(\d+)([smh])$/i;
      const match = timeStr.match(timeRegex);

      if (!match) {
        return interaction.editReply({
          content: '❌ Invalid time format. Use: 10m, 1h, 30s, etc.',
        });
      }

      const amount = parseInt(match[1]);
      const unit = match[2].toLowerCase();

      let milliseconds = 0;
      if (unit === 's') milliseconds = amount * 1000;
      else if (unit === 'm') milliseconds = amount * 60 * 1000;
      else if (unit === 'h') milliseconds = amount * 60 * 60 * 1000;

      const cutoffTime = Date.now() - milliseconds;

      // Fetch messages from the channel
      let messages = [];
      let lastId = null;

      while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const fetched = await interaction.channel.messages.fetch(options);

        if (fetched.size === 0) break;

        // Filter messages by user and time
        const userMessages = fetched.filter(msg => msg.author.id === user.id && msg.createdTimestamp > cutoffTime);
        messages = messages.concat(Array.from(userMessages.values()));

        // If the oldest fetched message is older than cutoff, we can stop
        const oldestMessage = fetched.last();
        if (oldestMessage.createdTimestamp < cutoffTime) break;

        lastId = fetched.last().id;
      }

      if (messages.length === 0) {
        return interaction.editReply({
          content: `ℹ️ No messages found from ${user.tag} in the last ${timeStr}.`,
        });
      }

      // Delete messages (in batches, max 100 per deletion attempt)
      let deleted = 0;
      for (let i = 0; i < messages.length; i += 100) {
        const batch = messages.slice(i, i + 100);
        const deletePromises = batch.map(msg => msg.delete().catch(() => null));
        const results = await Promise.all(deletePromises);
        deleted += results.filter(r => r).length;
      }

      const embed = new EmbedBuilder()
        .setColor(0x00AA00)
        .setTitle('Messages Cleared')
        .addFields(
          { name: 'User', value: `${user.tag}`, inline: true },
          { name: 'Time Period', value: timeStr, inline: true },
          { name: 'Messages Deleted', value: `${deleted}`, inline: true },
          { name: 'Cleaned by', value: interaction.user.tag, inline: true },
        )
        .setThumbnail(user.displayAvatarURL())
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({
        content: `❌ Error clearing messages: ${error.message}`,
      });
    }
  },
};
