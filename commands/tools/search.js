import { EmbedBuilder } from 'discord.js';
import request from 'request-promise';
import Command from '../../core/Command';

export default class Search extends Command {
  constructor(client) {
    super(client, {
      name: 'Search',
      description: 'Return Google Search Results',
      aliases: ['s', 'google', 'find']
    });
  }

  async run(message, channel, user, args) {
    if (args.length < 1) {
      return message.reply('Please provide a query');
    }

    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://www.googleapis.com/customsearch/v1',
      json: true,
      qs: {
        cx: this.keychain.google.cx,
        key: this.keychain.google.search,
        num: 1,
        q: args.join(' ') // eslint-disable-line id-length
      }
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    if (response.searchInformation.totalResults !== '0') {
      const result = response.items[0];
      const link = decodeURIComponent(result.link);

      const embed = new EmbedBuilder()
        .setColor(this.config.colours.default)
        .setAuthor({ name: user.nickname || user.user.username, iconURL: user.user.avatarURL() })
        .setURL(link)
        .setTitle(result.title)
        .setDescription(result.snippet)
        .setFooter({ text: result.link, url: result.link });

      if (result.pagemap && result.pagemap.cse_thumbnail) embed.setThumbnail(result.pagemap.cse_thumbnail[0].src);

      return channel.send({ embeds: [embed] });
    }

    return false;
  }
}
