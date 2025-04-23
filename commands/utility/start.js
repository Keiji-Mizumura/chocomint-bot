// commands/speak.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('speak')
    .setDescription('Start Chocomint chatbot in this server'),
  async execute(interaction) {
    const gid = interaction.guild.id;
    if (interaction.client.botRunning.get(gid)) {
      return void await interaction.reply('🚦 Chocomint is already running here!');
    }
    interaction.client.botRunning.set(gid, true);
    await interaction.reply('🟢 Chocomint chatbot is now running!');
  },
};
