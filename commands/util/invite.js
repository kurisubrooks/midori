const Command = require('../../core/Command');
const { Permissions, MessageEmbed } = require('discord.js');

class Invite extends Command {
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

module.exports = Invite;
