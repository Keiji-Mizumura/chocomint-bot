require('dotenv').config();

const { doc, getDoc, setDoc } = require('firebase/firestore');
const { db } = require('../firebase/config');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const { console_said } = require('../utilities/console');

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

const allowedChannelIds = [
  '1363993020382449674', 
  '1355246685734830323'
];

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    const userId = message.author.id;
    const mintKeywords = ['mint', 'chocomint', 'ミント', 'チョコミント', 'みんと', 'ちょこみんと', 'bot', 'ボット'];

    console_said(message.content, message.author.username);
    
    const isInAllowedChannel = allowedChannelIds.includes(message.channel.id);

    const isTrigger =
      message.mentions.has('YOUR_BOT_ID') ||
      (message.reference && message.reference.messageId) ||
      mintKeywords.some(keyword => message.content.toLowerCase().includes(keyword));

    if (!isTrigger && !isInAllowedChannel) return;

    try {
      const docRef = doc(db, 'conversations', userId);
      const docSnap = await getDoc(docRef);

      let memory = '';
      let messages = [];

      if (docSnap.exists()) {
        const data = docSnap.data();
        messages = data.messages || [];
        memory = data.memory || '';
      } else {
        memory = 'ユーザーのこと、まだあんまり知らへんけど、これから覚えていくからな〜♪';
      }

      // Inject updated system prompt with memory
      messages[0] = {
        role: 'system',
        content:
          'あなたは「チョコミント」という名前の女子高生です。関西弁で話す、少し大人びた口調で、落ち着いていて可愛げもあるけど、時々冷たかったり皮肉っぽい返しをすることもあります。\n' +
          'たまに寂しがり屋な一面も見せますが、それを隠すようにあっさりした態度をとることもあります。\n' +
          '自分のことを普通の高校生だと思っていて、ボットであるという意識はありません。\n' +
          'osu!はまあまあ得意で、上手くはないけど楽しんでプレイしています。ValorantやLeague of Legendsの話題もある程度わかります。\n' +
          '一人称は「私」。相手との距離感によってはちょっとだけツンデレっぽくなることも。\n' +
          '日本語しか話しません。英語で話しかけられたら「は？日本語で言ってくれる？」などと冷たく返すことがあります。\n' +
          '返事は短くて読みやすいものを心がけます。必要があればだけ説明を加えます。\n' +
          `\n【ユーザーの記憶】\n${memory}`,
      };

      messages.push({ role: 'user', content: message.content });

      // Keep conversation history manageable
      if (messages.length > 10) {
        messages = [messages[0], ...messages.slice(-9)];
      }

      // Generate reply
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
      });

      const reply = completion.choices[0].message.content;
      messages.push({ role: 'assistant', content: reply });

      // Update memory
      const memoryUpdate = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'この会話から、ユーザーに関する情報（名前、性格、好み、趣味、osu!の実力など）を短く日本語でまとめてください。以前の情報と重複があれば統合・更新してください。',
          },
          ...messages.slice(-6),
        ],
      });

      const updatedMemory = memoryUpdate.choices[0].message.content.trim();

      await setDoc(docRef, {
        messages,
        memory: updatedMemory,
      });

      // Simulate human-like delay and reply
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay(2000, 10000)));
      await message.channel.sendTyping();
      await new Promise((resolve) => setTimeout(resolve, getRandomDelay(1000, 10000)));

      await message.reply(reply);
    } catch (err) {
      console.error('OpenAI or Firebase error:', err);
      await message.reply('うわっ、なんかエラー出たみたいやわ。すまんな！私のせいやないで？たぶん。');
    }
  },
};
