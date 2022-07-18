import { EmbedBuilder } from 'discord.js';
import request from 'request-promise';
import Command from '../../core/Command';

export default class Compute extends Command {
  constructor(client) {
    super(client, {
      name: 'Compute',
      description: 'Computes Computations',
      aliases: ['c', 'comp', 'convert']
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
      uri: 'https://api.kurisubrooks.com/api/compute/convert',
      body: { query: args.join(' ') },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname || user.user.username, user.user.avatarURL())
      .addFields([
        { name: 'Query', value: response.query },
        { name: 'Result', value: response.output.display }
      ]);

    return channel.send({ embeds: [embed] });
  }
}
