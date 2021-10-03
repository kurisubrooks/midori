import { MessageEmbed } from 'discord.js';
import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Balance extends Command {
  constructor(client) {
    super(client, {
      name: 'Balance',
      description: "Get a user's balance.",
      aliases: []
    });
  }

  async run(message, channel, user) {
    if (message.pingedUsers.length > 0) {
      user = message.pingedUsers[0];
    }

    const Bank = (await Database.Models.Bank).default;
    const data = await Bank.findOne({ where: { id: user.id } });
    const balance = data === null ? 0 : data.balance;

    console.log(user);

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname || user.user.username, user.user.avatarURL())
      .addField('Balance', `${this.config.economy.emoji} ${balance}`);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
