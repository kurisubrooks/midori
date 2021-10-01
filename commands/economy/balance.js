const Command = require('../../core/Command');
const Database = require('../../core/Database');
const { MessageEmbed } = require('discord.js');

class Balance extends Command {
  constructor(client) {
    super(client, {
      name: 'Balance',
      description: "Get a user's balance.",
      aliases: ['balance', 'bal', 'coins', 'cheese'],
      disabled: true
    });
  }

  async run(message, channel, user) {
    if (message.pung.length > 0) {
      user = message.pung[0];
    }

    const data = await Database.Models.Bank.findOne({ where: { id: user.id } });
    const balance = data === null ? 0 : data.balance;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname || user.user.username, user.avatarURL() || user.user.avatarURL())
      .addField('Balance', `${this.config.economy.emoji} ${balance}`);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}

module.exports = Balance;
