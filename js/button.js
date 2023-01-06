const { MessageActionRow, MessageButton } = require("discord.js");

const getMusicButtonsOptions = () => {
  return new MessageActionRow()
    .addComponents(
      new MessageButton().setCustomId("0").setEmoji("1️⃣").setStyle("SUCCESS")
    )
    .addComponents(
      new MessageButton().setCustomId("1").setEmoji("2️⃣").setStyle("SUCCESS")
    )
    .addComponents(
      new MessageButton().setCustomId("2").setEmoji("3️⃣").setStyle("SUCCESS")
    )
    .addComponents(
      new MessageButton().setCustomId("3").setEmoji("4️⃣").setStyle("SUCCESS")
    )
    .addComponents(
      new MessageButton().setCustomId("4").setEmoji("5️⃣").setStyle("SUCCESS")
    );
}

module.exports = { getMusicButtonsOptions };
