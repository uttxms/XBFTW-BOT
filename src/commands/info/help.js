const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Show all available commands'),

  async execute(interaction) {
    const commands = {
      General: [],
      Fun: [],
      'Server Admin': [],
      'Bot Owner': [],
    };

    const commandsPath = path.join(__dirname, '../../commands');

    // Load all commands recursively
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
            const cmdName = command.data.name;
            const cmdDesc = command.data.description;
            const defaultPerms = command.data.default_member_permissions;

            // Categorize the command
            let category = 'General';

            // Check if owner-only
            if (cmdDesc.includes('[Owner Only]') || cmdName.startsWith('owner-')) {
              category = 'Bot Owner';
            }
            // Check if admin-only (has permission requirements)
            else if (defaultPerms || ['say', 'ban', 'kick', 'clear'].includes(cmdName)) {
              category = 'Server Admin';
            }
            // Check if fun command
            else if (cmdName === 'ping') {
              category = 'Fun';
            }

            commands[category].push({ name: cmdName, description: cmdDesc });
          }
        }
      }
    };

    loadCommands(commandsPath);

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('📚 Bot Commands')
      .setColor(0x0099ff)
      .setDescription('Use `/commandname` to execute a command.');

    // Add fields in specific order with icons
    const categoryOrder = ['General', 'Fun', 'Server Admin', 'Bot Owner'];
    const iconMap = {
      General: '📋',
      Fun: '🎮',
      'Server Admin': '⚙️',
      'Bot Owner': '👑',
    };

    for (const category of categoryOrder) {
      const cmds = commands[category];
      if (cmds.length === 0) continue;

      const commandList = cmds
        .map(cmd => `\`/${cmd.name}\` - ${cmd.description}`)
        .join('\n');

      embed.addFields({
        name: `${iconMap[category]} ${category}`,
        value: commandList,
        inline: false,
      });
    }

    embed
      .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
