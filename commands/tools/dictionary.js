const { search } = require('google-dictionary-api');
const { MessageEmbed } = require('discord.js');
const Command = require('../../core/Command');

class Dictionary extends Command {
  constructor(client) {
    super(client, {
      name: 'Dictionary',
      description: 'Get the Definition of a Word',
      aliases: ['define', 'dict', 'd']
    });
  }

  async run(message, channel, user, args) {
    if (args.length < 1) {
      return message.reply('Please provide a query');
    }

    let res = (await search(args.join(' '), 'en').catch(() => false))[0];
    if (!res) return message.reply('Sorry but I couldn\'t find the word you were looking for.');
    const { word } = res;

    let fields = [];

    for (const type of Object.keys(res.meaning)) {
      let typeArray = [];

      for (const item of res.meaning[type]) {
        let definition = item.definition;
        let example = item.example;
        let str = `**${definition}**`;
        if (example) str += `\nExample: *${example}*`;
        typeArray.push(str);
      }

      fields.push({ name: type, value: typeArray.join('\n\n') });
    }

    const embed = new MessageEmbed()
      .setAuthor(message.author.tag, message.author.displayAvatarURL())
      .setTitle(`${word}`)
      .addFields(fields);

    return channel.send({ embeds: [embed] });
  }
}

module.exports = Dictionary;
