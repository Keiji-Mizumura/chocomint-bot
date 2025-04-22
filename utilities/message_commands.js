const commandToModeMap = {
  'osu!': 'osu',
  'osu': 'osu',
  'std': 'osu',

  'osu!taiko': 'taiko',
  'taiko': 'taiko',

  'osu!catch': 'fruits',
  'catch': 'fruits',
  'ctb': 'fruits',

  'osu!mania': 'mania',
  'mania': 'mania',
};

const recentCommands = ['!recent', '-recent', 'recent', 'rs', '最近プレイ', '最近'];

module.exports = { commandToModeMap, recentCommands}
