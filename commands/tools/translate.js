const { MessageEmbed } = require('discord.js');
const { translate } = require('googletrans');
const Command = require('../../core/Command');
const langs = require('./languages.json');

class Translate extends Command {
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

    return null;
  }

  async run(message, channel, user, args) {
    if (args.length < 1) {
      return message.reply('Please provide a query');
    }

    const langs = args[0].split(',');
    let to = this.validate(langs[0].toLowerCase()).code;
    let from = langs.length > 1 ? this.validate(langs[1]).code : null;
    let query = args.slice(1).join(' ');

    if (!this.validate(to)) {
      return message.reply(`the value in the 'from' field (${to}), is not a valid language, or is unsupported.`);
    }

    if (from !== null) {
      if (!this.validate(from)) {
        return message.reply(`the value in the 'from' field (${from}), is not a valid language, or is unsupported.`);
      }
    }

    if (query === '^') {
      this.log('Using Previous Message as Query', 'debug');
      const res = await channel.messages.fetch({ before: message.id, limit: 1 });
      query = res.first().content;
    } else if (Number(query)) {
      this.log('Using Given Message (from ID) as Query', 'debug');
      const res = await channel.messages.fetch(query);
      if (!res) return message.reply('please provide a valid message ID.');
      query = res.content;
    }

    const response = await translate(query, { to, from })
      .catch(error => this.error(error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setAuthor(user.nickname, user.displayAvatarURL())
      .addField(this.validate(from || response.src).name, query)
      .addField(this.validate(to).name, response.text);

    await channel.send({ embed });
    return this.delete(message);
  }
}

module.exports = Translate;
