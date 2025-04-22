const profileCard = () => {
    const canvas = createCanvas(1920, 1080);
    const ctx = canvas.getContext('2d');

    if (!username) {
      const userData = await getUserByDiscordId(discordId);
      if (!userData) {
        return await interaction.editReply("You're not registered. Use `/register <username>` to register.");
      }
      username = userData.osu_username;
    }

    try {
      const [userRes, topPlayRes] = await Promise.all([
        fetch(`https://osu.ppy.sh/api/get_user?k=52ae0ab0149244476e7bcc8f297b665ea69a6020&u=${username}&m=${mode}`),
        fetch(`https://osu.ppy.sh/api/get_user_best?k=52ae0ab0149244476e7bcc8f297b665ea69a6020&u=${username}&m=${mode}&limit=1`)
      ]);

      if (!userRes.ok || !topPlayRes.ok) {
        throw new Error(`API Error: ${userRes.status} / ${topPlayRes.status}`);
      }

      const userData = (await userRes.json())[0];
      const topPlayData = (await topPlayRes.json())[0];
      if (!userData) {
        return await interaction.editReply(`Could not find osu! user: **${username}**`);
      }

      const userRank = getRankBadge(userData.pp_rank);

      const avatar = await safeLoadImage(`https://a.ppy.sh/${userData.user_id}`);
      const background = await safeLoadImage(getNewRankTierImage(userData.pp_rank));
      const countryFlag = await safeLoadImage(`https://osu.ppy.sh/images/flags/${userData.country}.png`);
      const badge = await safeLoadImage(userRank.img);
      const modeIcon = await safeLoadImage(getModeImage[mode]);

      if (avatar) ctx.drawImage(avatar, 70, 69, 400, 400);
      if (background) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      if (badge) ctx.drawImage(badge, 1280, 710, 260, 255);
      if (modeIcon) ctx.drawImage(modeIcon, 525, 90, 70, 70);
      if (countryFlag) ctx.drawImage(countryFlag, 523, 250, 93, 65);

      const modeNames = {
        0: 'osu!',
        1: 'osu!taiko',
        2: 'osu!catch',
        3: 'osu!mania'
      };

      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.font = 'bold 60px Trebuchet MS';
      ctx.fillText(modeNames[mode], 615, 140);

      ctx.font = 'bold 90px Trebuchet MS';
      ctx.fillText(userData.username, 655, 310);

      ctx.font = 'bold 40px Trebuchet MS';
      ctx.fillText(getCountryName(userData.country), 523, 410);
      ctx.fillText(`#${Number(userData.pp_country_rank).toLocaleString()}`, 523, 455);

      ctx.font = 'bold 150px Trebuchet MS';
      ctx.fillText(`#${Number(userData.pp_rank).toLocaleString()}`, 60, 780);

      ctx.font = 'bold 60px Trebuchet MS';
      ctx.fillText(`${Number(userData.accuracy).toFixed(2)}%`, 60, 925);
      ctx.fillText(Number(userData.ranked_score).toLocaleString(), 430, 925);

      ctx.font = 'bold 50px Trebuchet MS';
      ctx.fillText(convertSecondsToHours(userData.total_seconds_played), 60, 1045);
      ctx.fillText(Number(userData.playcount).toLocaleString(), 430, 1045);

      ctx.textAlign = 'right';

      ctx.font = 'bold 170px Trebuchet MS';
      ctx.fillText(Math.round(userData.pp_raw).toLocaleString(), 1750, 225);

      ctx.textAlign = 'left';
      ctx.font = 'bold 80px Trebuchet MS';
      ctx.fillText(`${Math.round(topPlayData.pp)}pp`, 1200, 505);

      ctx.textAlign = 'center';
      ctx.font = 'bold 50px Trebuchet MS';
      ctx.fillText(userData.count_rank_ssh, 1050, 680);
      ctx.fillText(userData.count_rank_ss, 1240, 680);
      ctx.fillText(userData.count_rank_sh, 1410, 680);
      ctx.fillText(userData.count_rank_s, 1565, 680);
      ctx.fillText(userData.count_rank_a, 1730, 680);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';

      ctx.font = 'bold 70px Yu Gothic';
      ctx.fillText(userRank.title_jp, 1410, 1040);

      ctx.fillStyle = "white";

      ctx.textAlign = 'right';

      ctx.font = 'bold 90px Trebuchet MS';
      ctx.fillText(Math.floor(userData.level), 1850, 460);

      const levelProgress = (userData.level - Math.floor(userData.level)).toFixed(2) * 100;
      const progressColor = getProgressBarColor(userData.pp_rank);
      drawProgressBar(ctx, 523, 342, 1340, 20, levelProgress, progressColor); // x, y, width, height
    }
    
