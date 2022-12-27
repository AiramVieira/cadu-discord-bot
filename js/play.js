const search = require("yt-search");
const { getMusicButtonsOptions } = require("./button");
const { joinRoom, exitRoom } = require("./room");

const play = async (url, player, message) => {
  let queue = await joinRoom(player, message);
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
      exitRoom(player, message);
    });
};

const doSearch = (args, player, message) => {
  search(args.join(" "), async (err, res) => {
    if (err) return message.channel.send("Deu ruim, não achei as músicas");

    const videos = res.videos.slice(0, 5);

    let resp = "";
    for (let i = 0; i < videos.length; i++) {
      resp += `**[${parseInt(i) + 1}]:** \`${videos[i].title}\`\n`;
    }

    // resp += `\n**Escolhe um número aí meu patrão \`1-${videos.length}\``;

    // message.channel.send(resp);

    const row = getMusicButtonsOptions();

    await message.reply({
      content: resp,
      components: [row],
      ephemeral: true,
    });

    const filter = (btn) => {
      return message.author.id === btn.user.id;
    };

    const collector = message.channel.createMessageComponentCollector({
      filter,
      max: 1,
      time: 1000 * 15,
    });

    collector.on("collect", async (m) => {
      play(videos[+m.customId].url, player, message);
    });

    collector.on("end", async (collection) => {
      collection.forEach((e) => {
        console.log(e.message.author);
        if (e.message.author.bot)
          e.message.edit({
            content: "Um corno escolheu uma música",
            components: [],
          });
      });
    });
  });
};

module.exports = { doSearch, play };
