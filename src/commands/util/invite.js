import { PermissionsBitField, EmbedBuilder } from 'discord.js';
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
      scopes: ['bot', 'applications.commands'], permissions: [
        PermissionsBitField.Flags.SendMessages,
        PermissionsBitField.Flags.ManageMessages,
        PermissionsBitField.Flags.UseApplicationCommands
      ]
    });

    const embed = new EmbedBuilder()
      .setColor(this.config.colours.default)
      .setTitle(this.client.user.username)
      .setDescription(`Thanks for showing interest in ${this.client.user.username}! Click the\nlink below to invite her to your server.`)
      .setThumbnail(this.client.user.avatarURL())
      .addFields([{ name: '\u200b', value: `[Click Here](${invite})` }]);

    return channel.send({ embeds: [embed] });
  }
}
