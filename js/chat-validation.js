const _validRoomNames = ["comando", "comandos", "command", "commands"];

const chatValidation = (client, message) => {
  if (message.author.id === client.user.id || message.author.bot) {
    return false;
  } else {
    // const roomName = message.channel.name;
    // const canal = client.channels.cache.find(
    //   (channel) =>
    //     _validRoomNames.includes(channel.name) &&
    //     message.guild.id === channel.guild.id
    // );

    // if (!_validRoomNames.includes(roomName)) {
    //   message.channel.send(`Só obedeço comandos na sala <#${canal.id}>`);
    //   return false;
    // }

    if (!message.member.voice.channel) {
      message.channel.send("Você precisa estar em um canal de voz!");
      return false;
    }
    return true;
  }
};

module.exports = { chatValidation };
