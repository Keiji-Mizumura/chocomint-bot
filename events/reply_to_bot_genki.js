const { replies } = require('../utilities/botreplies');

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    const genki_bot_id = '871492896791093248';

    const tester_id = '449933376275742730'; // mizuke

    if (message.author.id === genki_bot_id) {
      const randomReply = replies.text[Math.floor(Math.random() * replies.text.length)];
      const randomEmoji = replies.emojis[Math.floor(Math.random() * replies.emojis.length)];
      const randomGif = replies.gif[Math.floor(Math.random() * replies.gif.length)];

      try {

        await new Promise((resolve) => setTimeout(resolve, getRandomDelay(2000,30000)));
        // Simulate typing...
        await message.channel.sendTyping();
        // Add a delay (e.g., 1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, getRandomDelay(1000,6000)));

        // Send reply and reaction
        await message.reply(randomReply);
        await message.react(randomEmoji);

        // 40% chance to include a gif
        if (Math.random() < 0.4) {
          await message.channel.send(randomGif);
        }
      } catch (error) {
        console.error('Failed to reply or react:', error);
      }

      return;
    }

    if (message.author.bot) return;
  },
};
