const getGuildQueue = (player, message) => {
    try {
        return player.getQueue(message.guild.id)
    } catch(e) {
        console.log('Failed to get guild queue!\n', e);
    }
}
module.exports = { getGuildQueue };
