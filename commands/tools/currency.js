import { MessageEmbed } from 'discord.js';
import request from 'request-promise';
import Command from '../../core/Command';

export default class Currency extends Command {
  constructor(client) {
    super(client, {
      name: 'Currency',
      description: 'Converts Currency',
      aliases: ['m', 'money']
    });
  }

  async run(message, channel, user, args) {
    if (args.length < 1) {
      return message.reply('Please provide a query');
    }

    const response = await request({
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': this.keychain.sherlock
      },
      uri: 'https://api.kurisubrooks.com/api/compute/currency',
      body: { query: args.join(' ') },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname, user.avatarURL())
      .addField('Query', response.query)
      .addField('Result', response.output.display);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
