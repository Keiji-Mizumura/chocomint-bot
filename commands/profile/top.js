const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder
} = require('discord.js');
const {
    getAccessToken,
    getUserId,
    getUser,
    getTopScores,
    getBeatmapsetDetails,
    getAdjustedDifficulty
} = require('../../utilities/osu_api');
const { applyModsToStats } = require('../../utilities/difficulty_readjust');
const rankImgs = require('../../utilities/rank_achieve_images.json');
const { getUserByDiscordId } = require('../../firebase/firestore');

// Utility to format relative time (e.g., "a month ago")
function timeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];
    for (const { label, seconds: s } of intervals) {
        const count = Math.floor(seconds / s);
        if (count >= 1) return `${count} ${label}${count > 1 ? 's' : ''} ago`;
    }
    return 'just now';
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('top')
        .setDescription('ユーザーのトッププレイを表示します')
        .addStringOption(opt =>
            opt.setName('user').setDescription('osu! ユーザー名 (未登録時は省略)')
        )
        .addStringOption(opt =>
            opt
                .setName('mode')
                .setDescription('ゲームモードを選択')
                .addChoices(
                    { name: 'Standard', value: 'osu' },
                    { name: 'Taiko', value: 'taiko' },
                    { name: 'Catch', value: 'fruits' },
                    { name: 'Mania', value: 'mania' }
                )
        )
        .addIntegerOption(opt =>
            opt
                .setName('limit')
                .setDescription('取得するトッププレイ数 (最大: 50)')
                .setMinValue(1)
                .setMaxValue(50)
        )
        .addStringOption(opt =>
            opt
                .setName('type')
                .setDescription('表示タイプを選択')
                .addChoices({ name: 'List', value: 'list' })
        ),

    async execute(interaction) {
        await interaction.deferReply();
        const discordId = interaction.user.id;
        let osuUsername = interaction.options.getString('user');
        const mode = interaction.options.getString('mode') || 'osu';
        const limit = interaction.options.getInteger('limit') || 5;

        if (!osuUsername) {
            const userData = await getUserByDiscordId(discordId);
            if (!userData)
                return interaction.editReply('登録が必要です。`/register <username>`で登録してください。');
            osuUsername = userData.osu_username;
        }

        try {
            const token = await getAccessToken();
            const osuUserId = await getUserId(osuUsername, token);
            const userDetails = await getUser(osuUserId, token);
            const scores = await getTopScores(osuUserId, token, limit, mode);
            if (!scores.length)
                return interaction.editReply(`**${osuUsername}** のトッププレイがありません。`);

            // Pre-fetch beatmap details and difficulty attributes
            const [detailsList, attrsList] = await Promise.all([
                Promise.all(scores.map(s => getBeatmapsetDetails(s.beatmap.id, token))),
                Promise.all(scores.map(s => getAdjustedDifficulty(s.beatmap.id, token, s.mods)))
            ]);

            // chunk into pages of 10
            const pages = [];
            for (let i = 0; i < scores.length; i += 10) {
                pages.push(scores.slice(i, i + 10).map((score, idx) => {
                    const det = detailsList[i + idx];
                    const attrs = attrsList[i + idx] || {};
                    const bm = det.beatmapset;

                    const modStats = applyModsToStats(det, score.mods);
                    const bpm = modStats.bpm;
                    const avgStars = attrs.star_rating?.toFixed(2) || det.difficulty_rating.toFixed(2);
                    const version = det.version;
                    const mods = score.mods.length ? score.mods.join('') : 'NM';
                    const pp = score.pp.toFixed(2);
                    const acc = (score.accuracy * 100).toFixed(2);
                    const playcount = bm.play_count.toLocaleString();
                    const combo = score.max_combo;
                    const comboMax = det.max_combo;
                    const stats = score.statistics;
                    const counts = `[${stats.count_300}/${stats.count_100}/${stats.count_50}/${stats.count_miss}]`;
                    const when = timeAgo(new Date(score.created_at));
                    const rankEmoji = rankImgs[score.rank] || '';
                    const mapUrl = `https://osu.ppy.sh/beatmaps/${det.id}`;

                    return {
                        index: i + idx + 1,
                        title: bm.title,
                        version,
                        mapUrl,
                        mods,
                        avgStars,
                        bpm,
                        rankEmoji,
                        pp,
                        acc,
                        playcount,
                        combo,
                        comboMax,
                        counts,
                        when
                    };
                }));
            }

            // build embed for a page
            const buildEmbed = pageIdx => {
                const entries = pages[pageIdx];
                const description = entries.map(e =>
                    `**${e.index})** [${e.title}${e.version ? ` [${e.version}]` : ''}](${e.mapUrl})
` +
                    `▸ ${e.rankEmoji}  +${e.mods} [${e.avgStars}★ @ ${e.bpm}BPM]
` +
                    `▸ PP: **${e.pp}**
` +
                    `▸ ACC: ${e.acc}%
` +
                    `▸ Playcount: ${e.playcount} • Combo: x${e.combo}/${e.comboMax} • Hits: ${e.counts}
` +
                    `▸ Score Set ${e.when}`
                ).join('');

                return new EmbedBuilder()
                    .setAuthor({ name: osuUsername, iconURL: userDetails.avatar_url, url: userDetails.profile_url })
                    .setTitle(`Top osu! ${mode.charAt(0).toUpperCase() + mode.slice(1)} Plays for ${osuUsername}`)
                    .setDescription(description)
                    .setFooter({ text: `Page ${pageIdx + 1}/${pages.length}` })
                    .setColor('#7289DA');
            };

            let page = 0;
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('prev').setLabel('⬅️ Prev').setStyle(ButtonStyle.Secondary).setDisabled(true),
                new ButtonBuilder().setCustomId('next').setLabel('Next ➡️').setStyle(ButtonStyle.Secondary).setDisabled(pages.length <= 1)
            );

            const initialEmbed = buildEmbed(0);
            const msg = await interaction.editReply({ embeds: [initialEmbed], components: [row] });
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) return i.reply({ content: '操作できるのはコマンド実行者のみです', ephemeral: true });
                await i.deferUpdate();
                if (i.customId === 'next' && page < pages.length - 1) page++;
                if (i.customId === 'prev' && page > 0) page--;
                row.components[0].setDisabled(page === 0);
                row.components[1].setDisabled(page === pages.length - 1);
                await msg.edit({ embeds: [buildEmbed(page)], components: [row] });
            });

            collector.on('end', async () => {
                row.components.forEach(btn => btn.setDisabled(true));
                await msg.edit({ components: [row] });
            });

        } catch (e) {
            console.error('Top fetch error:', e);
            await interaction.editReply('エラーが発生しました。');
        }
    }
};
