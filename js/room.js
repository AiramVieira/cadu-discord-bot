const { getGuildQueue } = require("./guild-queue");

const joinRoom = async (player, message) => {
  try {
    let queue = player.createQueue(message.guild.id);
    await queue.join(message.member.voice.channel);
    
    return queue;
  } catch (error) {
    console.log(error);
  } 
};

const exitRoom = (player, message) => {
  getGuildQueue(player, message).stop();
};

module.exports = { joinRoom, exitRoom };
