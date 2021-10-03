import { MessageEmbed } from 'discord.js';
import request from 'request-promise';
import moment from 'moment';
import cheerio from 'cheerio';
import Command from '../../core/Command';

export default class Time extends Command {
  constructor(client) {
    super(client, {
      name: 'Time',
      description: 'Get the Time for your Given Location',
      aliases: ['clock', 'tz']
    });
  }

  async run(message, channel, user, args) {
    if (args.length < 1 || (args.length === 1 && args[0] === 'in')) {
      return message.reply('Please provide a query');
    }

    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: `http://time.is/${args.join(' ').replace(/^in/, '')}`,
      resolveWithFullResponse: true,
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;
    if (response.statusCode === 404) return this.error('No Results', channel);
    if (response.statusCode === 500) return this.error('API Error', channel);

    const $ = cheerio.load(response.body);
    const place = $('#msgdiv > h1').text();
    const date = $('#dd').text();
    const time = $('#twd').text();

    if (!place) {
      return this.error('No Results', channel);
    }

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname || user.user.username, user.user.avatarURL())
      .addField('Location', place.replace('Time in ', '').replace(' now', ''))
      .addField('Time', moment(`${time}`, 'HH:mm:ssA').format('h:mm a'), true)
      .addField('Date', date, true);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
