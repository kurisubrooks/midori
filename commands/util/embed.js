import Command from '../../core/Command';

export default class Embed extends Command {
  constructor(client) {
    super(client, {
      name: 'Embed',
      description: 'Preview Discord JSON Embeds',
      aliases: ['e'],
      disabled: true
    });
  }

  async run(message, channel, user, args) {
    let embed, before;

    try {
      embed = JSON.parse(args.join(' '));
      before = JSON.parse(args.join(' '));
    } catch(err) {
      message.reply('Unable to parse your JSON Object. Check the syntax and try again.');
      return this.log('Unable to parse JSON', 'error');
    }

    if (embed.colour) embed.color = embed.colour;
    if (embed.color) embed.color = Number(embed.color);

    await channel.send({ content: `\`\`\`json\n${JSON.stringify(before, null, 4)}\n\`\`\``, embeds: [embed] });
    return this.delete(message);
  }
}
