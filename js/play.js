const search = require("yt-search");
const { joinRoom } = require("./room");

const play = async (url, message, client) => {
  let queue = await joinRoom(message, client);
  // let queue = client.player.createQueue(message.guild.id);
  // await queue.join(message.member.voice.channel);

  let song = await queue
    .play(url)
    .then(() => {
      let msg = "**Playlist atual:**\n";
      for (let i = 0; i < queue.songs.length; i++) {
        msg += `${i + 1}) \`${queue.songs[i].name}\`\n`;
      }

      currentPlaylist = msg;

      message.channel.send(currentPlaylist);
      return;
    })
    .catch(async (err) => {
      console.log(err);
      setTimeout(exitRoom(client, message), 1000 * 60);
    });
};

const doSearch = (message, args) => {
  search(args.join(" "), (err, res) => {
    if (err) return message.channel.send("Deu ruim, não achei as músicas");

    const videos = res.videos.slice(0, 5);

    let resp = "";
    for (let i = 0; i < videos.length; i++) {
      resp += `**[${parseInt(i) + 1}]:** \`${videos[i].title}\`\n`;
    }

    resp += `\n**Escolhe um número aí meu patrão \`1-${videos.length}\``;

    message.channel.send(resp);

    const filter = (m) =>
      !isNaN(m.content) && m.content < videos.length + 1 && m.content > 0;
    const collector = message.channel.createMessageCollector({
      filter,
      max: 1,
      time: 1000 * 10,
    });

    collector.on("collect", async (m) => {
      const index = parseInt(m.content);
      if (!isNaN(index)) {
        play(videos[index - 1].url, message, client);
      }
    });

    collector.on("end", (collected) => {
      console.log(`Collected ${collected.size} items`);
    });
  });
};

module.exports = { doSearch, play };
