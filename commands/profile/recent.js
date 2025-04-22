const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  AttachmentBuilder
} = require('discord.js');
const {
  getAccessToken,
  getUserId,
  getRecentScores,
  getBeatmapsetDetails,
  getAdjustedDifficulty
} = require('../../utilities/osu_api');
const { getUserByDiscordId } = require('../../firebase/firestore');
const { createCoverAttachment } = require('../../utilities/recent_play_cover');
const { buildEmbed } = require('../../utilities/recent_play_embed');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('recent')
    .setDescription('最近のプレイ')
    .addStringOption(opt =>
      opt
        .setName('username')
        .setDescription('あなたのosu! ユーザー名 (未登録の場合は省略)')
    ),

  async execute(interaction) {
    await interaction.deferReply();
    let username = interaction.options.getString('username');
    const discordId = interaction.user.id;

    if (!username) {
      const userData = await getUserByDiscordId(discordId);
      if (!userData) {
        return interaction.editReply(
          'あなたは登録されていません。`/register <username>` を使って登録してください。'
        );
      }
      username = userData.osu_username;
    }

    try {
      const token = await getAccessToken();
      const osuUserId = await getUserId(username, token);
      const scores = await getRecentScores(osuUserId, token, 20);

      if (!scores?.length) {
        return interaction.editReply({
          content: `**${username}** の最近のプレイは見つかりませんでした。`,
          ephemeral: true
        });
      }

      let index = 0;

      // Initial fetch
      const beatmapDetails = await getBeatmapsetDetails(scores[index].beatmap.id, token);
      const cover = await createCoverAttachment(scores[index], beatmapDetails, index);
      const adjustedDifficulties = await Promise.all(
        scores.map(async score => {
          try {
            return await getAdjustedDifficulty(score.beatmap.id, score.mods, token);
          } catch {
            return null;
          }
        })
      );

      // Load preview audio
      const previewUrl = `https:${beatmapDetails.beatmapset.preview_url}`;
      const previewRes = await fetch(previewUrl);
      const previewBuf = await previewRes.arrayBuffer();
      const audioAttachment = new AttachmentBuilder(
        Buffer.from(previewBuf),
        { name: `${beatmapDetails.beatmapset.title}-preview.mp3` }
      );

      // Build embed & buttons
      const embed = buildEmbed(
        scores[index],
        beatmapDetails,
        index,
        scores.length,
        adjustedDifficulties[index]
      );
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ 前へ')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('次へ ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(scores.length <= 1)
      );

      const message = await interaction.editReply({
        embeds: [embed],
        components: [row],
        files: [cover, audioAttachment]
      });

      const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000
      });

      collector.on('collect', async i => {
        // ONLY ACK within 3s to avoid "This interaction failed"
        if (i.user.id !== interaction.user.id) {
          return i.reply({
            content: 'このボタンを使えるのはコマンド実行者のみです。',
            ephemeral: true
          });
        }

        // immediate ACK
        await i.deferUpdate();

        try {
          // Update index
          if (i.customId === 'next' && index < scores.length - 1) index++;
          else if (i.customId === 'prev' && index > 0) index--;

          // Re-fetch details
          const newBeatmap = await getBeatmapsetDetails(
            scores[index].beatmap.id,
            token
          );
          const newCover = await createCoverAttachment(
            scores[index],
            newBeatmap,
            index
          );
          const newAdj = adjustedDifficulties[index];
          const newEmbed = buildEmbed(
            scores[index],
            newBeatmap,
            index,
            scores.length,
            newAdj
          );

          // Update button states
          row.components[0].setDisabled(index === 0);
          row.components[1].setDisabled(index === scores.length - 1);

          // Reload preview audio
          const newPreviewUrl = `https:${newBeatmap.beatmapset.preview_url}`;
          const newRes = await fetch(newPreviewUrl);
          const newBuf = await newRes.arrayBuffer();
          const newAudio = new AttachmentBuilder(
            Buffer.from(newBuf),
            { name: `${newBeatmap.beatmapset.title}-preview.mp3` }
          );

          // Edit the message
          await message.edit({
            embeds: [newEmbed],
            components: [row],
            files: [newCover, newAudio]
          });
        } catch (err) {
          console.error('Error in collector:', err);
        }
      });

      collector.on('end', async () => {
        // disable all buttons
        row.components.forEach(btn => btn.setDisabled(true));
        await interaction.editReply({ components: [row] });
      });
    } catch (error) {
      console.error('Error fetching recent scores:', error);
      return interaction.editReply({
        content: 'エラーが発生しました。再度試してください。',
        ephemeral: true
      });
    }
  }
};
