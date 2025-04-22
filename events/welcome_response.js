// events/guildMemberAdd.js
const { Events } = require('discord.js');

const welcomeMessages = [
    `✨🐾 わーい！{user}さんがサーバーにやってきた～！\n私はChocomint、よろしくねっ💖\nいっぱい楽しんでいってね〜！`,
  
    `🌸 こんにちは、{user}さん！\nChocomintだよ〜🍫🌿\nここはとっても楽しいところだから、ゆっくりしていってね〜✨`,
  
    `🎉 {user}さんが仲間入り～！\nChocomintがご案内しますっ🍃\n一緒にたくさん思い出作ろうね〜！🥰`,
  
    `👋 はじめまして、{user}さん！\nChocomintっていいます！\n仲良くしてくれたらうれしいな〜💫`,
  
    `🌈 {user}さん、ようこそ〜！\nChocomintと申しますっ🌿\nルール読んで、のんびり楽しんでねっ！🐰`,
  
    `💖 わっ！{user}さん発見〜！\nサーバーに来てくれてありがとう〜🌟\n私はChocomint、よろしくね〜！🍫✨`,
];

module.exports = {
  name: Events.GuildMemberAdd,
  execute(member) {
    const channel = member.guild.channels.cache.find(
      ch => ch.name === 'welcome' && ch.isTextBased()
    );

    if (!channel) return console.log('Welcome channel not found.');

    const message = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)]
        .replace('{user}', member.user.username);

    channel.send(message);
  },
};
