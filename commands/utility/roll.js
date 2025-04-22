const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('roll')
    .setDescription('ランダムな整数を出します（デフォルト：0～100）')
    .addIntegerOption(option =>
      option
        .setName('min')
        .setDescription('最小値（省略可能）')
    )
    .addIntegerOption(option =>
      option
        .setName('max')
        .setDescription('最大値（省略可能）')
    ),
  async execute(interaction) {
    const min = interaction.options.getInteger('min');
    const max = interaction.options.getInteger('max');

    // Case 1: If only one is provided, throw error
    if ((min !== null && max === null) || (min === null && max !== null)) {
      await interaction.reply({
        content: '⚠️ 最小値と最大値の両方を入力してください、または両方省略してください！',
        ephemeral: true
      });
      return;
    }

    // Case 2: If both are null, use default range
    const finalMin = min ?? 0;
    const finalMax = max ?? 100;

    const lower = Math.min(finalMin, finalMax);
    const upper = Math.max(finalMin, finalMax);

    const roll = Math.floor(Math.random() * (upper - lower + 1)) + lower;

    await interaction.reply({
      content: `🎲 ${lower} ～ ${upper} の間で ${roll} が出ました！`
    });
  },
};
