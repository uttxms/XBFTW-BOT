const fs = require('fs');
const path = require('path');
const { isValidCommand } = require('../utils/validationUtils');

/**
 * Loads command files from a directory and its subdirectories
 * @param {Object} client - The Discord client instance
 * @returns {number} Total number of commands loaded
 */
const loadCommands = (client) => {
  const commandsDirectoryPath = path.join(__dirname, '../commands');
  
  /**
   * Processes a single command file
   * @param {string} filePath - Path to the command file
   * @returns {boolean} Whether the command was successfully loaded
   */
  const processCommandFile = (filePath) => {
    try {
      const commandModule = require(filePath);
      
      // Validate that the command has required properties
      if (isValidCommand(commandModule)) {
        client.commands.set(commandModule.data.name, commandModule);
        console.log(`✓ Loaded command: ${commandModule.data.name}`);
        return true;
      } else {
        console.warn(`✗ Command at ${filePath} missing required properties (data, execute)`);
        return false;
      }
    } catch (error) {
      console.error(`✗ Failed to load command from ${filePath}:`, error.message);
      return false;
    }
  };

  /**
   * Recursively loads commands from a directory
   * @param {string} directoryPath - Path to the directory to scan
   * @returns {number} Count of commands loaded from this directory level
   */
  const loadCommandsFromDirectory = (directoryPath) => {
    let commandCount = 0;
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileStats = fs.statSync(filePath);

      // Recursively load from subdirectories
      if (fileStats.isDirectory()) {
        commandCount += loadCommandsFromDirectory(filePath);
      } else if (file.endsWith('.js')) {
        if (processCommandFile(filePath)) {
          commandCount += 1;
        }
      }
    }

    return commandCount;
  };

  console.log('Loading commands...');
  const totalCommandsLoaded = loadCommandsFromDirectory(commandsDirectoryPath);
  console.log(`✓ Loaded ${totalCommandsLoaded} command(s) total`);
  
  return totalCommandsLoaded;
};

module.exports = loadCommands;
