const { Events, ActivityType } = require('discord.js');
const { console_log } = require('../utilities/console');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log("╔" + "═".repeat(45) + "╗");
    console.log("║" + " ".repeat(45) + "║");
    console.log("║" + " ".repeat(18) + "CHOCOMINT" + " ".repeat(18) + "║");
    console.log("║" + " ".repeat(45) + "║");
    console.log("╚" + "═".repeat(45) + "╝");    
    
    console_log(`${client.user.username} is now online!`);
    client.user.setActivity({
      name: 'osu!',
      type: ActivityType.Playing,
    });
  },
};
