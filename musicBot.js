const Discord = require("discord.js");
const search = require("yt-search");
require("dotenv").config();
const { Player } = require("discord-music-player");

let currentPlaylist;

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const settings = {
  prefixes: ["#", "!", "?", "@"],
  token: process.env.DISCORD_KEY,
};

const player = new Player(client, {
  leaveOnEmpty: false,
});
client.player = player;

client.on("ready", () => {
  console.log("I am ready to Play songs");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("messageCreate", (message) => {
  if (!settings.prefixes.includes(message.content.charAt(0))) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  let guildQueue = client.player.getQueue(message.guild.id);

  const chatValidation = () => {
    if (message.author.id === client.user.id || message.author.bot) {
      console.log("mensagem do bot");
      return false;
    } else {
      if (!message.member.voice.channel) {
        message.channel.send("Você precisa estar em um canal de voz!");
        return false;
      }
      console.log("mensagem do usuário", message.author.username);
      return true;
    }
  };

  if ((command === "play" || command === "p") && chatValidation()) {
    const play = async (url) => {
      let queue = client.player.createQueue(message.guild.id);
      await queue.join(message.member.voice.channel);

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
          if (guildQueue) {
            await new Promise((resolve, reject) =>
              setTimeout(resolve, 1000 * 60)
            );
            guildQueue.stop();
          }
        });
    };

    if (args.join(" ").startsWith("https://")) {
      play(args.join(" "));
    } else {
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
            play(videos[index - 1].url);
          }
        });

        collector.on("end", (collected) => {
          console.log(`Collected ${collected.size} items`);
        });
      });
    }
  }

  console.log("Command: ", command);
  if (command === "skip" && chatValidation()) {
    guildQueue.skip();
  }

  if (command === "stop" && chatValidation()) {
    guildQueue.stop();
  }

  if (command === "pause" && chatValidation()) {
    guildQueue.setPaused(true);
  }

  if (command === "resume" && chatValidation()) {
    guildQueue.setPaused(false);
  }

  if (command === "playlist") {
    if (currentPlaylist) {
      return message.channel.send(currentPlaylist);
    }
    message.channel.send("Não há uma playlist!");
  }
});

client.login(settings.token);
