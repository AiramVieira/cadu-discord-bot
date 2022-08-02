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
});
client.player = player;
addSpeechEvent(client, {lang: 'pt-BR'});


client.on("ready", () => {
  console.log("I am ready to Play songs");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("speech", (message) => {
  console.log(message.content)
  if (!message.content) return;
  if (message.author.id === client.user.id || message.author.bot) return;
  const args = message.content.replace(/^\w*\s/g, "");

  if (message.content.toLowerCase().startsWith("play")) {
    play(args, message, client);
  }
});

client.on("messageCreate", (message) => {
  if (!settings.prefixes.includes(message.content.charAt(0))) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // const chatValidation = () => {
  //   if (message.author.id === client.user.id || message.author.bot) {
  //     return false;
  //   } else {
  //     const roomName = message.channel.name;
  //     const canal = client.channels.cache.find(
  //       (channel) =>
  //         validRoomNames.includes(channel.name) &&
  //         message.guild.id === channel.guild.id
  //     );

  //     if (!validRoomNames.includes(roomName)) {
  //       message.channel.send(`Só obedeço comandos na sala <#${canal.id}>`);
  //       return false;
  //     }

  //     if (!message.member.voice.channel) {
  //       message.channel.send("Você precisa estar em um canal de voz!");
  //       return false;
  //     }
  //     return true;
  //   }
  // };

  if ((command === "play" || command === "p") && chatValidation(message, client)) {
    if (args.join(" ").startsWith("https://")) {
      play(args.join(" "), message, client);
    } else {
      doSearch(message, args, client);
    }
  }

  console.log("Command: ", command);
  if (command === "skip" && chatValidation(message, client)) {
    getGuildQueue(client, message).skip();
  }

  if (command === "stop" && chatValidation(message, client)) {
    getGuildQueue(client, message).stop();
  }

  if (command === "pause" && chatValidation(message, client)) {
    getGuildQueue(client, message).setPaused(true);
  }

  if (command === "resume" && chatValidation(message, client)) {
    getGuildQueue(client, message).setPaused(false);
  }

  if (command === "playlist") {
    if (currentPlaylist) {
      return message.channel.send(currentPlaylist);
    }
    message.channel.send("Não há uma playlist!");
  }

  if (command === "join" && chatValidation(message, client)) {
    joinRoom(message, client);
  }
});

client.login(settings.token);

