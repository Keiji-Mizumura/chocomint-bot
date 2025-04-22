const { EmbedBuilder } = require('discord.js');

const { applyModsToStats } = require('./difficulty_readjust');
const { formatSeconds } = require('./format_seconds');

function buildEmbed(score, beatmapDetails, index, total, adjustedDiff) {
  const beatmap = beatmapDetails;
  const beatmapset = beatmap.beatmapset;
  const beatmapUrl = `https://osu.ppy.sh/beatmaps/${beatmap.id}`;
  const scoreMods = score.mods.length < 1 ? 'NM' : score.mods.join('');
  const adjustedDifficulty = adjustedDiff;

  const mods = score.mods;
  const hasDT = mods.includes('DT') || mods.includes('NC');
  const hasHR = mods.includes('HR');
  const hasHT = mods.includes('HT');
  const hasFL = mods.includes('FL');

  let SR = beatmap.difficulty_rating;
  if ((hasDT || hasHR || hasHT || hasFL) && adjustedDifficulty) {
    SR = adjustedDifficulty.star_rating;
  }

  if (SR === 0) {
    SR = beatmap.difficulty_rating;
  }

  const modifiedStats = applyModsToStats(beatmap, mods);

  return new EmbedBuilder()
    .setTitle(`${beatmapset.title} [${beatmap.version}] +${scoreMods}`)
    .setURL(beatmapUrl)
    .setAuthor({
      name: `${score.user.username}さんの最近のプレイ`,
      iconURL: score.user.avatar_url,
      url: `https://osu.ppy.sh/users/${score.user.id}`,
    })
    .addFields(
      { name: '⭐ Star Rating', value: `${SR.toFixed(2)}`, inline: true },
      { name: '🎵 BPM', value: `${modifiedStats.bpm}`, inline: true },
      { name: '🎶 Length', value: `${formatSeconds(beatmap.total_length)} (${beatmap.total_length}s)`, inline: true },
      { name: 'AR', value: `${modifiedStats.ar}`, inline: true },
      { name: 'OD', value: `${modifiedStats.od}`, inline: true },
      { name: 'HP', value: `${modifiedStats.hp}`, inline: true },
      { name: 'Max Combo', value: `${beatmap.max_combo || 'N/A'}`, inline: true },
      { name: 'Playcount', value: `${beatmap.playcount.toLocaleString()}`, inline: true },
      { name: 'Passcount', value: `${beatmap.passcount.toLocaleString()}`, inline: true },
      { name: 'Status', value: `${beatmap.status}`, inline: true },
      { name: 'Hit Length', value: `${formatSeconds(beatmap.hit_length)} (${beatmap.hit_length}s)`, inline: true }
    )
    .setFooter({
      text: `プレイ ${index + 1} / ${total} | ${new Date(score.created_at).toLocaleString()}`,
    })
    .setColor(0x1e90ff);
}

module.exports = { buildEmbed };