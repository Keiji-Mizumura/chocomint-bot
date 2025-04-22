require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { console_said } = require('../utilities/console');

const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const PINECONE_INDEX_URL = process.env.PINECONE_INDEX_URL_ARROGANT;

const USE_DUMMY_EMBEDDING = true;

const allowedGuildIds = ['1190333570133270638']; // replace with English server ID

// Channels/threads where Chocomint always listens
const allowedChannelIds = [
  '1364141442305491026',
  '1363993020382449674' // specific thread or channel
];

const recentConversations = new Map(); // channelId → [{ role, content }]

// Emoji & GIF support
const emojis = ['😊','😉','😄','👍','✨','🎉','💖','😜'];
const gifUrls = [
  'https://media.tenor.com/MgtLm-FPdBEAAAAi/meong-cat.gif',
    'https://media.tenor.com/yheo1GGu3FwAAAAd/rick-astley-dance.gif',
    'https://c.tenor.com/iah3Td69s70AAAAC/tenor.gif',
    'https://media.tenor.com/9gxDbLeosEEAAAAi/my-bad-oops.gif',
    'https://c.tenor.com/0BE3mYzHl6AAAAAC/tenor.gif',
    'https://media.tenor.com/4DiFwww6548AAAAj/kitty.gif',
    'https://c.tenor.com/B1mqi6kr0noAAAAd/tenor.gif',
    'https://media.tenor.com/HQEVMrJMMI0AAAAi/cat-cat-tutu.gif',
    'https://media.tenor.com/vwgWgnuqGp4AAAAi/laughing-man.gif',
    'https://c.tenor.com/soZARtKEA4AAAAAC/tenor.gif',
    'https://media.tenor.com/zkaB7Dlry8YAAAAi/hug.gif',
    'https://c.tenor.com/SJwndTvbGhwAAAAC/tenor.gif',
    'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExbDJydjdqZHhvdDF2aDVkNGdiZm55aDN4cmo5MjJpNTh3YXE3NDJvMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kcxn8ZB7t6tf8vb0wS/giphy.gif',
    'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExb210d2g1cGpwZ3RoempzNHY1NnozZTZsbnA1NTl2bXA0ZG84bjE2NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/iCM6GqQTImr8RgdIXV/giphy.gif',
    'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeGZnYTV2YzhvNjBzN2JmeWRiejd6amQ5ZTdwd29ndmpubjd1ZTFyeiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/F1P5wA3Ai0jFAAWQFA/giphy.gif',
    'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWdubzNxYzQ0NHEzMHhhcjA4YWZuZjZzYXJtbHQzb2FwZDl6Ym14NyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ppSjX2iP9Ec1ExJRsV/giphy.gif',
    'https://c.tenor.com/r0R0N3dI3kIAAAAd/tenor.gif',
    'https://media.tenor.com/3UvnQWmVmUYAAAAi/doge.gif',
    'https://media.tenor.com/1FR26R3xtfIAAAAi/raamking.gif',
];
function getRandomGif() {
  return gifUrls[Math.floor(Math.random() * gifUrls.length)];
}

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function getDummyEmbedding(text) {
  const hash = [...text].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Array(1024).fill().map((_, i) => (Math.sin(hash + i) % 1));
}

async function getEmbedding(text) {
  if (USE_DUMMY_EMBEDDING) return getDummyEmbedding(text);
  const res = await openai.embeddings.create({ model: 'text-embedding-ada-002', input: text });
  return res.data[0].embedding;
}

async function addToPinecone(userId, username, topic, memory) {
  const vector = await getEmbedding(memory);
  const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  const body = { vectors: [{
    id: vectorId,
    values: vector,
    metadata: { userId, username, topic, tags: topic.split(' '), text: memory.slice(0,500) }
  }]};
  try {
    await axios.post(
      `${PINECONE_INDEX_URL}/vectors/upsert`,
      body,
      { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
    );
    console.log(`[Pinecone Upsert] Stored "${topic}" for ${username}`);
  } catch (err) {
    console.error('[Pinecone Upsert Error]', err.response?.data?.message || err.message);
  }
}

async function queryPinecone(queryText, options = {}) {
  const { userId = null, includeGlobal = true, targetUsername = null } = options;
  const queryVector = await getEmbedding(queryText);
  let filter = {};
  if (targetUsername) filter.username = { $eq: targetUsername };
  else if (userId && !includeGlobal) filter.userId = userId;
  else if (userId && includeGlobal) filter = { $or:[{ userId },{ userId:{ $exists:true }}]};

  try {
    const res = await axios.post(
      `${PINECONE_INDEX_URL}/query`,
      { vector: queryVector, topK:5, includeMetadata:true, filter },
      { headers:{ 'Api-Key':PINECONE_API_KEY,'Content-Type':'application/json' }}
    );
    return res.data.matches.map(m => ({ text:m.metadata.text, userId:m.metadata.userId, username:m.metadata.username, topic:m.metadata.topic }));
  } catch (err) {
    console.error('[Pinecone Query Error]', err.response?.data?.message || err.message);
    return [];
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Guild check
    const guildId = message.guild?.id;
    if (!guildId || !allowedGuildIds.includes(guildId)) return;

    const userId   = message.author.id;
    const username = message.author.username;
    const channel  = message.channel;
    const channelId = channel.id;
    const channelName = channel.name || '';
    const mintKeywords = ['mint','chocomint','ミント','チョコミント','みんと','ちょこみんと'];

    console_said(message.content, username);

    // ---- TRIGGER DETECTION ----
    const parentId = channel.isThread ? channel.parentId : null;
    const isInAllowed = allowedChannelIds.includes(channelId) || (parentId && allowedChannelIds.includes(parentId));
    const isMentioned = message.mentions.has(message.client.user.id);
    const isReplyToBot = message.reference && (await channel.messages.fetch(message.reference.messageId))?.author.id === message.client.user.id;
    const saidMint = mintKeywords.some(kw => message.content.toLowerCase().includes(kw));
    const isTrigger = isInAllowed || isMentioned || isReplyToBot || saidMint;
    if (!isTrigger) return;

    // ---- DEBUG MEMORIES ----
    if (message.content === '!memories') {
      const mems = await queryPinecone('', { userId, includeGlobal:false });
      const resp = mems.length
        ? mems.map(m=>`🧠 [${m.topic}] ${m.text}`).join('\n')
        : '🕳️ 記憶がまだ何もないみたいやで。';
      return message.reply(resp);
    }

    try {
      // Long-term memory
      const pineMem = await queryPinecone(username, { userId, includeGlobal:true });
      const memSum = pineMem.length
        ? pineMem.map(m=>`・${m.username}(${m.topic}): ${m.text}`).join('\n')
        : 'ユーザーのこと、まだあんまり知らへんけど…';

      // Short-term buffer
      let convo = recentConversations.get(channelId) || [];
      convo.push({ role:'user', content:message.content });
      if (convo.length>6) convo=convo.slice(-6);

      // System prompt with short, emoji-rich instruction
      const messages = [
        { role:'system', content:
            'あなたは「チョコミント」という関西弁の女子高生ボットです。' +
            '返事は短く、絵文字をたっぷり入れてください。' +
            `\n\n【覚えてること】\n${memSum}\n【チャンネル】${channelName}`
        },
        ...convo
      ];

      // Include image
      const img = message.attachments.find(a=>a.contentType?.startsWith('image/'));
      if (img) messages.push({ role:'user', content:[{type:'text',text:message.content},{type:'image_url',image_url:{url:img.url}}] });

      // Generate reply
      const comp = await openai.chat.completions.create({ model:'gpt-4o', messages });
      let reply = comp.choices[0].message.content.trim();

      // Append random emoji
      const emoji = emojis[Math.floor(Math.random()*emojis.length)];
      reply = reply ? `${reply} ${emoji}` : emoji;

      // Decide on GIF
      const includeGif = Math.random() < 0.3;

      // Update convo buffer
      convo.push({ role:'assistant', content:reply });
      if (convo.length>6) convo=convo.slice(-6);
      recentConversations.set(channelId, convo);

      // Extract new fact
      const memComp = await openai.chat.completions.create({ model:'gpt-4o', messages:[{role:'system',content:'この会話から一文で新情報を抽出してください。'}, ...messages.slice(-6)] });
      const newFact = memComp.choices[0].message.content.trim();
      if (newFact.length>3) await addToPinecone(userId,username,'user profile',newFact);

      // Typing delay & reply
      await new Promise(r=>setTimeout(r,getRandomDelay(2000,5000)));
      await channel.sendTyping();
      await new Promise(r=>setTimeout(r,getRandomDelay(1000,5000)));

      if (includeGif) {
        const gif = getRandomGif();
        await message.reply({ content: reply, embeds:[{ image:{ url: gif } }] });
      } else {
        await message.reply(reply);
      }

    } catch (err) {
      console.error('[ChatBot Error]',err);
      await message.reply('なんかエラー出た…次は大丈夫やで！💦');
    }
  }
};
