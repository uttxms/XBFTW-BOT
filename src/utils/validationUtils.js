/**
 * Utility functions for validating Discord bot components
 */

/**
 * Validates that a command module has the required properties
 * @param {Object} commandModule - The command module to validate
 * @returns {boolean} Whether the command is valid
 */
const isValidCommand = (commandModule) => {
  return 'data' in commandModule && 'execute' in commandModule;
};

/**
 * Validates that an event module has the required properties
 * @param {Object} eventModule - The event module to validate
 * @returns {boolean} Whether the event is valid
 */
const isValidEvent = (eventModule) => {
  return 'name' in eventModule && 'execute' in eventModule;
};

module.exports = {
  isValidCommand,
  isValidEvent
};