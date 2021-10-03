import Command from '../../core/Command';
import Database from '../../core/Database';

export default class Prefix extends Command {
  constructor(client) {
    super(client, {
      name: 'Prefix',
      description: "Set your server's prefix",
      aliases: ['setprefix']
    });
  }

  async run(message, channel, user, args) {
    const Config = (await Database.Models.Config).default;
    const db = await Config.findOne({ where: { id: message.guild.id } });

    if (!db) {
      return message.reply("Your server doesn't exist in the database! This is most likely an internal error. Run the command again, and if it fails again, please contact <@132368482120499201>.");
    }

    if (args.length === 0) {
      return message.reply(`The prefix for this server is: \`${db.prefix}\``);
    }

    if (!db.owners.includes(user.id)) {
      return message.reply("Only users with the 'Administrator' permission may use this command.");
    }

    if (args.length > 1) {
      return message.reply('Only 1 argument is accepted for this command.');
    }

    await db.update({ prefix: args[0] });
    return message.reply(`Prefix successfully changed to \`${args[0]}\``);
  }
}
