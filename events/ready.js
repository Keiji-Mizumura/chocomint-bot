const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`${client.user.tag} is now online!`);
    client.user.setActivity({
      name: 'osu!',
      type: ActivityType.Playing,
    });
  },
};
