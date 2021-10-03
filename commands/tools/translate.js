import { MessageEmbed } from 'discord.js';
import { translate } from 'googletrans';
import Command from '../../core/Command';
import langs from './languages.json';

export default class Translate extends Command {
  constructor(client) {
    super(client, {
      name: 'Translate',
      description: 'Translate a Query with Google Translate',
      aliases: ['t']
    });
  }

  validate(query) {
    if (!query) return null;

    for (const obj of langs) {
      const input = query.toLowerCase();
      const item = Object.values(obj).map(val => val.toLowerCase());
      if (!item.includes(input)) continue;
      return obj;
    }

    console.log('Unknown Lang', query);
    return { name: 'Unknown', local: 'Unknown' };
  }

  async run(message, channel, user, args) {
    if (args.length < 1) {
      return message.reply('Please provide a query');
    }

    const langs = args[0].split(',');
    let to = this.validate(langs[0].toLowerCase())?.code;
    let from = langs.length > 1 ? this.validate(langs[1]).code : null;
    let query = args.slice(1).join(' ');

    if (!this.validate(to)) {
      return message.reply(`The value in the 'from' field is not a valid language, or is not supported at this time.`);
    }

    if (from !== null) {
      if (!this.validate(from)) {
        return message.reply(`The value in the 'from' field is not a valid language, or is not supported at this time`);
      }
    }

    if (query === '^') {
      this.log('Using Previous Message as Query', 'debug');
      const res = await channel.messages.fetch({ before: message.id, limit: 1 });
      query = res.first().content;
    } else if (Number(query)) {
      this.log('Using Given Message (from ID) as Query', 'debug');
      const res = await channel.messages.fetch(query);
      if (!res) return message.reply('Please provide a valid message ID.');
      query = res.content;
    }

    // Strip mentions and emotes
    query = query.replace(/<(@(&|!)?|#)[0-9]{17,19}>|[<a(?=:):[A-Za-z]+:[0-9]*>?/g, '');

    const response = await translate(query, { to, from })
      .catch(error => this.error(error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname, user.displayAvatarURL())
      .addField(this.validate(from || response.src).name, query)
      .addField(this.validate(to).name, response.text);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
