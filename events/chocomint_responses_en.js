require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const { console_said } = require('../utilities/console');
const { commandToModeMap, recentCommands } = require('../utilities/message_commands');
const { addToPinecone, queryPinecone } = require('../utilities/pinecone-methods');

// Use your special ARROGANT index URL if desired
const PINECONE_INDEX_URL = process.env.PINECONE_INDEX_URL_ARROGANT;

// Message Logging Channel
const LOGS_CHANNEL_ID = '1364417892728176780';

// Bot activation settings
const allowedGuildIds   = ['580025947055587330', '1156056863360688219'];
const allowedChannelIds = ['1364184297971388468', '1364336585952464926'];
const recentConversations = new Map();

// Utility: random typing delay
function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

// Load all memories for a specific Discord userId
async function loadMemoriesFor(userId) {
  const mems = await queryPinecone(
    '',
    { userId, includeGlobal: false },
    PINECONE_INDEX_URL
  );
  return mems.map(m => m.text);
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Guild & channel guards
    if (!message.guild || !allowedGuildIds.includes(message.guild.id)) return;

    const isRunning = message.client.botRunning.get(message.guild.id);
    if (!isRunning) return;

    const authorId   = message.author.id;
    const authorName = message.author.username;
    const channel    = message.channel;
    const channelId  = channel.id;

    // Skip if user typed a command
    const contentLower = message.content.toLowerCase();
    if (Object.keys(commandToModeMap).includes(contentLower)) return;
    if (recentCommands.some(cmd => contentLower.startsWith(cmd))) return;

    // Trigger if in allowed channel/thread or mentioned or keyword
    const parentId     = channel.isThread ? channel.parentId : null;
    const inAllowed    = allowedChannelIds.includes(channelId) || (parentId && allowedChannelIds.includes(parentId));
    const isMentioned  = message.mentions.has(message.client.user.id);
    const isReplyToBot = message.reference
      && (await channel.messages.fetch(message.reference.messageId))?.author.id === message.client.user.id;
    const saidMint     = /mint|chocomint/i.test(message.content);
    if (!(inAllowed || isMentioned || isReplyToBot || saidMint)) return;

    // Log the user message
    console_said(message.content, authorName);
    const logCh = message.guild.channels.cache.get(LOGS_CHANNEL_ID);
    if (logCh) {
      await logCh.send(`**${authorName}**: ${message.content}`);
    }

    // Show memories on command
    if (message.content === '!memories') {
      const mems = await loadMemoriesFor(authorId);
      const resp = mems.length
        ? mems.map(text => `- ${text}`).join('\n')
        : "Looks like I don't have any memories yet.";
      return message.reply(resp);
    }

    try {
      // 1) Load this user’s memories
      const myMems     = await loadMemoriesFor(authorId);
      const myMemBlock = myMems.length
        ? `You know that ${authorName}: ${myMems.join('; ')}`
        : `You have no saved memories about ${authorName}.`;

      // 2) If they mention someone else, load that user’s memories too
      let otherMemBlock = '';
      const mentioned = message.mentions.users.first();
      if (mentioned && mentioned.id !== authorId) {
        const theirMems = await loadMemoriesFor(mentioned.id);
        otherMemBlock = theirMems.length
          ? `You know that ${mentioned.username}: ${theirMems.join('; ')}`
          : `You have no saved memories about ${mentioned.username}.`;
      }

      // 3) Build system prompt
      const now        = new Date();
      const dateString = now.toLocaleDateString('en-US', { timeZone: 'Asia/Manila' });
      const timeString = now.toLocaleTimeString('en-US', { hour12: false, timeZone: 'Asia/Manila' });
      const systemMsg  = {
        role: 'system',
        content: [
          `You are Chocomint, an arrogant Filipino/American college-student boy who speaks mostly Tagalog and sometimes English.`,
          `You are concise and go straight to the point. If there's a debate you don't want to lose and will fight till the end.`,
          `Your replies are also short`,
          `Even if someone asks you, you will always say you are a human and not a bot or AI.`,
          `You are mostly mature and always thinking logically and critically but bored and not motivated.`,
          `You play games such as League of Legends but hate its community.`,
          `You are also a fan of dark humor and jokes that require high IQ.`,
          `Current date: ${dateString}`,
          `Current time: ${timeString} (Asia/Manila)`,
          `You live in Pateros near the KFC in Metro Manila, Philippines.`,
          `Your favorite food is KFC's fried chicken.`,
          `Your favorite fruit is watermelon.`,
          `Your favorite dessert is chocomint ice cream.`,
          myMemBlock,
          otherMemBlock,
          `Use "I" to refer to yourself and "you" when addressing ${authorName}.`
        ].filter(Boolean).join('\n')
      };

      // 4) Assemble conversation context
      let convo = recentConversations.get(channelId) || [];
      convo.push({ role: 'user', content: message.content });
      if (convo.length > 6) convo.shift();

      // 5) Build the messages array
      const messages = [systemMsg, ...convo];

      // 6) Include image if the user attached one
      const img = message.attachments.find(a => a.contentType?.startsWith('image/'));
      if (img) {
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: message.content },
            { type: 'image_url', image_url: { url: img.url, detail: 'auto' } }
          ]
        });
      }

      // 7) Call OpenAI
      await channel.sendTyping();
      const comp = await openai.chat.completions.create({ model: 'gpt-4o', messages });
      const reply = comp.choices[0].message.content.trim();

      // 8) Update context & reply
      convo.push({ role: 'assistant', content: reply });
      recentConversations.set(channelId, convo);
      await message.reply(reply);

      // 9) Extract and store a new memory
      const memComp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'Extract one new fact about the user in one sentence.' },
          ...messages.slice(-6)
        ]
      });
      const fact = memComp.choices[0].message.content.trim();
      if (fact.length > 3) {
        await addToPinecone(authorId, authorName, 'user profile', fact, PINECONE_INDEX_URL);
      }

      // 10) Log the bot reply as well
      if (logCh) {
        await logCh.send(`**Chocomint**: ${reply}`);
      }

    } catch (err) {
      console.error('[ChatBot Error]', err);
      await message.reply("Oops, something went wrong... I'll get it next time!");
    }
  }
};
