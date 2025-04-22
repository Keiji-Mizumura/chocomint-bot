const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('saysupu')
        .setDescription('Chocomintにすぷと言わせる'),
    async execute(interaction){
        await interaction.reply({ content: 'すぷ' });
    },
};