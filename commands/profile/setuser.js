const { SlashCommandBuilder } = require('discord.js');
const { getUserByDiscordId, setUser } = require('../../firebase/firestore');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('register')
    .setDescription('Register or update your osu! username')
    .addStringOption(option =>
      option.setName('username')
        .setDescription('Your osu! username')
        .setRequired(true)
    ),
  async execute(interaction) {
    const osuUsername = interaction.options.getString('username');
    const discordId = interaction.user.id;

    const existingUser = await getUserByDiscordId(discordId);

    if (existingUser) {
      const oldUsername = existingUser.osu_username;

      await setUser(discordId, osuUsername);

      if (oldUsername === osuUsername) {
        await interaction.reply(`You're already registered as **${osuUsername}**. No changes made.`);
      } else {
        await interaction.reply(`Username updated from **${oldUsername}** to **${osuUsername}**.`);
      }
    } else {
      await setUser(discordId, osuUsername);
      await interaction.reply(`Successfully registered **${osuUsername}** to your Discord account.`);
    }
  },
};
