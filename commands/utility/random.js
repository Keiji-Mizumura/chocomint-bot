const { SlashCommandBuilder } = require('discord.js');
const { osuThoughts } = require('../../utilities/botreplies');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('random')
    .setDescription('ランダムなosu!のひとこと'),
  async execute(interaction) {
    const categories = Object.keys(osuThoughts);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const thoughts = osuThoughts[randomCategory];
    const thought = thoughts[Math.floor(Math.random() * thoughts.length)];
    await interaction.channel.sendTyping();
    await new Promise(res => setTimeout(res, 2000)); // optional delay
    await interaction.reply(thought);
  },
};
