import { EmbedBuilder } from 'discord.js';
import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'Leaderboard',
      description: 'Get the richest users.',
      aliases: []
    });
  }

  async run(message, channel) {
    const Bank = (await Database.Models.Bank).default;
    const db = await Bank.findAll({ order: [['balance', 'DESC']] });
    const embed = new EmbedBuilder()
      .setTitle('Leaderboard')
      .setColor(this.config.colours.default);

    db.slice(0, 9).map(i => i.id).forEach((value, index) => {
      const user = message.guild.members.cache.get(value);
      if (user && !user.user.bot) {
        embed.addFields([{
          name: `${index + 1}. ${user.nickname || user.user.username}`,
          value: `${this.config.economy.emoji} ${db.find(i => i.id === value).balance}`,
          inline: true
        }]);
      }
    });

    return channel.send({ embeds: [embed] });
  }
}
