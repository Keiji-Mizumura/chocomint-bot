// commands/stop.js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop Chocomint chatbot in this server'),
  async execute(interaction) {
    const gid = interaction.guild.id;
    if (!interaction.client.botRunning.get(gid)) {
      return void await interaction.reply('🔴 Chocomint isn’t running right now.');
    }
    interaction.client.botRunning.delete(gid);
    await interaction.reply('🛑 Chocomint has been stopped.');
  },
};
