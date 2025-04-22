module.exports = {
    name: 'messageCreate',
    async execute(message) {
      if (message.author.bot) return;
  
      // Regex to match numbers followed by "pp", like 100pp, 55pp, 1000pp
      const ppPattern = /[\d０-９]{1,4}pp/;

  
      if (ppPattern.test(message.content)) {
        const replies = [
          'ナイスpp！🔥',
          'おめでとう〜！🎉',
          '調子いいね！💯',
          'そのpp、羨ましい！😍',
          'もっと稼げそう！💪',
          'やるじゃん！👏',
          '成長してるね！📈',
          'そのスコア、惚れる…✨',
          'ppが増えてる！👍',
          '神プレイだったんだろうな！😎',
        ];
  
        const reply = replies[Math.floor(Math.random() * replies.length)];
        // Simulate typing...
        await message.channel.sendTyping();
        await new Promise((resolve) => setTimeout(resolve, 7000));
        message.reply(reply);
      }
    },
  };