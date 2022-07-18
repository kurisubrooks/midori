import Command from '../../core/Command';
import Database from '../../core/Database';

export default class ResetBalance extends Command {
  constructor(client) {
    super(client, {
      name: 'reset',
      description: "Sets a user's balance to 0",
      aliases: [],
      admin: true,
      disabled: true
    });
  }

  async run(message, channel, user) {
    if (message.pingedUsers.length === 0) {
      return message.reply("You didn't specify whom you want to pay!");
    }

    user = message.pingedUsers[0];

    const Bank = (await Database.Models.Bank).default;
    const recipient = await Bank.findOne({ where: { id: user.id } });

    if (user.bot || user.user.bot) {
      return message.reply('Bots are not enabled for use with Economy.');
    } else if (!recipient) {
      return message.reply('You cannot reset the balance of a user who has no balance.');
    }

    await recipient.update({ balance: 0 });
    return message.reply('Balance Reset.');
  }
}
