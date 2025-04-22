const { getUserByDiscordId } = require('../firebase/firestore');
const { EmbedBuilder } = require('discord.js');

const { getProgressBarColor } = require('../utilities/rankdetails');
const { loadProfileDisplay } = require('../utilities/profile_display');

const { console_said } = require('../utilities/console');

const { getAccessToken, getUser, getUserScore } = require('../utilities/osu_api');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const content = message.content.toLowerCase();
    // Recognizable keywords
    const commandToModeMap = {
      'osu!': 'osu',
      osu: 'osu',
      std: 'osu',

      'osu!taiko': 'taiko',
      taiko: 'taiko',

      'osu!catch': 'fruits',
      catch: 'fruits',
      ctb: 'fruits',

      'osu!mania': 'mania',
      mania: 'mania',
    };

    if (!Object.keys(commandToModeMap).includes(content)) return;

    const mode = commandToModeMap[content];
    const discordId = message.author.id;
    const userName = message.author.username;
    const userData = await getUserByDiscordId(discordId);
    console_said(content, userName);

    if (!userData) {
      return message.reply("あなたは登録されていません。登録するには `/register <osu!ユーザー名>` を使用してください。");
    }

    const username = userData.osu_username;

    try {
      const token = await getAccessToken();
      const userData = await getUser(username, mode, token);
      const userTop = await getUserScore(userData.id, mode, token);

      if (!userData) {
        return await interaction.editReply(`osu!ユーザー：**${username}**が見つかりませんでした`);
      }

      const attachment = await loadProfileDisplay(userData, userTop, mode);

      const embed = new EmbedBuilder().setColor(getProgressBarColor(userData.statistics.global_rank)).setImage('attachment://image.png');

      await message.reply({
        embeds: [embed],
        files: [attachment],
        content: `${userData.username}様のプロフィール: https://osu.ppy.sh/users/${userData.id}`,
      });
    } catch (err) {
      console.error(err);
      message.reply('Failed to fetch your osu! data. Try again later.');
    }
  },
};
