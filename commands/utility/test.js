const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Test Development'),
    async execute(interaction){
        await interaction.reply("TEST");
    },
};