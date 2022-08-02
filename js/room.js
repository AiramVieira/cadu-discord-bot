const { getGuildQueue } = require("./guild-queue");

const joinRoom = async (message, client) => {
  let queue = client.player.createQueue(message.guild.id);
  await queue.join(message.member.voice.channel);

  return queue;
};

const exitRoom = (client, message) => {
  if (getGuildQueue(client, message)) {
    getGuildQueue(client, message).stop();
  }
};

module.exports = { joinRoom, exitRoom };
