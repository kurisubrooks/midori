import { MessageEmbed } from 'discord.js';
import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'Leaderboard',
      description: 'Get the richest users.',
      aliases: ['top', 'richest', 'list']
    });
  }

  async run(message, channel) {
    const Bank = (await Database.Models.Bank).default;
    const db = await Bank.findAll({ order: [['balance', 'DESC']] });
    const embed = new MessageEmbed()
      .setTitle('Leaderboard')
      .setColor(this.config.colours.default);

    console.log(db, message.guild.members.cache);

    let total = 0;

    for (const index of db) {
      if (total > 9) break;

      const user = message.guild.members.cache.get(db[index].id);
      console.log(total, user);
      if (!user || user.user.bot) continue;

      embed.addField(
        `${total + 1}. ${user.nickname || user.user.username}`,
        `${this.config.economy.emoji} ${db[index].balance}`, true);

      total += 1;
    }

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
