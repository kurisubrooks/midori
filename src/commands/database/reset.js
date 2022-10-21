import Command from '../../core/Command';
import Database from './set';

export default class Reset extends Command {
  constructor(client) {
    super(client, {
      name: 'Reset',
      description: "Reset a User's Data in the Database",
      aliases: []
    });
  }

  async run(message, channel, user) {
    const db = await Database.getUser(user);
    await db.update({ data: JSON.stringify(Database.getTemplate()) });
    this.log(`${user.username} deleted their db entry`, 'debug');
    return message.reply('Your database entry has been reset.');
  }
}

