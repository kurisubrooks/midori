import { EmbedBuilder } from 'discord.js';
import { translate } from 'googletrans';

import Command from '../../core/Command';
import langs from './languages.json';

export default class Translate extends Command {
  constructor(client) {
    super(client, {
      name: 'Translate',
      description: 'Translate text with Google Translate',
      aliases: ['t'],
      args: [
        { name: 'to', desc: 'Language to convert the text *to*', takes: 'string', required: true },
        { name: 'query', desc: 'Choose your weather unit', takes: 'string', required: true },
        { name: 'from', desc: 'Language to convert the text *from*', takes: 'string' }
        // choices: langs.map(i => { return { name: i.name, value: i.code }; })
      ]
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

  async run(interaction, channel, user, args) {
    let to, from, query, deferred;

    // Handle args by type
    if (interaction.type === 'interaction') {
      to = this.validate(args.getString('to'))?.code;
      from = args.getString('from');
      query = args.getString('query');
    } else {
      if (args.length < 1) {
        return interaction.reply('Please provide a query');
      }

      const langs = args[0].split(',');
      to = this.validate(langs[0])?.code;
      from = langs.length > 1 ? this.validate(langs[1]).code : null;
      query = args.slice(1).join(' ');
    }

    // Validate `to` lang
    if (!this.validate(to) || this.validate(to).name === 'Unknown') {
      return interaction.reply({ content: `The value in the 'to' field (\`${to}\`) is not a valid language, or is not supported at this time.`, ephemeral: true });
    }

    // Validate `from` lang
    if (from !== null) {
      if (!this.validate(from)) {
        return interaction.reply({ content: `The value in the 'from' field is not a valid language, or is not supported at this time`, ephemeral: true });
      }
    }

    // Get last message for `^` query
    if (query === '^') {
      this.log('Using Previous Message as Query', 'debug');
      await interaction.deferReply();
      deferred = true;
      const res = await channel.messages.fetch({ before: interaction.id, limit: 1 });
      query = res.first().content;

    // Get message by ID for number query
    } else if (Number(query)) {
      this.log('Using Given Message (from ID) as Query', 'debug');
      await interaction.deferReply();
      deferred = true;
      const res = await channel.messages.fetch(query);
      if (!res) return interaction.editReply({ content: 'Please provide a valid message ID', ephemeral: true });
      query = res.content;
    }

    // Strip mentions and emotes
    query = query.replace(/<(@(&|!)?|#)[0-9]{17,19}>|[<a(?=:):[A-Za-z]+:[0-9]*>?/g, '');

    const response = await translate(query, { to, from })
      .catch(error => this.error(error, channel));

    if (!response) {
      if (deferred) return interaction.editReply({ content: 'Unknown Error', ephemeral: true });
      return interaction.reply({ content: 'Unknown Error', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setAuthor({ name: user.nickname || user.user.username, iconURL: user.user.avatarURL() })
      .addFields([
        { name: this.validate(from || response.src).name, value: query },
        { name: this.validate(to).name, value: response.text }
      ]);

    if (deferred) return interaction.editReply({ embeds: [embed] });
    return interaction.reply({ embeds: [embed] });
  }
}
