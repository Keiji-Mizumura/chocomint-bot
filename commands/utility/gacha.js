const { SlashCommandBuilder, MessageFlags, EmbedBuilder, inlineCode } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('Character Gacha'),
    async execute(interaction){
        const helpEmbed = new EmbedBuilder()
            .setColor("#42f5a7")
            .setTitle('Under development')
            .setDescription('.......')
            .addFields(
                {name: 'Character:', value: 'Description'},
            )

        await interaction.reply({ embeds: [helpEmbed] });
    },
};