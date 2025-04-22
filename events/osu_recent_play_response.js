const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder } = require('discord.js');

const { getAccessToken, getUserId, getRecentScores, getBeatmapsetDetails, getAdjustedDifficulty } = require('../utilities/osu_api');

const { getUserByDiscordId } = require('../firebase/firestore');
const { createCoverAttachment } = require('../utilities/recent_play_cover');

const { buildEmbed } = require('../utilities/recent_play_embed');

const triggerKeywords = ['!recent', '-recent', 'recent', 'rs', '最近プレイ', '最近'];

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    // Only respond to specific keywords
    if (message.author.bot || !triggerKeywords.some((keyword) => message.content.toLowerCase().startsWith(keyword))) {
      return;
    }

    const args = message.content.trim().split(/\s+/);
    let username = args.slice(1).join(' ') || null;

    const discordId = message.author.id;

    if (!username) {
      const userData = await getUserByDiscordId(discordId);
      if (!userData) {
        return message.reply('あなたは登録されていません。`/register <username>` を使って登録してください。');
      }
      username = userData.osu_username;
    }

    try {
      await message.channel.sendTyping();

      const token = await getAccessToken();
      const userId = await getUserId(username, token);
      const scores = await getRecentScores(userId, token, 20);

      if (!scores || scores.length === 0) {
        return message.reply(`**${username}** の最近のプレイは見つかりませんでした。`);
      }

      let index = 0;

      const beatmapDetails = await getBeatmapsetDetails(scores[index].beatmap.id, token);
      const cover = await createCoverAttachment(scores[index], beatmapDetails, index);
      const adjustedDifficulties = await Promise.all(
        scores.map(async (score) => {
          try {
            return await getAdjustedDifficulty(score.beatmap.id, score.mods, token);
          } catch (e) {
            console.error('Failed to fetch difficulty:', score.beatmap.id, e);
            return null;
          }
        })
      );

      const previewUrl = `https:${beatmapDetails.beatmapset.preview_url}`;
      const previewRes = await fetch(previewUrl);
      const previewBuffer = await previewRes.arrayBuffer();
      const audioAttachment = new AttachmentBuilder(Buffer.from(previewBuffer), {
        name: `${beatmapDetails.beatmapset.title}-preview.mp3`,
      });

      const embed = buildEmbed(scores[index], beatmapDetails, index, scores.length, adjustedDifficulties[index]);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️ 前へ').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('次へ ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(scores.length <= 1)
      );

      const sentMessage = await message.reply({ embeds: [embed], components: [row], files: [cover, audioAttachment] });

      const collector = sentMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000,
      });

      collector.on('collect', async (i) => {
        if (i.user.id !== message.author.id) return i.reply({ content: 'このボタンを使えるのはこのコマンドを実行した人だけです。', ephemeral: true });

        if (i.customId === 'next' && index < scores.length - 1) index++;
        else if (i.customId === 'prev' && index > 0) index--;

        const newBeatmapDetails = await getBeatmapsetDetails(scores[index].beatmap.id, token);
        const newCover = await createCoverAttachment(scores[index], newBeatmapDetails, index);
        const newAdjustedDifficulty = adjustedDifficulties[index];
        const newEmbed = buildEmbed(scores[index], newBeatmapDetails, index, scores.length, newAdjustedDifficulty);

        row.components[0].setDisabled(index === 0);
        row.components[1].setDisabled(index === scores.length - 1);

        const newPreviewUrl = `https:${newBeatmapDetails.beatmapset.preview_url}`;
        const newRes = await fetch(newPreviewUrl);
        const newBuf = await newRes.arrayBuffer();
        const newAudioAttachment = new AttachmentBuilder(Buffer.from(newBuf), {
          name: `${newBeatmapDetails.beatmapset.title}-preview.mp3`,
        });

        await i.deferUpdate();
        await i.message.edit({
          embeds: [newEmbed],
          components: [row],
          files: [newCover, newAudioAttachment],
        });
      });

      collector.on('end', async () => {
        row.components.forEach((btn) => btn.setDisabled(true));
        await sentMessage.edit({ components: [row] });
      });
    } catch (err) {
      console.error(err);
      return message.reply('エラーが発生しました。再度お試しください。');
    }
  },
};
