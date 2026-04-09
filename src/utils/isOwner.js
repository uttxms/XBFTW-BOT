module.exports = (userId) => {
  return userId === process.env.OWNER_ID;
};
