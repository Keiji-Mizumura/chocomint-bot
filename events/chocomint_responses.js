require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { console_said } = require('../utilities/console');
const { commandToModeMap, recentCommands } = require('../utilities/message_commands');
const { addToPinecone, queryPinecone } = require('../utilities/pinecone-methods');

const PINECONE_INDEX_URL = process.env.PINECONE_INDEX_URL;

// Message Logging Channel
const LOGS_CHANNEL_ID = '1364417892728176780';

// Bot Activation settings
const allowedGuildIds = ['1190333570133270638', '1156056863360688219'];
const allowedChannelIds = ['1364141442305491026', '1363993020382449674', '1364336611395108926'];
const recentConversations = new Map();

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;
    const guildId = message.guild?.id;
    if (!guildId || !allowedGuildIds.includes(guildId)) return;

    const userId = message.author.id;
    const username = message.author.username;
    const channel = message.channel;
    const channelId = channel.id;
    const channelName = channel.name || '';
    const mintKeywords = ['mint', 'chocomint', 'ミント', 'チョコミント', 'みんと', 'ちょこみんと'];

    if (Object.keys(commandToModeMap).includes(message.content.toLowerCase())) return;

    if (recentCommands.some((keyword) => message.content.toLowerCase().startsWith(keyword))) return;

    const parentId = channel.isThread ? channel.parentId : null;
    const isInAllowed = allowedChannelIds.includes(channelId) || (parentId && allowedChannelIds.includes(parentId));
    const isMentioned = message.mentions.has(message.client.user.id);
    const isReplyToBot = message.reference && (await channel.messages.fetch(message.reference.messageId))?.author.id === message.client.user.id;
    const saidMint = mintKeywords.some((kw) => message.content.toLowerCase().includes(kw));
    if (!(isInAllowed || isMentioned || isReplyToBot || saidMint)) return;

    console_said(message.content, username);

    const logCh = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
    if(!logCh){
      console.error(`[Chocomint] could not find message-logs (${LOGS_CHANNEL_ID})`)
    }
    else{
      await logCh.send(`**${username}**: ${message.content}`);
    }

    if (message.content === '!memories') {
      const mems = await queryPinecone('', { userId, includeGlobal: false }, PINECONE_INDEX_URL);
      const resp = mems.length ? mems.map((m) => `🧠 [${m.topic}] ${m.text}`).join('\n') : '🕳️ 記憶がまだ何もないみたいやで。';
      return message.reply(resp);
    }

    // Image generation trigger
    if (/画像|イラスト/.test(message.content)) {
      // Extract clean prompt
      let raw = message.content
        .replace(/チョコミント/gi, '')
        .replace(/の?画像/gi, '')
        .replace(/の?イラスト/gi, '')
        .replace(/描い?て？?ください|お願い(します)?/g, '')
        .trim();
      const userPrompt = raw || 'かわいいイラスト';
      // Enhance prompt for quality
      const prompt = `High-quality anime-style illustration, vibrant colors, detailed: ${userPrompt}`;
      try {
        await channel.sendTyping();
        const imgRes = await openai.images.generate({ prompt, n: 1, size: '512x512' });
        const imageUrl = imgRes.data[0].url;
        return message.reply({
          content: `こんなんでどう？
${prompt}`,
          embeds: [{ image: { url: imageUrl } }],
        });
      } catch (err) {
        console.error('[ImageGen Error]', err);
        return message.reply('画像生成でエラー出ちゃった…ごめんね💦');
      }
    }

    try {
      const pineMem = await queryPinecone(username, { userId, includeGlobal: true}, PINECONE_INDEX_URL);

      const memSum = pineMem.length ? pineMem.map((m) => `・${m.username}(${m.topic}): ${m.text}`).join('\n') : 'まだあんまり知らんけど…';
      let convo = recentConversations.get(channelId) || [];
      convo.push({ role: 'user', content: message.content });
      if (convo.length > 6) convo = convo.slice(-6);
      const messages = [
        {
          role: 'system',
          content: `あなたは "チョコミント" という関西弁の女子高生ボットです。返事は短く、絵文字たっぷり。
                    あなたのosu!の知識は深い。
                   【覚えてること】 
                    ${memSum}
                    【チャンネル】
                    ${channelName}`,
        },
        ...convo,
      ];
      const img = message.attachments.find((a) => a.contentType?.startsWith('image/'));
      if (img) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: message.content },
            { type: 'image_url', image_url: { url: img.url, detail: 'auto' } },
          ],
        });
      }
      const comp = await openai.chat.completions.create({ model: 'gpt-4o', messages });
      let reply = comp.choices[0].message.content.trim();
      convo.push({ role: 'assistant', content: reply });
      if (convo.length > 6) convo = convo.slice(-6);
      recentConversations.set(channelId, convo);
      const memComp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: 'この会話から一文で新情報を抽出してください。' }, ...messages.slice(-6)],
      });
      const newFact = memComp.choices[0].message.content.trim();
      if (newFact.length > 3) await addToPinecone(userId, username, 'user profile', newFact, PINECONE_INDEX_URL);
      console_said(reply, 'Chocomint');
      await channel.sendTyping();
      await new Promise((r) => setTimeout(r, getRandomDelay(1000, 2000)));
      await message.reply(reply);

      if(logCh){
        await logCh.send(`**Chocomint**: ${reply}`)
      }

    } catch (err) {
      console.error('[ChatBot Error]', err);
      await message.reply('なんかエラー出た…次は大丈夫やで！💦');
    }
  },
};
