const getGuildQueue = (client, message) => {
    return client.player.getQueue(message.guild.id)
}
module.exports = { getGuildQueue };
