// utilities/recent_play_embed.js
const { EmbedBuilder } = require('discord.js');
const { applyModsToStats } = require('./difficulty_readjust');
const { formatSeconds } = require('./format_seconds');

function buildEmbed(score, beatmapDetails, index, total, adjustedDiff) {
  const beatmap = beatmapDetails;
  const beatmapset = beatmap.beatmapset;
  const beatmapUrl = `https://osu.ppy.sh/beatmaps/${beatmap.id}`;
  const scoreMods = score.mods.length < 1 ? 'NM' : score.mods.join('');
  const mods = score.mods;

  const hasDT = mods.includes('DT') || mods.includes('NC');
  const hasHR = mods.includes('HR');
  const hasHT = mods.includes('HT');
  const hasFL = mods.includes('FL');

  // Determine star rating source
  let SR = beatmap.difficulty_rating;
  if ((hasDT || hasHR || hasHT || hasFL) && adjustedDiff?.star_rating) {
    SR = adjustedDiff.star_rating;
  }
  // Fallback if somehow zero or invalid
  if (typeof SR !== 'number' || isNaN(SR)) {
    SR = beatmap.difficulty_rating;
  }

  const modifiedStats = applyModsToStats(beatmap, mods);

  // Safe getters for numeric stats
  const safeNum = (n, decimals = 0) =>
    typeof n === 'number' && !isNaN(n)
      ? decimals > 0
        ? n.toFixed(decimals)
        : n.toString()
      : 'N/A';

  return new EmbedBuilder()
    .setTitle(`${beatmapset.title} [${beatmap.version}] +${scoreMods}`)
    .setURL(beatmapUrl)
    .setAuthor({
      name: `${score.user.username}さんのプレイ`,
      iconURL: score.user.avatar_url,
      url: `https://osu.ppy.sh/users/${score.user.id}`,
    })
    .addFields(
      { name: '⭐ Star Rating',   value: safeNum(SR, 2),                  inline: true },
      { name: '🎵 BPM',           value: safeNum(modifiedStats.bpm),     inline: true },
      { name: '🎶 Length',        value: `${formatSeconds(beatmap.total_length)} (${beatmap.total_length}s)`, inline: true },
      { name: 'AR',               value: safeNum(modifiedStats.ar),      inline: true },
      { name: 'OD',               value: safeNum(modifiedStats.od),      inline: true },
      { name: 'HP',               value: safeNum(modifiedStats.hp),      inline: true },
      { name: 'Max Combo',        value: beatmap.max_combo ? beatmap.max_combo.toString() : 'N/A', inline: true },
      { name: 'Playcount',        value: beatmap.playcount?.toLocaleString() ?? 'N/A', inline: true },
      { name: 'Passcount',        value: beatmap.passcount?.toLocaleString() ?? 'N/A', inline: true },
      { name: 'Status',           value: beatmap.status ?? 'N/A',        inline: true },
      { name: 'Hit Length',       value: `${formatSeconds(beatmap.hit_length)} (${beatmap.hit_length}s)`, inline: true },
      { name: '\u200B',           value: `Play ${index + 1}/${total}`,    inline: false }
    )
    .setFooter({
      text: `Played on ${new Date(score.created_at).toLocaleString()}`,
    })
    .setColor(0x1e90ff);
}

module.exports = { buildEmbed };
