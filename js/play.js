const search = require("yt-search");
const { getMusicButtonsOptions } = require("./button");
const { joinRoom, exitRoom } = require("./room");

const _play = (queue, url, message, showPlaylist) => {
  try {
    console.log('url: ', url);
    return new Promise(async (resolve) => {
      queue
        .play(url)
        .then(() => {
          if (showPlaylist) {
            let msg = "**Playlist atual:**\n";
            for (let i = 0; i < queue.songs.length; i++) {
              msg += `${i + 1}) \`${queue.songs[i].name}\`\n`;
            }

            currentPlaylist = msg;

            message.channel.send(currentPlaylist);
            resolve();
          }
        })
        .catch(async (err) => {
          console.log(err);
        })
    })
  } catch (err) {
    console.log(err);
  }
}

const play = async (url, player, message, showPlaylist = true) => {
  let queue = await joinRoom(player, message);
  _play(queue, url, message, showPlaylist);
};

const doSearch = (args, player, message) => {
  search(args.join(" "), async (err, res) => {
    if (err) return message.channel.send("Deu ruim, não achei as músicas");

    const videos = res.videos.slice(0, 5);

    let resp = "";
    for (let i = 0; i < videos.length; i++) {
      resp += `**[${parseInt(i) + 1}]:** \`${videos[i].title}\`\n`;
    }

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
