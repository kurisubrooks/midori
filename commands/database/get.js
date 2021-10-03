import Command from '../../core/Command';
import Database from './set';

export default class Get extends Command {
  constructor(client) {
    super(client, {
      name: 'Get',
      description: 'Get Data from the Database',
      aliases: []
    });
  }

  async run(message, channel, user) {
    const db = await Database.getUser(user);
    await message.reply(`\`\`\`js\n${JSON.stringify(JSON.parse(db.data), null, 4)}\n\`\`\``);
    return false;
  }
}
