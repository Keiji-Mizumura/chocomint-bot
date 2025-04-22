const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder } = require('discord.js');
const { getAccessToken, getUserId, getRecentScores, getBeatmapsetDetails, getAdjustedDifficulty } = require('../../utilities/osu_api');
const { getUserByDiscordId } = require('../../firebase/firestore');
const { createCoverAttachment } = require('../../utilities/recent_play_cover');

const { buildEmbed } = require('../../utilities/recent_play_embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recent')
    .setDescription('最近のプレイ')
    .addStringOption((option) => option.setName('username').setDescription('あなたのosu! ユーザー名 (未登録の場合は省略)')),

  async execute(interaction) {
    await interaction.deferReply();

    let username = interaction.options.getString('username');
    const discordId = interaction.user.id;

    if (!username) {
      const userData = await getUserByDiscordId(discordId);
      if (!userData) {
        return interaction.editReply('あなたは登録されていません。`/register <username>` を使って登録してください。');
      }
      username = userData.osu_username;
    }

    try {
      const token = await getAccessToken();
      const userId = await getUserId(username, token);
      const scores = await getRecentScores(userId, token, 20);

      if (!scores || scores.length === 0) {
        return interaction.editReply({ content: `**${username}** の最近のプレイは見つかりませんでした。`, ephemeral: true });
      }

      let index = 0;

      // Initially fetch beatmap details and adjusted difficulties for all scores
      const beatmapDetails = await getBeatmapsetDetails(scores[index].beatmap.id, token);
      const cover = await createCoverAttachment(scores[index], beatmapDetails, index);
      const adjustedDifficulties = await Promise.all(
        scores.map(async (score) => {
          try {
            return await getAdjustedDifficulty(score.beatmap.id, score.mods, token);
          } catch (e) {
            console.error('Failed to fetch difficulty:', score.beatmap.id, e);
            return null; // or a default value like 0
          }
        })
      );

      const previewUrl = `https:${beatmapDetails.beatmapset.preview_url}`;
      const previewRes = await fetch(previewUrl);
      const previewBuffer = await previewRes.arrayBuffer();
      const audioAttachment = new AttachmentBuilder(Buffer.from(previewBuffer), { name: `${beatmapDetails.beatmapset.title}-preview.mp3` });

      // Build the embed with the current score's information
      const embed = buildEmbed(scores[index], beatmapDetails, index, scores.length, adjustedDifficulties[index]);

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️ 前へ').setStyle(ButtonStyle.Secondary).setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('次へ ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(scores.length <= 1)
      );

      const message = await interaction.editReply({ embeds: [embed], components: [row], files: [cover, audioAttachment] });

      const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60_000 });

      collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id)
          return i.reply({ content: 'このボタンを使えるのはコマンドを実行したユーザーのみです。', ephemeral: true });

        // Update index based on button clicked
        if (i.customId === 'next' && index < scores.length - 1) index++;
        else if (i.customId === 'prev' && index > 0) index--;

        // regenerate everything...
        const newBeatmapDetails = await getBeatmapsetDetails(scores[index].beatmap.id, token);
        const newCover = await createCoverAttachment(scores[index], newBeatmapDetails, index);
        const newAdjustedDifficulty = adjustedDifficulties[index];
        const newEmbed = buildEmbed(scores[index], newBeatmapDetails, index, scores.length, newAdjustedDifficulty);
        // Update button states for pagination
        row.components[0].setDisabled(index === 0); // Disable "prev" if at the first score
        row.components[1].setDisabled(index === scores.length - 1); // Disable "next" if at the last score

        const newPreviewUrl = `https:${newBeatmapDetails.beatmapset.preview_url}`;
        const newRes = await fetch(newPreviewUrl);
        const newBuf = await newRes.arrayBuffer();
        const newAudioAttachment = new AttachmentBuilder(Buffer.from(newBuf), { name: `${newBeatmapDetails.beatmapset.title}-preview.mp3` });

        await i.deferUpdate();
        // Update the message with the new embed, cover, and buttons
        // now edit the original message
        await i.message.edit({
          embeds: [newEmbed],
          components: [row],
          files: [newCover, newAudioAttachment],
        });
      });

      collector.on('end', async () => {
        // Disable all buttons after the collector ends
        row.components.forEach((btn) => btn.setDisabled(true));
        await interaction.editReply({ components: [row] });
      });
    } catch (error) {
      console.error('Error fetching recent scores:', error);
      return interaction.editReply({ content: 'エラーが発生しました。再度試してください。', ephemeral: true });
    }
  },
};
