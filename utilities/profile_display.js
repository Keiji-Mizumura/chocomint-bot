const { AttachmentBuilder } = require('discord.js');

const { getNewRankTierImage, getRankBadge } = require('./rankimages');
const { getCountryName } = require('./country');
const { createCanvas, loadImage } = require('canvas');
const { drawProgressBar } = require('./progressbar');
const { getProgressBarColor } = require('./rankdetails');

const mode_images = require('./mode_images.json');

const modeNames = {
  osu: 'osu!',
  taiko: 'osu!taiko',
  fruits: 'osu!catch',
  mania: 'osu!mania',
};

async function safeLoadImage(url, fallback = null) {
  try {
    return await loadImage(url);
  } catch (error) {
    console.warn(`Failed to load image: ${url}`, error);
    return fallback;
  }
}

function convertSecondsToHours(seconds) {
  return (seconds / 3600).toFixed(2);
}

async function loadProfileDisplay(userData, userTop, mode) {
  const userRank = getRankBadge(userData.statistics.global_rank);

  const avatar = await safeLoadImage(userData.avatar_url);
  const background = await safeLoadImage(getNewRankTierImage(userData.statistics.global_rank));
  const countryFlag = await safeLoadImage(`https://osu.ppy.sh/images/flags/${userData.country_code}.png`);
  const badge = await safeLoadImage(userRank.img);
  const modeIcon = await safeLoadImage(mode_images[mode]);

  const canvas = createCanvas(1920, 1080);
  const ctx = canvas.getContext('2d');

  if (avatar) ctx.drawImage(avatar, 70, 69, 400, 400);
  if (background) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
  if (badge) ctx.drawImage(badge, 1280, 710, 260, 255);
  if (modeIcon) ctx.drawImage(modeIcon, 525, 90, 70, 70);
  if (countryFlag) ctx.drawImage(countryFlag, 523, 250, 93, 65);

  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  ctx.font = 'bold 60px Trebuchet MS';
  ctx.fillText(modeNames[mode], 615, 140);

  ctx.font = 'bold 90px Trebuchet MS';
  ctx.fillText(userData.username, 655, 310);

  ctx.font = 'bold 40px Trebuchet MS';
  ctx.fillText(getCountryName(userData.country_code), 523, 410);
  ctx.fillText(`#${Number(userData.statistics.country_rank).toLocaleString()}`, 523, 455);

  ctx.font = 'bold 150px Trebuchet MS';
  ctx.fillText(`#${Number(userData.statistics.global_rank).toLocaleString()}`, 60, 780);

  ctx.font = 'bold 60px Trebuchet MS';
  ctx.fillText(`${Number(userData.statistics.hit_accuracy).toFixed(2)}%`, 60, 925);
  ctx.fillText(Number(userData.statistics.ranked_score).toLocaleString(), 430, 925);

  ctx.font = 'bold 50px Trebuchet MS';
  ctx.fillText(convertSecondsToHours(userData.statistics.play_time), 60, 1045);
  ctx.fillText(Number(userData.statistics.play_count).toLocaleString(), 430, 1045);

  ctx.textAlign = 'right';

  ctx.font = 'bold 170px Trebuchet MS';
  ctx.fillText(Math.round(userData.statistics.pp).toLocaleString(), 1750, 225);

  ctx.textAlign = 'left';
  ctx.font = 'bold 80px Trebuchet MS';
  ctx.fillText(`${Math.round(userTop[0].pp)}pp`, 1210, 505);

  ctx.textAlign = 'center';
  ctx.font = 'bold 50px Trebuchet MS';
  ctx.fillText(userData.statistics.grade_counts.ssh, 1050, 680);
  ctx.fillText(userData.statistics.grade_counts.ss, 1240, 680);
  ctx.fillText(userData.statistics.grade_counts.sh, 1410, 680);
  ctx.fillText(userData.statistics.grade_counts.s, 1565, 680);
  ctx.fillText(userData.statistics.grade_counts.a, 1730, 680);

  ctx.fillStyle = 'rgba(255,255,255,0.7)';

  ctx.font = 'bold 70px Yu Gothic';
  ctx.fillText(userRank.title_jp, 1410, 1040);

  ctx.fillStyle = 'white';

  ctx.textAlign = 'right';

  ctx.font = 'bold 90px Trebuchet MS';
  ctx.fillText(Math.floor(userData.statistics.level.current), 1850, 460);

  const levelProgress = userData.statistics.level.progress;
  const progressColor = getProgressBarColor(userData.statistics.global_rank);
  drawProgressBar(ctx, 523, 342, 1340, 20, levelProgress, progressColor); // x, y, width, height

  const buffer = canvas.toBuffer('image/png');
  return new AttachmentBuilder(buffer, { name: 'image.png' });
}

module.exports = { loadProfileDisplay };
