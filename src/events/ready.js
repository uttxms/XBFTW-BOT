module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`✓ Bot logged in as ${client.user.tag}`);
  },
};
