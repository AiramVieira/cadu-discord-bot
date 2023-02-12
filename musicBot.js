const {
  Client,
  Intents
} = require("discord.js");

require("dotenv").config();
const { Player } = require("discord-music-player");
const { addSpeechEvent } = require("discord-speech-recognition");
const { doSearch, play } = require("./js/play");
const { joinRoom } = require("./js/room");
const { getGuildQueue } = require("./js/guild-queue");
const { chatValidation } = require("./js/chat-validation");
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
  leaveOnEmpty: true,
  leaveOnEnd: false,
});

addSpeechEvent(client, { lang: "pt-BR | en-US" });

function currentCommand(command) {
  console.log("Command:", command);
}

client.on("ready", () => {
  console.log("I am ready to Play songs");
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("speech", (message) => {
  if (!message.content) return;
  if (message.author.id === client.user.id || message.author.bot) return;

  const args = message.content.replace(/^\w*\s/g, "");
  const msg = message.content.toLowerCase();

  if (msg.startsWith("play") || msg.startsWith("tocar")) {
    currentCommand(args);
    play(args, player, message);
  }

  if (msg.startsWith("parar música")) {
    currentCommand(args);
    getGuildQueue(player, message)?.stop();
  }

  if (msg.startsWith("pausar música")) {
    currentCommand(args);
    getGuildQueue(player, message)?.setPaused(true);
  }

  if (msg.startsWith("retomar música")) {
    getGuildQueue(player, message)?.setPaused(false);
  }

  if (msg.startsWith("pular música")) {
    currentCommand(args);
    getGuildQueue(player, message)?.skip();
  }
});

client.on("messageCreate", async (message) => {
  if (!settings.prefixes.includes(message.content.charAt(0))) return;

  const args = message.content.slice(1).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  currentCommand(args);

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
    case "join":
      joinRoom(player, message);
      break;
  }
});

client.login(settings.token);
