const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('canvas');

const count_image = require('./count_display_images.json');
const rank_achieve_image = require('./rank_achieve_images.json');

async function safeLoadImage(url, fallback = null) {
    try {
      return await loadImage(url);
    } catch (error) {
      console.warn(`Failed to load image: ${url}`, error);
      return fallback;
    }
}

function formatAccuracy(acc) {
    return (acc * 100).toFixed(2) + '%';
}

async function createCoverAttachment(score, beatmap, index) {
    const imageUrl = beatmap.beatmapset.covers['cover@2x'];
    const res = await fetch(imageUrl);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const img = await loadImage(buffer);
  
    const canvas = createCanvas(img.width, 640);
    const ctx = canvas.getContext('2d');
  
    // Overlay rectangle
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Data Overlay rectangle
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Draw the background image
    ctx.drawImage(img, 0, canvas.height - img.height);
  
    // Overlay rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, canvas.height - img.height, canvas.height - img.height);
  
    // Data Overlay rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(20, canvas.height - img.height + 20, canvas.width / 2, img.height - 40);
  
    const totalScore = score.score ?? 0;
  
    const count300 = score.statistics.count_300 ?? 0;
    const countGeki = score.statistics.count_geki ?? 0;
    const count100 = score.statistics.count_100 ?? 0;
    const countKatu = score.statistics.count_katu ?? 0;
    const count50 = score.statistics.count_50 ?? 0;
    const countMiss = score.statistics.count_miss ?? 0;
  
    const maxCombo = score.max_combo;
    const accuracy = formatAccuracy(score.accuracy);
  
    const scorePP = Math.round(score.pp ?? 0);
  
    const mods = score.mods.join('');
  
    // Score
  
    ctx.font = 'bold 20px Yu Gothic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('スコア', 70, canvas.height - img.height + 50);
  
    ctx.textAlign = 'right';
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(totalScore, 660, canvas.height - img.height + 80);
  
    const count_img_size = 80;
  
    const count_50_image = await safeLoadImage(count_image.count_50);
    const count_100_image = await safeLoadImage(count_image.count_100);
    const count_300_image = await safeLoadImage(count_image.count_300);
    const count_geki_image = await safeLoadImage(count_image.count_geki);
    const count_katu_image = await safeLoadImage(count_image.count_katu);
    const count_miss_image = await safeLoadImage(count_image.count_miss);
  
    const rankImage = await safeLoadImage(rank_achieve_image[score.rank]);
  
    // Data Overlay rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(30, canvas.height - img.height + 100, canvas.width / 2 - 20, img.height - 130);
  
    ctx.textAlign = 'left';
    // 300 (300 and GEKI)
    if (count_300_image) ctx.drawImage(count_300_image, 50, canvas.height - img.height + 100, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(count300, 180, canvas.height - img.height + 150);
  
    // Geki
  
    if (count_geki_image) ctx.drawImage(count_geki_image, 480, canvas.height - img.height + 100, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(countGeki, 610, canvas.height - img.height + 150);
  
    // 100 (300 and KATU)
  
    if (count_100_image) ctx.drawImage(count_100_image, 50, canvas.height - img.height + 200, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(count100, 180, canvas.height - img.height + 250);
  
    // Katu
    if (count_katu_image) ctx.drawImage(count_katu_image, 480, canvas.height - img.height + 200, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(countKatu, 610, canvas.height - img.height + 250);
  
    if (count_50_image) ctx.drawImage(count_50_image, 50, canvas.height - img.height + 300, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(count50, 180, canvas.height - img.height + 350);
  
    // Miss
    if (count_miss_image) ctx.drawImage(count_miss_image, 480, canvas.height - img.height + 300, count_img_size, count_img_size);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(countMiss, 610, canvas.height - img.height + 350);
  
    // Combo
    ctx.font = 'bold 20px Yu Gothic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('コンボ', 70, canvas.height - img.height + 400);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${maxCombo}`, 70, canvas.height - img.height + 450);
  
    // Accuracy
    ctx.font = 'bold 20px Yu Gothic';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('精度', 500, canvas.height - img.height + 400);
  
    ctx.font = '50px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(accuracy, 500, canvas.height - img.height + 450);
  
    if (rankImage) ctx.drawImage(rankImage, 1250, 200, 400, 300);
  
    if (mods.length > 0) {
      ctx.font = '50px Trebuchet MS';
      ctx.fillStyle = '#9e0000';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
  
      ctx.strokeText(`+${mods}`, canvas.width / 2 + 610, canvas.height - img.height + 300);
      ctx.fillText(`+${mods}`, canvas.width / 2 + 610, canvas.height - img.height + 300);
    }
  
    // PP
  
    ctx.font = '70px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 10;
  
    ctx.strokeText(`${scorePP}pp`, canvas.width / 2 + 400, canvas.height - img.height + 440);
    ctx.fillText(`${scorePP}pp`, canvas.width / 2 + 400, canvas.height - img.height + 440);
  
    const raw = score.created_at;
    const date = new Date(raw);
  
    // Convert to Japan time (UTC+9)
    const options = {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    };
  
    const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
    const cleanFormatted = formatted.replace(',', '');
  
    // Title & difficulty
    const title = `${beatmap.beatmapset.title} [${beatmap.version}]`;
    ctx.font = 'bold 40px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(title, 20, 50);
  
    // Beatmap Details
    ctx.font = '30px Trebuchet MS';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`Beatmap by ${beatmap.beatmapset.creator}`, 20, 85);
    ctx.fillText(`Played by ${score.user.username} on ${cleanFormatted}`, 20, 120);
  
    return new AttachmentBuilder(canvas.toBuffer('image/png'), { name: `cover-${index}.png` });
  }

module.exports = { createCoverAttachment };