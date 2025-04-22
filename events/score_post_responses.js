module.exports = {
    name: 'messageCreate',
    async execute(message) {
      if (message.author.bot) return;
  
      const allowedChannels = ['1309867794371706931', '1363265670770458794', '1359204683192995840']; // Add your channel IDs here
  
      if (!allowedChannels.includes(message.channel.id)) return;
  
      const hasMedia = message.attachments.some(attachment => {
        const type = attachment.contentType || '';
        return type.startsWith('image/') || type.startsWith('video/');
      });
  
      if (hasMedia) {
        const osuPraises = [
          'いいスコアだね！',
          'これは高スコア！',
          '上手すぎ！',
          'まじで神プレイ！',
          'さすが！',
          'SSランクも夢じゃないね！',
          'その精度、尊敬する！',
          '努力の成果だね！',
          '完璧すぎる！',
          '推せる…！',
        ];
  
        const randomPraise = osuPraises[Math.floor(Math.random() * osuPraises.length)];
  
        // React with a heart
        try {
          await message.react('❤️');
          await message.react('🤩');
        } catch (error) {
          console.error('Failed to react:', error);
        }
        // Simulate typing...
        await message.channel.sendTyping();
        // Add a delay (e.g., 1.5 seconds)
        await new Promise((resolve) => setTimeout(resolve, 5000));
        // Reply with a random praise
        message.reply(randomPraise);
      }
    },
  };
  