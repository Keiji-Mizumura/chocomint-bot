const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getUserByDiscordId } = require('../../firebase/firestore');
const { getAccessToken, getUser, getUserScore } = require('../../utilities/osu_api');
const { loadProfileDisplay } = require('../../utilities/profile_display');

const { getProgressBarColor } = require('../../utilities/rankdetails');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Displays user information.')
    .addStringOption((option) => option.setName('username').setDescription('Your osu! username (optional if registered).'))
    .addStringOption((option) =>
      option
        .setName('mode')
        .setDescription('Gamemode')
        .addChoices(
          { name: 'Standard', value: 'osu' },
          { name: 'Taiko', value: 'taiko' },
          { name: 'Catch', value: 'fruits' },
          { name: 'Mania', value: 'mania' }
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: false }); // <- Defer early

    let username = interaction.options.getString('username');
    let mode = interaction.options.getString('mode') ?? 'osu';
    const discordId = interaction.user.id;

    if (!username) {
      const userData = await getUserByDiscordId(discordId);
      if (!userData) {
        return await interaction.editReply("あなたは登録されていません。登録するには `/register <osu!ユーザー名>` を使用してください。");
      }
      username = userData.osu_username;
    }

    try {
      const token = await getAccessToken();
      const userData = await getUser(username, mode, token);
      const userTop = await getUserScore(userData.id, mode, token);

      if (!userData) {
        return await interaction.editReply(`osu!ユーザー：**${username}**が見つかりませんでした`);
      }

      const attachment = await loadProfileDisplay(userData, userTop, mode);
      
      const embed = new EmbedBuilder().setColor(getProgressBarColor(userData.statistics.global_rank)).setImage('attachment://image.png');

      await interaction.editReply({
        embeds: [embed],
        files: [attachment],
        content: `${userData.username}様のプロフィール: https://osu.ppy.sh/users/${userData.id}`,
      });
    } catch (error) {
      console.error('Unexpected error:', error);
      const errorMessage = 'There was an error fetching your profile. Please try again later.';

      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: errorMessage });
      } else {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};
