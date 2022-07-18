import { EmbedBuilder } from 'discord.js';
import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Pay extends Command {
  constructor(client) {
    super(client, {
      name: 'Pay',
      description: 'Give another user some money.',
      aliases: ['send'],
      disabled: true
    });
  }

  async run(message, channel, user, args) {
    const amount = args[0];

    if (message.pingedUsers.length === 0) {
      return message.reply("You didn't specify whom you want to pay!");
    }

    user = message.pingedUsers[0];

    const Bank = (await Database.Models.Bank).default;
    const payee = await Bank.findOne({ where: { id: message.author.id } });
    const recipient = await Bank.findOne({ where: { id: user.id } });

    if (amount < 1) {
      return message.reply('Amount must be greater than 0!');
    } else if (payee.balance < amount) {
      return message.reply('You have insufficient funds to complete this transaction.');
    } else if (user.user.bot) {
      return message.reply("You can't send funds to Bots!");
    } else if (!recipient) {
      return message.reply("You can't send funds to players who aren't active!");
    }

    const balance = Number(recipient.balance) + Number(amount);
    await recipient.update({ balance });
    await payee.update({ balance: payee.balance - amount });

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setAuthor({ name: user.nickname || user.user.username, iconURL: user.user.avatarURL() })
      .addFields([
        { name: 'Paid', value: `${this.config.economy.emoji} ${amount}` },
        { name: 'Balance', value: `${this.config.economy.emoji} ${balance}` }
      ]);

    return channel.send({ embeds: [embed] });
  }
}
