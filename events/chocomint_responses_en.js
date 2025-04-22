require('dotenv').config();
const OpenAI = require('openai');
const axios = require('axios');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { console_said } = require('../utilities/console');

// Load Pinecone configuration from env, with fallbacks
const PINECONE_API_KEY = process.env.PINECONE_API_KEY_ARROGANT || process.env.PINECONE_API_KEY;
const PINECONE_INDEX_URL = process.env.PINECONE_INDEX_URL_ARROGANT || process.env.PINECONE_INDEX_URL;

// Servers (guilds) where this bot is active
const allowedGuildIds = ['580025947055587330']; // replace with English server ID
// Optional: limit to specific channels within the guild
const allowedChannelIds = ['1364184297971388468'];

// Debug Pinecone config
console.log(`[Pinecone Config] URL=${PINECONE_INDEX_URL}, Key=${PINECONE_API_KEY ? 'SET' : 'MISSING'}`);

const USE_DUMMY_EMBEDDING = true;
const recentConversations = new Map(); // channelId → [{ role, content }]

// Keywords to trigger when not mentioned directly
const mintKeywords = ['mint','chocomint','ミント','チョコミント','みんと','ちょこみんと'];

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
  const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
  const body = { vectors: [{ id: vectorId, values: vector, metadata: { bot: 'arrogant', userId, username, topic, text: memory.slice(0, 500) } }] };
  try {
    await axios.post(
      `${PINECONE_INDEX_URL}/vectors/upsert`, body,
      { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[Pinecone Upsert Error]', err.response?.data?.message || err.message);
  }
}

async function queryPinecone(queryText, options = {}) {
  if (!PINECONE_API_KEY || !PINECONE_INDEX_URL) return [];
  const { userId = null, targetUsername = null } = options;
  const vector = await getEmbedding(queryText);
  let filter = { bot: { $eq: 'arrogant' } };
  if (targetUsername) filter.username = { $eq: targetUsername };
  if (userId) filter.userId = userId;
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

    // Guild check
    const guildId = message.guild?.id;
    if (!guildId || !allowedGuildIds.includes(guildId)) return;

    const userId = message.author.id;
    const username = message.author.username;
    const channelId = message.channel.id;
    const content = message.content.trim();

    console_said(content, username);

    // Channel, mention or keyword check
    const isInAllowedChannel = allowedChannelIds.includes(channelId);
    const isMentioned = message.mentions.has(message.client.user.id);
    const saidMint = mintKeywords.some(kw => content.toLowerCase().includes(kw));
    if (!isInAllowedChannel && !isMentioned && !saidMint) return;

    // Debug memory command
    if (content === '!memories') {
      const mems = await queryPinecone('', { userId });
      const reply = mems.length ? mems.map(m => `- ${m.topic}: ${m.text}`).join('\n') : 'No memories found.';
      return message.reply(reply);
    }

    // Detect image attachment
    const imageAttachment = message.attachments.find(att => att.contentType?.startsWith('image/'));

    try {
      // Long-term memory retrieval
      const mems = await queryPinecone(username, { userId });
      const summary = mems.length ? mems.map(m => `> ${m.text}`).join('\n') : '';

      // Short-term context buffer
      let convo = recentConversations.get(channelId) || [];
      convo.push({ role: 'user', content });
      if (convo.length > 6) convo = convo.slice(-6);

      // Build system + context
      const messages = [
        { role: 'system', content:
            'You are Chocomint, a college student who is arrogant, cold, and highly logical. ' +
            'You speak English and Tagalog. Replies are concise, critical, and sometimes bored.' +
            (summary ? `\n\nLong-term memory:\n${summary}` : '')
        },
        ...convo
      ];

      // If image present, add as a separate user message
      if (imageAttachment) {
        messages.push({ role: 'user', content: 'Analyze this image critically:', image_url: imageAttachment.url });
      } else {
        messages.push({ role: 'user', content });
      }

      // Generate reply
      const comp = await openai.chat.completions.create({ model: 'gpt-4o', messages });
      const reply = comp.choices[0].message.content.trim();

      // Update context
      convo.push({ role: 'assistant', content: reply });
      if (convo.length > 6) convo = convo.slice(-6);
      recentConversations.set(channelId, convo);

      // Extract new fact for memory
      const memComp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Extract one new fact about the user in one concise sentence.' },
          ...messages.slice(-6)
        ]
      });
      const newFact = memComp.choices[0].message.content.trim();
      if (newFact.length > 3) await addToPinecone(userId, username, 'user profile', newFact);

      // Typing and reply
      await new Promise(r => setTimeout(r, getRandomDelay(500, 1500)));
      await message.channel.sendTyping();
      await new Promise(r => setTimeout(r, getRandomDelay(500, 1500)));
      return message.reply(reply);
    } catch (err) {
      console.error('[ArrogantBot Error]', err);
      return message.reply('Error occurred.');
    }
  }
};
