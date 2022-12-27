const {
  Client,
  Intents,
} = require("discord.js");

require("dotenv").config();
const { Player } = require("discord-music-player");
const { addSpeechEvent } = require("discord-speech-recognition");
const { doSearch, play } = require("./js/play");
const { joinRoom } = require("./js/room");
const { getGuildQueue } = require("./js/guild-queue");
const { chatValidation } = require("./js/chat-validation");
const { getMusicButtonsOptions } = require("./js/button");

let currentPlaylist;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const settings = {
  prefixes: ["#", "!", "?", "-"],
  token: process.env.DISCORD_KEY,
};

const player = new Player(client, {
  leaveOnEmpty: false,
});

addSpeechEvent(client, { lang: "pt-BR" });

client.on("ready", () => {
  console.log("I am ready to Play songs");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("speech", (message) => {
  if (!message.content) return;
  if (message.author.id === client.user.id || message.author.bot) return;

  const args = message.content.replace(/^\w*\s/g, "");

  if (message.content.toLowerCase().startsWith("play")) {
    play(args, player, message);
  }
});

client.on("messageCreate", async (message) => {
  if (!settings.prefixes.includes(message.content.charAt(0))) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  switch (command) {
    case "play":
    case "p":
      if (!chatValidation(client, message)) return;

      if (args.join(" ").startsWith("https://")) {
        play(args.join(" "), player, message);
      } else {
        doSearch(args, player, message);
      }
      break;
    case "skip":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message)?.skip();
      break;
    case "stop":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message)?.stop();
      break;
    case "pause":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message)?.setPaused(true);
      break;
    case "resume":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message)?.setPaused(false);
      break;
    case "playlist":
      if (currentPlaylist) {
        return message.channel.send(currentPlaylist);
      }
      message.channel.send("Não há uma playlist!");
      break;
    case "join":
      joinRoom(player, message);
      break;
    case "command":
      const row = getMusicButtonsOptions();

      await message.reply({
        content: "Escolha a música",
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
      break;
  }
});

client.login(settings.token);
