const { SlashCommandBuilder, MessageFlags, EmbedBuilder, inlineCode } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays list of available commands'),
    async execute(interaction){
        const helpEmbed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle('Help commands')
            .setDescription('Useful commands for everyday use')
            .addFields(
                {name: 'Utility:', value: `${inlineCode("/random")} ${inlineCode("/roll")} ${inlineCode("/saysupu")}`},
                {name: 'Profile:', value: `${inlineCode("/user")} ${inlineCode("/setuser")} ${inlineCode("/recent")} `},
            )

        await interaction.reply({ embeds: [helpEmbed], flags: MessageFlags.Ephemeral });
    },
};