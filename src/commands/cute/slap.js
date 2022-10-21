import { EmbedBuilder } from 'discord.js';
import request from 'request-promise';
import Command from '../../core/Command';

export default class Slap extends Command {
  constructor(client) {
    super(client, {
      name: 'Slap',
      description: 'Slap someone!',
      aliases: []
    });
  }

  async run(message, channel, user) {
    if (message.pingedUsers.length === 0) {
      return message.reply("You didn't specify whom you want to slap!");
    }

    const target = message.pingedUsers[0];

    if (target.id === user.id) {
      user = this.client.user;
    }

    const response = await request({
      headers: { 'User-Agent': 'Mozilla/5.0' },
      uri: 'https://rra.ram.moe/i/r',
      qs: { type: 'slap', nsfw: false },
      json: true
    }).catch(error => this.error(error.response.body.error, channel));

    if (!response) return false;

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setDescription(`**${user.tag}** slapped **${target.user.tag}**`)
      .setImage(`https://cdn.ram.moe${response.path.replace('i/', '')}`);

    return channel.send({ embeds: [embed] });
  }
}
