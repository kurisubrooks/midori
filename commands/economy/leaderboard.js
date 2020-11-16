const Command = require('../../core/Command');
const Database = require('../../core/Database');
const { MessageEmbed } = require('discord.js');

class Leaderboard extends Command {
  constructor(client) {
    super(client, {
      name: 'Leaderboard',
      description: 'Get the richest users.',
      aliases: ['top', 'richest', 'list'],
      disabled: true
    });
  }

  async run(message, channel) {
    const db = await Database.Models.Bank.findAll({ order: [['balance', 'DESC']] });
    const embed = new MessageEmbed()
      .setTitle('Leaderboard')
      .setColor(this.config.colours.default);

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

    await channel.send({ embed });
    return this.delete(message);
  }
}

module.exports = Leaderboard;
