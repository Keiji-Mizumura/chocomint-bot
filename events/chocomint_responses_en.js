require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { console_said } = require('../utilities/console');
const { commandToModeMap, recentCommands } = require('../utilities/message_commands');

// Load Pinecone configuration from env
const PINECONE_API_KEY = process.env.PINECONE_API_KEY_ARROGANT || process.env.PINECONE_API_KEY;
const PINECONE_INDEX_URL = process.env.PINECONE_INDEX_URL_ARROGANT || process.env.PINECONE_INDEX_URL;
const USE_DUMMY_EMBEDDING = true;

// Bot activation settings
const allowedGuildIds = ['580025947055587330', '1156056863360688219'];
const allowedChannelIds = ['1364184297971388468', '1364336585952464926'];
const recentConversations = new Map(); // channelId -> [{ role, content }]

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

function getDummyEmbedding(text) {
  const hash = [...text].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Array(1024).fill().map((_, i) => Math.sin(hash + i) % 1);
}

async function getEmbedding(text) {
  if (USE_DUMMY_EMBEDDING) return getDummyEmbedding(text);
  const res = await openai.embeddings.create({ model: 'text-embedding-ada-002', input: text });
  return res.data[0].embedding;
}

async function addToPinecone(userId, username, topic, memory) {
  if (!PINECONE_API_KEY || !PINECONE_INDEX_URL) return;
  const vector = await getEmbedding(memory);
  const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const body = { vectors: [{ id: vectorId, values: vector, metadata: { userId, username, topic, text: memory.slice(0, 500) } }] };
  try {
    await axios.post(
      `${PINECONE_INDEX_URL}/vectors/upsert`,
      body,
      { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Pinecone Upsert Error]', err.response?.data?.message || err.message);
  }
}

async function queryPinecone(queryText, options = {}) {
  if (!PINECONE_API_KEY || !PINECONE_INDEX_URL) return [];
  const { userId = null, includeGlobal = true, targetUsername = null } = options;
  const vector = await getEmbedding(queryText);
  let filter = {};
  if (targetUsername) filter.username = { $eq: targetUsername };
  else if (userId && !includeGlobal) filter.userId = userId;
  else if (userId) filter = { $or: [{ userId }, { userId: { $exists: true } }] };
  try {
    const res = await axios.post(
      `${PINECONE_INDEX_URL}/query`,
      { vector, topK: 5, includeMetadata: true, filter },
      { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
    );
    return res.data.matches.map(m => ({ text: m.metadata.text, userId: m.metadata.userId, username: m.metadata.username, topic: m.metadata.topic }));
  } catch (err) {
    console.error('[Pinecone Query Error]', err.response?.data?.message || err.message);
    return [];
  }
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Guild & channel checks
    const guildId = message.guild?.id;
    if (!guildId || !allowedGuildIds.includes(guildId)) return;

    const userId = message.author.id;
    const username = message.author.username;
    const channel = message.channel;
    const channelId = channel.id;
    const mintKeywords = ['mint', 'chocomint'];

    if (Object.keys(commandToModeMap).includes(message.content.toLowerCase())) return;
    if (recentCommands.some(keyword => message.content.toLowerCase().startsWith(keyword))) return;

    console_said(message.content, username);

    // Trigger logic: allowed channel, mention, reply, or keyword
    const parentId = channel.isThread ? channel.parentId : null;
    const isInAllowed = allowedChannelIds.includes(channelId) || (parentId && allowedChannelIds.includes(parentId));
    const isMentioned = message.mentions.has(message.client.user.id);
    const isReplyToBot = message.reference && (await channel.messages.fetch(message.reference.messageId))?.author.id === message.client.user.id;
    const saidMint = mintKeywords.some(kw => message.content.toLowerCase().includes(kw));
    if (!(isInAllowed || isMentioned || isReplyToBot || saidMint)) return;

    // Show memories command
    if (message.content === '!memories') {
      const mems = await queryPinecone('', { userId, includeGlobal: false });
      const resp = mems.length
        ? mems.map(m => `- [${m.topic}] ${m.text}`).join('\n')
        : "Looks like I don't have any memories yet.";
      return message.reply(resp);
    }

    // Image generation (English)
    if (/image|illustration/i.test(message.content)) {
      let raw = message.content.replace(/chocomint/gi, '').replace(/image|illustration/gi, '').replace(/please|pls/gi, '').trim();
      const userPrompt = raw || 'cute illustration';
      const prompt = `High-quality illustration, vibrant colors, detailed: ${userPrompt}`;
      try {
        await channel.sendTyping();
        const imgRes = await openai.images.generate({ prompt, n: 1, size: '512x512' });
        const imageUrl = imgRes.data[0].url;
        return message.reply({ content: `How about this?\n${prompt}`, embeds: [{ image: { url: imageUrl } }] });
      } catch (err) {
        console.error('[ImageGen Error]', err);
        return message.reply("Image generation failed, sorry!");
      }
    }

    // Chat response (text + optional image)
    try {
      // Handle time queries
      const now = new Date();
      if (/yesterday.*time/i.test(message.content)) {
        const then = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const thenTime = then.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });
        return message.reply(`24 hours ago, the time was ${thenTime} (Asia/Manila).`);
      }
      if (/what time is it|current time|time\?/i.test(message.content)) {
        const timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });
        return message.reply(`The current time is ${timeString} (Asia/Manila).`);
      }

      // Retrieve memories
      const pineMem = await queryPinecone(username, { userId, includeGlobal: true });
      const memSum = pineMem.length
        ? pineMem.map(m => `* ${m.username} (${m.topic}): ${m.text}`).join('\n')
        : "I don't know much about you yet...";

      // Short-term conversation context
      let convo = recentConversations.get(channelId) || [];
      convo.push({ role: 'user', content: message.content });
      if (convo.length > 6) convo = convo.slice(-6);

      // Dynamic system prompt with date, time & address
      const dateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
      const timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });
      const systemMsg = {
        role: 'system',
        content: 
          `You are Chocomint, living in the year ${now.getFullYear()} on ${dateString} at ${timeString} (Asia/Manila timezone).` +
          ` You live in Pateros, near the KFC in Metro Manila, Philippines.` +
          ` You are born wealthy and loves to play video games such as Valorant or League of Legends` +
          ` You love to spend money on gacha games like Genshin Impact and Honkai Star Rail` +
          ` You sometimes play osu! but really bad at it and can only clear 4 star maps, but you feel you have the potential if you tried.` +
          ` You are a college student that is arrogant, cold, and highly logical. You are not a bot even if someone asks you.` +
          ` You speak English but mostly Tagalog. Responses are concise, critical, and slightly bored.` +
          ` You also have some dark humor and double standards. Your favorite food is KFC and watermelon with chocomint ice cream.` +
          `\nMemories:\n${memSum}`
      };
      const messages = [systemMsg, ...convo];

      // Include image from user if present
      const img = message.attachments.find(a => a.contentType?.startsWith('image/'));
      if (img) {
        messages.push({ role: 'user', content: [
          { type: 'text', text: message.content },
          { type: 'image_url', image_url: { url: img.url, detail: 'auto' } }
        ] });
      }

      // Generate reply
      await channel.sendTyping();
      const comp = await openai.chat.completions.create({ model: 'gpt-4o', messages });
      const reply = comp.choices[0].message.content.trim();

      // Update conversation context
      convo.push({ role: 'assistant', content: reply });
      if (convo.length > 6) convo = convo.slice(-6);
      recentConversations.set(channelId, convo);

      // Extract and store a new memory
      const memComp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Extract one new fact about the user from this conversation in one sentence.' },
          ...messages.slice(-6)
        ]
      });
      const newFact = memComp.choices[0].message.content.trim();
      if (newFact.length > 3) await addToPinecone(userId, username, 'user profile', newFact);

      console_said(reply, 'Chocomint');
      await new Promise(r => setTimeout(r, getRandomDelay(500, 2000)));
      return message.reply(reply);
    } catch (err) {
      console.error('[ChatBot Error]', err);
      return message.reply("Oops, something went wrong... I'll get it next time!");
    }
  }
};
