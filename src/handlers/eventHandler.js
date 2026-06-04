const fs = require('fs');
const path = require('path');
const { isValidEvent } = require('../utils/validationUtils');

/**
 * Loads event files from the events directory
 * @param {Object} client - The Discord client instance
 */
const loadEvents = (client) => {
  const eventsDirectoryPath = path.join(__dirname, '../events');
  const eventFiles = fs.readdirSync(eventsDirectoryPath).filter(file => file.endsWith('.js'));

  console.log(`Loading ${eventFiles.length} event(s)...`);

  /**
   * Processes a single event file
   * @param {Object} eventModule - The event module to process
   * @param {string} filePath - Path to the event file
   * @returns {boolean} Whether the event was successfully loaded
   */
  const processEventFile = (eventModule, filePath) => {
    // Validate that the event has required properties
    if (!isValidEvent(eventModule)) {
      console.warn(`✗ Event at ${filePath} missing required properties (name, execute)`);
      return false;
    }

    try {
      if (eventModule.once) {
        client.once(eventModule.name, (...args) => eventModule.execute(...args, client));
      } else {
        client.on(eventModule.name, (...args) => eventModule.execute(...args, client));
      }
      console.log(`✓ Loaded event: ${eventModule.name}`);
      return true;
    } catch (error) {
      console.error(`✗ Failed to register event ${eventModule.name}:`, error.message);
      return false;
    }
  };

  // Process each event file
  for (const fileName of eventFiles) {
    const filePath = path.join(eventsDirectoryPath, fileName);
    try {
      const eventModule = require(filePath);
      processEventFile(eventModule, filePath);
    } catch (error) {
      console.error(`✗ Failed to load event from ${filePath}:`, error.message);
    }
  }
};

module.exports = loadEvents;