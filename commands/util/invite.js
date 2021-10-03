import { Permissions, MessageEmbed } from 'discord.js';
import Command from '../../core/Command';

export default class Invite extends Command {
  constructor(client) {
    super(client, {
      name: 'Invite',
      description: 'Invite Midori to your own server',
      aliases: []
    });
  }

  async run(message, channel) {
    const invite = await this.client.generateInvite({
      scopes: ['bot'], permissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.MANAGE_MESSAGES]
    });

    const embed = new MessageEmbed()
      .setColor(this.config.colours.default)
      .setTitle('Midori')
      .setDescription('Thanks for showing interest in Midori! Click the\nlink below to invite her to your server.')
      .setThumbnail(this.client.user.avatarURL())
      .addField('\u200b', `[Click Here](${invite})`);

    return channel.send({ embeds: [embed] });
  }
}
