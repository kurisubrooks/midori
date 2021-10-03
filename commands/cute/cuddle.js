import Command from '../../core/Command';
import request from 'request-promise';
import { MessageEmbed } from 'discord.js';

export default class Cuddle extends Command {
  constructor(client) {
    super(client, {
      name: 'Cuddle',
      description: 'Cuddle someone!',
      aliases: []
    });
  }

  async run(message, channel, user) {
    if (message.pung.length === 0) {
      return message.reply("You didn't specify whom you want to cuddle!");
    }

    const target = message.pung[0];

    if (target.id === user.id) {
      user = this.client.user;
    }

    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://rra.ram.moe/i/r',
      qs: { type: 'cuddle', nsfw: false },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setDescription(`**${user.tag}** cuddled **${target.user.tag}**`)
      .setImage(`https://cdn.ram.moe${response.path.replace('i/', '')}`);

    await channel.send({ embeds: [embed] });
    return this.delete(message);
  }
}
