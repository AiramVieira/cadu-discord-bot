const Discord = require("discord.js");
require("dotenv").config();
const { Player } = require("discord-music-player");
const { addSpeechEvent } = require("discord-speech-recognition");
const { doSearch, play } = require("./js/play");
const { joinRoom } = require("./js/room");
const { getGuildQueue } = require("./js/guild-queue");
const { chatValidation } = require("./js/chat-validation");

let currentPlaylist;

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.GUILD_VOICE_STATES,
  ],
});

const settings = {
  prefixes: ["#", "!", "?", "-"],
  token: process.env.DISCORD_KEY,
};

const player = new Player(client, {
  leaveOnEmpty: false,
})

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

client.on("messageCreate", (message) => {
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
      getGuildQueue(player, message).skip();
      break;
    case "stop":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message).stop();
      break;
    case "pause":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message).setPaused(true);
      break;
    case "resume":
      if (!chatValidation(client, message)) return;
      getGuildQueue(player, message).setPaused(false);
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
  }

  // if (
  //   (command === "play" || command === "p") &&
  //   chatValidation(client, message)
  // ) {
  //   if (args.join(" ").startsWith("https://")) {
  //     play(args.join(" "), message, client);
  //   } else {
  //     doSearch(message, args, client);
  //   }
  // }

  console.log("Command: ", command);
  // if (command === "skip" && chatValidation(client, message)) {
  //   getGuildQueue(player, message).skip();
  // }

  // if (command === "stop" && chatValidation(client, message)) {
  //   getGuildQueue(player, message).stop();
  // }

  // if (command === "pause" && chatValidation(client, message)) {
  //   getGuildQueue(player, message).setPaused(true);
  // }

  // if (command === "resume" && chatValidation(client, message)) {
  //   getGuildQueue(player, message).setPaused(false);
  // }

  // if (command === "playlist") {
  //   if (currentPlaylist) {
  //     return message.channel.send(currentPlaylist);
  //   }
  //   message.channel.send("Não há uma playlist!");
  // }

  // if (command === "join" && chatValidation(client, message)) {
  //   joinRoom(message, client);
  // }
});

client.login(settings.token);
