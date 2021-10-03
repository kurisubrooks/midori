import { MessageEmbed } from 'discord.js';
import request from 'request-promise';
import Command from '../../core/Command';

export default class Kiss extends Command {
  constructor(client) {
    super(client, {
      name: 'Kiss',
      description: 'Kiss someone!',
      aliases: ['kissu']
    });
  }

  async run(message, channel, user) {
    if (message.pingedUsers.length === 0) {
      return message.reply("You didn't specify whom you want to kiss!");
    }

    const target = message.pingedUsers[0];

    if (target.id === user.id) {
      user = this.client.user;
    }

    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://rra.ram.moe/i/r',
      qs: { type: 'kiss', nsfw: false },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setDescription(`**${user.tag}** kissed **${target.user.tag}**`)
      .setImage(`https://cdn.ram.moe${response.path.replace('i/', '')}`);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
