const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '../commands');

  const loadCommands = (dir) => {
    const files = fs.readdirSync(dir);
    let commandCount = 0;

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Recursively load from subdirectories
      if (stat.isDirectory()) {
        commandCount += loadCommands(filePath);
      } else if (file.endsWith('.js')) {
        const command = require(filePath);

        // Ensure command has required properties
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command);
          console.log(`✓ Loaded command: ${command.data.name}`);
          commandCount += 1;
        } else {
          console.warn(`✗ Command at ${filePath} missing required properties (data, execute)`);
        }
      }
    }

    return commandCount;
  };

  console.log('Loading commands...');
  const totalCommands = loadCommands(commandsPath);
  console.log(`✓ Loaded ${totalCommands} command(s) total`);
};
